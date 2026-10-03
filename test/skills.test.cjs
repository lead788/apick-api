'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const { ApickClient, ApickApiError, SKILL_CATEGORIES, SKILL_SORTS, SERVICES } = require('../src/index.cjs');

function jsonResponse(body, status) {
	return new Response(JSON.stringify(body), { status: status || 200, headers: { 'content-type': 'application/json' } });
}

function recordingClient(reply) {
	const requests = [];
	const client = new ApickClient({
		apiKey: 'private-test-key',
		baseUrl: 'https://api.example.test',
		fetch: async (url, options) => {
			requests.push({ url, options });
			return reply(url, options);
		}
	});
	return { client, requests };
}

test('성능 측정표는 실행·과금 요청 없이 공개 JSON을 읽는다', async () => {
	const report = { schema_version: 1, skills: [], method: { minimum_cases: 20 } };
	const { client, requests } = recordingClient(() => jsonResponse(report));
	const result = await client.getSkillPerformance();
	assert.deepEqual(result.data, report);
	assert.equal(requests.length, 1);
	assert.equal(requests[0].url, 'https://api.example.test/skills/performance/data.json');
	assert.equal(requests[0].options.method, 'GET');
	assert.equal(requests[0].options.body, undefined);
});

test('Skills 조회는 GET 과 질의 문자열로, 봉투 없는 JSON 을 data 로 돌려준다', async () => {
	const page = { items: [{ skill_id: 'sk_1', title: '상품명 규칙 검사', price_points: 50 }], next_cursor: null };
	const { client, requests } = recordingClient(() => jsonResponse(page));
	const found = await client.searchSkills({ query: '상품명', category: 'marketing', limit: 5 });
	assert.deepEqual(found.data, page);
	assert.equal(requests[0].url, 'https://api.example.test/rest/skills?query=%EC%83%81%ED%92%88%EB%AA%85&category=marketing&limit=5');
	assert.equal(requests[0].options.method, 'GET');
	assert.equal(requests[0].options.body, undefined);
	assert.equal(requests[0].options.headers.Authorization, 'Bearer private-test-key');

	await client.getSkill('sk_1');
	await client.getSkillRun('run_abc');
	await client.getSkillRunResult('run_abc');
	await client.skillUsage({ limit: 50 });
	assert.deepEqual(requests.slice(1).map((entry) => entry.url), [
		'https://api.example.test/rest/skills/sk_1',
		'https://api.example.test/rest/skills/runs/run_abc',
		'https://api.example.test/rest/skills/runs/run_abc/result',
		'https://api.example.test/rest/skills/usage?limit=50'
	]);
	// Skills 는 기존 서비스 목록과 별도 계약이다.
	assert.equal(Object.keys(SERVICES).some((name) => /skill/i.test(name)), false);
	assert.equal(SKILL_CATEGORIES.length, 9);
});

test('실행은 JSON 본문과 Idempotency-Key 헤더로 보내고 중첩 입력을 그대로 유지한다', async () => {
	const run = { run_id: 'run_1', status: 'succeeded', skill: { id: 'sk_1', version: '1' }, billing: { status: 'captured', reserved_points: 0, charged_points: 50, refunded_points: 0 }, result: { passed: true } };
	const { client, requests } = recordingClient((url) => jsonResponse(url.endsWith('/quotes') ? { quote_id: 'q_1', price_points: 60, estimated_points: 62, max_points: 64, usage_priced: true } : run, url.endsWith('/runs') ? 202 : 200));
	const input = { product_name: '튼튼한 접이식 우산', options: { tags: ['a', 'b'] } };

	const quote = await client.quoteSkill('sk_1', input, { version: '1' });
	assert.equal(quote.data.quote_id, 'q_1');
	assert.deepEqual(JSON.parse(requests[0].options.body), { input, version: '1' });

	const result = await client.runSkill('sk_1', input, { idempotencyKey: 'order-20261002-0001', quoteId: 'q_1', maxCostPoints: 50, waitSeconds: 0 });
	assert.equal(result.data.billing.charged_points, 50);
	const sent = requests[1];
	assert.equal(sent.url, 'https://api.example.test/rest/skills/sk_1/runs');
	assert.equal(sent.options.method, 'POST');
	assert.equal(sent.options.headers['Idempotency-Key'], 'order-20261002-0001');
	assert.equal(sent.options.headers['Content-Type'], 'application/json');
	assert.deepEqual(JSON.parse(sent.options.body), { input, quote_id: 'q_1', max_cost_points: 50, wait_seconds: 0 });
	// 요청 헤더 이름에는 언더바를 쓰지 않는다.
	for (const name of Object.keys(sent.options.headers)) assert.doesNotMatch(name, /_/);

	await client.cancelSkillRun('run_1');
	assert.equal(requests[2].url, 'https://api.example.test/rest/skills/runs/run_1/cancel');
	assert.equal(requests[2].options.method, 'POST');
});

test('Skills 오류는 코드와 부가 정보를 보존하고 인증키를 드러내지 않는다', async () => {
	const { client } = recordingClient((url) => url.includes('sk_auth')
		? jsonResponse({ error: { code: 'AUTH_REQUIRED', message: '인증키가 필요합니다.' } }, 401)
		: jsonResponse({ error: { code: 'INVALID_INPUT', message: '입력값이 상품의 입력 형식과 맞지 않습니다.', details: { errors: [{ path: '$.product_name', message: '필수 값입니다.' }] } } }, 422));
	await assert.rejects(client.runSkill('sk_1', {}, { idempotencyKey: 'k1' }), (error) => {
		assert.ok(error instanceof ApickApiError);
		assert.equal(error.status, 422);
		assert.equal(error.serviceCode, 'INVALID_INPUT');
		assert.deepEqual(error.details, { errors: [{ path: '$.product_name', message: '필수 값입니다.' }] });
		assert.doesNotMatch(JSON.stringify(error), /private-test-key/);
		return true;
	});
	await assert.rejects(client.getSkill('sk_auth'), (error) => error.code === 'APICK_AUTH_ERROR' && error.serviceCode === 'AUTH_REQUIRED');

	const failing = new ApickClient({ apiKey: 'private-test-key', fetch: async () => { throw new Error('connect failed Authorization: Bearer private-test-key'); } });
	await assert.rejects(failing.getSkill('sk_1'), (error) => error.code === 'APICK_NETWORK_ERROR' && !/private-test-key/.test(error.message));
});

test('잘못된 Skills 인자는 요청을 보내기 전에 거부한다', () => {
	const client = new ApickClient({ apiKey: 'key', fetch: async () => { throw new Error('must not be called'); } });
	assert.throws(() => client.runSkill('sk_1', { a: 1 }), /idempotencyKey/);
	assert.throws(() => client.runSkill('sk_1', { a: 1 }, { idempotencyKey: 'has space' }), /idempotencyKey/);
	assert.throws(() => client.runSkill('sk_1', [1, 2], { idempotencyKey: 'k1' }), /input/);
	assert.throws(() => client.runSkill('sk_1', { a: 1 }, { idempotencyKey: 'k1', waitSeconds: 21 }), /waitSeconds/);
	assert.throws(() => client.runSkill('sk_1', { a: 1 }, { idempotencyKey: 'k1', maxCostPoints: 0 }), /maxCostPoints/);
	assert.throws(() => client.quoteSkill('', { a: 1 }), /skillId/);
	assert.throws(() => client.getSkillRun(''), /runId/);
	assert.throws(() => client.searchSkills({ category: 'unknown' }), /category/);
	assert.throws(() => client.searchSkills({ limit: 21 }), /limit/);
	assert.throws(() => client.skillUsage({ limit: 51 }), /limit/);
});

test('검색 순서(sort)는 정해진 값만 보내고 응답의 참고 항목을 그대로 돌려준다', async () => {
	const page = { items: [{ skill_id: 'sk_1', title: '상품명 규칙 검사', usage_label: '1만+', like_count: 34, review_count: 12, rating_average: 4.3 }], next_cursor: null };
	const { client, requests } = recordingClient(() => jsonResponse(page));
	const found = await client.searchSkills({ sort: 'popular', limit: 5 });
	assert.equal(requests[0].url, 'https://api.example.test/rest/skills?sort=popular&limit=5');
	assert.deepEqual(found.data.items[0], page.items[0]);
	assert.deepEqual([...SKILL_SORTS], ['recommended', 'popular', 'used', 'likes', 'rating', 'new', 'mine', 'liked']);
	for (const sort of SKILL_SORTS) await client.searchSkills({ sort });
	assert.equal(requests.length, 1 + SKILL_SORTS.length);
	// sort 를 생략하면 질의에 싣지 않는다(등록 순서).
	await client.searchSkills({ query: '검사' });
	assert.doesNotMatch(requests[requests.length - 1].url, /sort=/);
	assert.throws(() => client.searchSkills({ sort: 'bogus' }), RangeError);
	assert.equal(requests.length, 2 + SKILL_SORTS.length);
});
