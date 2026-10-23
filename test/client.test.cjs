'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const {
	ApickClient,
	ApickApiError,
	ApickBinaryResult,
	SERVICES,
	TTS_VOICE_IDS,
	AUTH_PROVIDERS,
	GOV24_BUNDLE_PRODUCTS
} = require('../src/index.cjs');

function jsonResponse(body, options) {
	return new Response(JSON.stringify(body), {
		status: options && options.status || 200,
		headers: { 'content-type': 'application/json' }
	});
}

test('vehicle free-text queries preserve all supplied constraints and zero-cost results', async () => {
	const requests = [];
	const client = new ApickClient({ apiKey: 'test-key', baseUrl: 'https://api.example.test', fetch: async (url, options) => {
		requests.push({ url, body: Object.fromEntries(options.body) });
		return jsonResponse({ data: { 추천: { 자동선택: false, 대안: [] } }, api: { success: true, cost: 0 } });
	} });
	await client.vehicleModelInfo({ model: '파나메라 gts 4인승 19년식' });
	await client.vehicleModelInfo({ model: 'PANAMERA GTS 19년', modelYear: '19', trim: 'GTS' });
	assert.equal(requests[0].url, 'https://api.example.test/rest/vehicle_model_info');
	assert.deepEqual(requests[0].body, { model: '파나메라 gts 4인승 19년식' });
	assert.deepEqual(requests[1].body, { model: 'PANAMERA GTS 19년', modelYear: '19', trim: 'GTS' });
});

test('exports a focused catalog of 104 named services', () => {
	assert.equal(Object.keys(SERVICES).length, 104);
	for (const name of Object.keys(SERVICES)) {
		assert.equal(typeof ApickClient.prototype[name], 'function');
		assert.match(SERVICES[name].endpoint, /^\/rest\//);
	}
});

test('keeps the API key out of enumerable client state', () => {
	const client = new ApickClient({ apiKey: 'private-test-key', fetch: async () => {} });
	assert.deepEqual(Object.keys(client), []);
	assert.doesNotMatch(JSON.stringify(client), /private-test-key/);
});

test('image quality is validated and repeated requests are never deduplicated', async () => {
	const bodies = [];
	const client = new ApickClient({ apiKey:'key', baseUrl:'https://api.example.test', fetch:async (url, options) => {
		bodies.push(Object.fromEntries(options.body));
		return jsonResponse({data:{request_id:'b'.repeat(32),image_count:1,images:[]},api:{success:true,cost:40}});
	}});
	for (const quality of ['basic','advanced','premium']) await client.generateImages('x', { quality });
	assert.deepEqual(bodies.map(body => body.quality), ['basic','advanced','premium']);
	await client.generateImages('x');
	assert.equal(Object.hasOwn(bodies.at(-1), 'quality'), false);
	await client.generateImages('x', { idempotencyKey:'short' });
	assert.equal(Object.hasOwn(bodies.at(-1), 'idempotency_key'), false);
	await assert.rejects(client.generateImages('x', { quality:'low' }), /quality must be one of/);
});

test('supports synchronous and batch image contracts without provider options', async () => {
	const requests = [];
	const client = new ApickClient({ apiKey:'key', baseUrl:'https://api.example.test', fetch:async (url, options) => {
		requests.push({url,options});
		if (url.endsWith('/images/0')) return new Response(new Uint8Array([1,2,3]), {status:200,headers:{'content-type':'image/png'}});
		return jsonResponse({data:url.includes('/jobs/')?{job_id:'a'.repeat(32),status:'waiting',requested_count:20}:{request_id:'b'.repeat(32),image_count:1,images:[]},api:{success:true,cost:0}});
	}});
	await client.generateImages('제품 사진', { imageCount:1, outputFormat:'webp', quality:'advanced', idempotencyKey:'image-test-0001' });
	await client.createImageGenerationJob('커버 시안', { imageCount:20 });
	await client.getImageJob('a'.repeat(32));
	const binary=await client.downloadImageJobImage('a'.repeat(32),0);
	assert.equal(binary.contentType,'image/png');
	assert.equal(requests[0].url,'https://api.example.test/rest/image-generation/generate');
	assert.deepEqual(Object.fromEntries(requests[0].options.body),{prompt:'제품 사진',image_count:'1',size:'1024x1024',output_format:'webp',background:'auto',quality:'advanced'});
	assert.equal(requests[0].options.headers['Content-Type'], undefined);
	assert.equal(requests[1].url,'https://api.example.test/rest/image-generation/jobs/generate');
	assert.equal(requests[2].options.method,'GET');
	await assert.rejects(client.generateImages('x',{imageCount:5}),/imageCount must not exceed 4/);
	await assert.rejects(client.generateImages('x',{count:1}),/count is not a supported image option/);
	await assert.rejects(client.generateImages('x',{outputCompression:80}),/outputCompression is not a supported image option/);
	await assert.rejects(client.generateImages('x',{size:'2560x1440'}),/size must be one of/);
	await assert.rejects(client.generateImages('x',{model:'hidden'}),/not a supported image option/);
	await assert.rejects(client.generateImages('x',{quality:'high'}),/quality must be one of: basic, advanced, premium/);
	await client.generateImages('가'.repeat(28_000));
	await assert.rejects(client.generateImages('가'.repeat(28_001)),/28000/);
	assert.equal(typeof client.cancelImageJob, 'undefined');
	await client.editImages(Uint8Array.from([1]), '손잡이 색상 변경', {
		filename:'source.webp', contentType:'image/webp'
	});
	assert.equal(requests[5].url,'https://api.example.test/rest/image-generation/edit');
	assert.ok(requests[5].options.body instanceof FormData);
	assert.equal(requests[5].options.body.get('image').name,'source.webp');
	assert.equal(requests[5].options.body.has('mask'),false);
	await client.generateImages('구도를 유지하고 여름 분위기로', {
		referenceImage:Uint8Array.from([1]), referenceFilename:'reference.png', referenceContentType:'image/png'
	});
	assert.ok(requests[6].options.body instanceof FormData);
	assert.equal(requests[6].options.body.get('reference_image').name,'reference.png');
	await assert.rejects(client.editImages(Uint8Array.from([1]), '편집', {
		filename:'source.png', contentType:'image/png', mask:Uint8Array.from([2])
	}), /mask is not a supported image option/);
});

test('normalizes business numbers and returns data with billing metadata', async () => {
	let request;
	const client = new ApickClient({
		apiKey: 'private-test-key',
		baseUrl: 'https://api.example.test',
		fetch: async (url, options) => {
			request = { url, options };
			return jsonResponse({
				data: { company: 'APICK', success: 1 },
				api: { success: true, cost: 30, ms: 42, pl_id: 7 }
			});
		}
	});

	const result = await client.businessDetails('439-87-00761');
	assert.equal(request.url, 'https://api.example.test/rest/biz_detail');
	assert.equal(request.options.headers.Authorization, 'Bearer private-test-key');
	assert.deepEqual(Object.fromEntries(request.options.body), { biz_no: '4398700761' });
	assert.deepEqual(result.data, { company: 'APICK', success: 1 });
	assert.deepEqual(result.meta, { cost: 30, durationMs: 42 });
});

test('preserves null metadata when the API omits billing headers', async () => {
	const client = new ApickClient({
		apiKey: 'key',
		fetch: async () => jsonResponse({ data: { valid: true }, api: { success: true } })
	});
	const result = await client.validateEmail('sample@example.com');
	assert.deepEqual(result.meta, { cost: null, durationMs: null });
});

test('maps authentication and business errors to ApickApiError', async (context) => {
	await context.test('HTTP authentication error', async () => {
		const client = new ApickClient({
			apiKey: 'bad-key',
			fetch: async () => jsonResponse({ result: { error: 'Invalid key' }, api: { success: true } }, { status: 401 })
		});
		await assert.rejects(client.dnsLookup('apick.app'), (error) => {
			assert.ok(error instanceof ApickApiError);
			assert.equal(error.code, 'APICK_AUTH_ERROR');
			assert.equal(error.status, 401);
			return true;
		});
	});

	await context.test('HTTP 200 service error', async () => {
		const client = new ApickClient({
			apiKey: 'key',
			fetch: async () => jsonResponse({ data: { error: 'No result' }, api: { success: true } })
		});
		await assert.rejects(client.whois('invalid'), /No result/);
	});
});

test('redacts the API key from network error messages', async () => {
	const client = new ApickClient({
		apiKey: 'private-test-key',
		fetch: async () => { throw new Error('request failed with private-test-key'); }
	});
	await assert.rejects(client.geolocate('apick.app'), (error) => {
		assert.equal(error.code, 'APICK_NETWORK_ERROR');
		assert.doesNotMatch(error.message, /private-test-key/);
		return true;
	});
});

test('returns binary results with headers and bytes', async () => {
	const client = new ApickClient({
		apiKey: 'key',
		fetch: async () => new Response(Uint8Array.from([1, 2, 3]), {
			status: 200,
			headers: {
				'content-type': 'application/pdf',
				'content-disposition': 'attachment; filename="output.pdf"',
				cost: '10',
				ms: '25'
			}
		})
	});
	const result = await client.htmlToPdf('<h1>Test</h1>');
	assert.ok(result instanceof ApickBinaryResult);
	assert.equal(result.filename, 'output.pdf');
	assert.equal(result.contentType, 'application/pdf');
	assert.deepEqual([...result.bytes], [1, 2, 3]);
	assert.deepEqual(result.meta, { cost: 10, durationMs: 25 });
});

test('implements processing cancellation and the one-time MP3 TTS Jobs contract', async () => {
	assert.equal(TTS_VOICE_IDS.length, 14);
	assert.ok(!TTS_VOICE_IDS.includes('v2_f_teen_01'));
	assert.ok(!TTS_VOICE_IDS.includes('v2_ann_f_30s_01'));
	assert.ok(TTS_VOICE_IDS.includes('v2_f_young_01'));
	assert.ok(TTS_VOICE_IDS.includes('v2_m_senior_01'));
	const requests = [];
	const jobId = 'a'.repeat(32);
	const client = new ApickClient({
		apiKey: 'key',
		fetch: async (url, options) => {
			requests.push({ url, options });
			if (url.endsWith('/result')) return new Response(Uint8Array.from([255, 251, 144, 0]), {
				status: 200,
				headers: { 'content-type': 'audio/mpeg', 'content-disposition': `attachment; filename="${jobId}.mp3"` }
			});
			if (url.endsWith('/subtitles')) return new Response('[Script Info]\n[Events]\n', {
				status: 200,
				headers: { 'content-type': 'text/plain; charset=utf-8', 'content-disposition': `attachment; filename="${jobId}.ass"` }
			});
			if (url.endsWith('/cancel')) return jsonResponse({ data: { job_id: jobId, status: 'cancelled' }, api: { success: true, cost: 0 } });
			if (url.endsWith('/' + jobId)) return jsonResponse({ data: { job_id: jobId, status: 'processing', result_available: false }, api: { success: true, cost: 0 } });
			return jsonResponse({ data: { job_id: jobId, status: 'waiting', voice_id: 'Kore', character_count: 14 }, api: { success: true, cost: 10 } }, { status: 202 });
		}
	});
	const created = await client.createTtsJob('오늘의 이야기를 시작합니다.', { voiceId: 'Kore' });
	assert.equal(created.data.status, 'waiting');
	assert.equal(created.meta.cost, 10);
	assert.deepEqual(JSON.parse(requests[0].options.body), { voice_id: 'Kore', text: '오늘의 이야기를 시작합니다.' });
	assert.equal((await client.getTtsJob(jobId)).data.status, 'processing');
	assert.equal(requests[1].options.method, 'GET');
	assert.equal(requests[1].options.body, undefined);
	assert.equal((await client.cancelTtsJob(jobId)).data.status, 'cancelled');
	assert.ok(requests[2].url.endsWith('/rest/tts/jobs/' + jobId + '/cancel'));
	assert.equal(requests[2].options.method, 'POST');
	const mp3 = await client.downloadTtsResult(jobId);
	assert.ok(mp3 instanceof ApickBinaryResult);
	assert.equal(mp3.filename, jobId + '.mp3');
	assert.equal(mp3.contentType, 'audio/mpeg');
	assert.deepEqual([...mp3.bytes], [255, 251, 144, 0]);
	const subtitles = await client.downloadTtsSubtitles(jobId);
	assert.ok(subtitles instanceof ApickBinaryResult);
	assert.equal(subtitles.filename, jobId + '.ass');
	assert.equal(subtitles.contentType, 'text/plain');
	assert.match(new TextDecoder().decode(subtitles.bytes), /\[Events\]/);
	assert.throws(() => client.createTtsJob('hello', { voiceId: 'v2_ann_m_30s_01' }), /voiceId/);
	assert.throws(() => client.getTtsJob('bad-id'), /jobId/);
});

test('uploads OCR images as multipart form data', async () => {
	let request;
	const client = new ApickClient({
		apiKey: 'key',
		fetch: async (url, options) => {
			request = { url, options };
			return jsonResponse({ data: { result: { full_text: 'hello' }, success: 1 }, api: { success: true } });
		}
	});
	const result = await client.ocr(Uint8Array.from([137, 80, 78, 71]), {
		filename: 'scan.png',
		contentType: 'image/png'
	});
	assert.ok(request.options.body instanceof FormData);
	assert.equal(request.options.headers['Content-Type'], undefined);
	assert.equal(request.options.body.get('image').name, 'scan.png');
	assert.equal(result.data.result.full_text, 'hello');
});

test('uploads five identity masking services with the documented output contracts', async () => {
	const requests = [];
	const client = new ApickClient({
		apiKey: 'key',
		fetch: async (url, options) => {
			requests.push({ url, options });
			if (url.endsWith('/rest/hide_rrn')) return new Response(Uint8Array.from([137, 80, 78, 71]), { status: 200, headers: { 'content-type': 'image/png' } });
			return jsonResponse({ data: { result: { masked_image: 'aQ==' }, success: 1 }, api: { success: true, cost: 30 } });
		}
	});
	const input = Uint8Array.from([137, 80, 78, 71]);
	const binary = await client.maskResidentNumber(input, { type: 3, filename: 'id.png', contentType: 'image/png' });
	assert.ok(binary instanceof ApickBinaryResult);
	assert.equal(requests[0].options.body.get('type'), '3');
	for (const method of ['maskResidenceCard', 'maskPassport', 'maskIdCard', 'maskDriverLicense']) {
		const result = await client[method](input, { filename: 'id.png', contentType: 'image/png' });
		assert.equal(result.data.success, 1);
	}
	const addressMasked = await client.maskResidentNumber(input, { type: 4, filename: 'id.png', contentType: 'image/png' });
	assert.ok(addressMasked instanceof ApickBinaryResult);
	assert.equal(requests.at(-1).options.body.get('type'), '4');
	assert.throws(() => client.maskResidentNumber(input, { type: 5, filename: 'id.png', contentType: 'image/png' }), /1, 2, 3, 4/);
});

test('documents three residence-card forms as masking-only without changing the endpoint', () => {
	const read = (file) => fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
	for (const document of ['외국인등록증', '영주증', '외국국적동포 국내거소신고증']) {
		assert.match(read('README.md'), new RegExp(document));
		assert.match(read('docs/guide.ko.md'), new RegExp(document));
	}
	assert.match(read('docs/guide.en.md'), /masking and does not expand the alien registration card authenticity-check scope/);
	assert.equal(SERVICES.maskResidenceCard.endpoint, '/rest/identity_document_residence_card');
});

test('preserves identity service errors separately from the generic SDK error code', async () => {
	const client = new ApickClient({ apiKey: 'key', fetch: async () => jsonResponse({
		data: { success: 0, error: '글자를 읽지 못했습니다.', error_code: 'IDENTITY_TEXT_UNREADABLE' },
		api: { success: false, cost: 0 },
	}, { status: 422 }) });
	await assert.rejects(client.maskIdCard(Uint8Array.from([137, 80, 78, 71]), { filename: 'id.png', contentType: 'image/png' }), (error) => {
		assert.equal(error.code, 'APICK_API_ERROR');
		assert.equal(error.serviceCode, 'IDENTITY_TEXT_UNREADABLE');
		assert.equal(error.status, 422);
		assert.equal(error.toJSON().serviceCode, 'IDENTITY_TEXT_UNREADABLE');
		return true;
	});
});

test('aborts requests at the configured timeout', async () => {
	const client = new ApickClient({
		apiKey: 'key',
		timeoutMs: 5,
		fetch: async (url, options) => new Promise((resolve, reject) => {
			options.signal.addEventListener('abort', () => reject(Object.assign(new Error('aborted'), { name: 'AbortError' })));
		})
	});
	await assert.rejects(client.validatePhone('01012341234'), (error) => {
		assert.equal(error.code, 'APICK_TIMEOUT');
		return true;
	});
});

test('implements the request/get simple-auth data product contract (employment)', async () => {
	assert.equal(AUTH_PROVIDERS.length, 13);
	assert.ok(AUTH_PROVIDERS.includes('kakao'));
	assert.ok(!AUTH_PROVIDERS.includes('payco'));
	const txId = 'b'.repeat(32);
	const requests = [];
	const client = new ApickClient({
		apiKey: 'key',
		fetch: async (url, options) => {
			requests.push({ url, options });
			if (url.endsWith('/rest/get_employment')) {
				return jsonResponse({
					data: {
						schemaVersion: '1.0', transactionId: txId, product: 'employment', status: 'SUCCESS',
						resultAvailable: true, charged: true, sources: [{ source: '건강보험 자격득실', type: 'employment', status: 'SUCCESS' }],
						message: '조회가 완료됐습니다.', success: 1, checkedAt: '2026-09-20T05:24:07+09:00',
						resultExpiresAt: '2026-09-21T05:24:07+09:00',
						result: { employment: { 재직상태: 'EMPLOYED', 현재사업장: '에이픽', 취득일: '20200101', 이력: [], 보험료연도: [], 보험료: [] } }
					},
					api: { success: true, cost: 120 }
				});
			}
			return jsonResponse({
				data: { schemaVersion: '1.0', transactionId: txId, product: 'employment', status: 'AUTH_REQUESTED',
					resultAvailable: false, charged: true, sources: [], message: '인증 대기중입니다.',
					expiresAt: '2026-09-20T05:24:07+09:00', success: 1, approvals: 1 },
				api: { success: true, cost: 20 }
			});
		}
	});
	const accepted = await client.requestEmployment({ name: '홍길동', birthDate: '19900101', phone: '01011112222', authProvider: 'kakao', insuranceYears: 3 });
	assert.equal(accepted.data.status, 'AUTH_REQUESTED');
	assert.equal(accepted.meta.cost, 20);
	assert.deepEqual(Object.fromEntries(requests[0].options.body), {
		name: '홍길동', birthDate: '19900101', phone: '01011112222', authProvider: 'kakao', insuranceYears: '3'
	});
	assert.ok(requests[0].url.endsWith('/rest/req_employment'));
	const result = await client.getEmployment(txId);
	assert.equal(result.data.status, 'SUCCESS');
	assert.equal(result.data.result.employment.재직상태, 'EMPLOYED');
	assert.equal(result.meta.cost, 120);
	assert.deepEqual(Object.fromEntries(requests[1].options.body), { transactionId: txId });
	assert.ok(requests[1].url.endsWith('/rest/get_employment'));
	assert.throws(() => client.requestEmployment({ name: '홍길동', birthDate: '1990-01-01', phone: '01011112222', authProvider: 'kakao' }), /birthDate/);
	assert.throws(() => client.requestEmployment({ name: '홍길동', birthDate: '19900101', phone: '021234567', authProvider: 'kakao' }), /phone/);
	assert.throws(() => client.requestEmployment({ name: '홍길동', birthDate: '19900101', phone: '01011112222', authProvider: 'payco' }), /authProvider/);
	assert.throws(() => client.requestEmployment({ name: '홍길동', birthDate: '19900101', phone: '01011112222', authProvider: 'kakao', insuranceYears: 4 }), /insuranceYears/);
	assert.throws(() => client.getEmployment('not-a-transaction-id'), /transactionId/);
});

test('implements the remaining four simple-auth data products with product-specific options', async () => {
	const txId = 'c'.repeat(32);
	function fetchStub(assertBody) {
		const requests = [];
		return {
			requests,
			fetch: async (url, options) => {
				requests.push({ url, options });
				assertBody && assertBody(Object.fromEntries(options.body), url);
				return jsonResponse({ data: { transactionId: txId, product: 'x', status: 'AUTH_REQUESTED', resultAvailable: false, charged: true, sources: [], message: '', success: 1 }, api: { success: true, cost: 20 } });
			}
		};
	}

	const income = fetchStub();
	const incomeClient = new ApickClient({ apiKey: 'key', fetch: income.fetch });
	await incomeClient.requestPersonalIncome({ name: '홍길동', birthDate: '19900101', phone: '01011112222', authProvider: 'naver', incomeYears: 5 });
	assert.ok(income.requests[0].url.endsWith('/rest/req_personal_income'));
	assert.equal(income.requests[0].options.body.get('incomeYears'), '5');
	await incomeClient.getPersonalIncome(txId);
	assert.ok(income.requests[1].url.endsWith('/rest/get_personal_income'));
	assert.throws(() => incomeClient.requestPersonalIncome({ name: '홍길동', birthDate: '19900101', phone: '01011112222', authProvider: 'naver', incomeYears: 6 }), /incomeYears/);

	const nps = fetchStub();
	const npsClient = new ApickClient({ apiKey: 'key', fetch: nps.fetch });
	await npsClient.requestNpsJoinHistory({ name: '홍길동', birthDate: '19900101', phone: '01011112222', authProvider: 'toss', from: '1988-01', to: '2026-09' });
	assert.ok(nps.requests[0].url.endsWith('/rest/req_nps_join_history'));
	assert.equal(nps.requests[0].options.body.get('from'), '1988-01');
	assert.equal(nps.requests[0].options.body.get('to'), '2026-09');
	await npsClient.getNpsJoinHistory(txId);
	assert.ok(nps.requests[1].url.endsWith('/rest/get_nps_join_history'));
	assert.throws(() => npsClient.requestNpsJoinHistory({ name: '홍길동', birthDate: '19900101', phone: '01011112222', authProvider: 'toss', from: '1988-1' }), /from/);

	const npsCert = fetchStub();
	const npsCertClient = new ApickClient({ apiKey: 'key', fetch: npsCert.fetch });
	await npsCertClient.requestNpsDeductionCert({ name: '홍길동', birthDate: '19900101', phone: '01011112222', authProvider: 'toss', years: 5 });
	assert.ok(npsCert.requests[0].url.endsWith('/rest/req_nps_deduction_cert'));
	assert.equal(npsCert.requests[0].options.body.get('years'), '5');
	await npsCertClient.getNpsDeductionCert(txId);
	assert.ok(npsCert.requests[1].url.endsWith('/rest/get_nps_deduction_cert'));
	assert.throws(() => npsCertClient.requestNpsDeductionCert({ name: '홍길동', birthDate: '19900101', phone: '01011112222', authProvider: 'toss', years: 6 }), /years/);

	const npsCareer = fetchStub();
	const npsCareerClient = new ApickClient({ apiKey: 'key', fetch: npsCareer.fetch });
	await npsCareerClient.requestNpsCareerHistory({ name: '홍길동', birthDate: '19900101', phone: '01011112222', authProvider: 'toss', from: '1988-01', to: '2026-09' });
	assert.ok(npsCareer.requests[0].url.endsWith('/rest/req_nps_career_history'));
	assert.equal(npsCareer.requests[0].options.body.get('from'), '1988-01');
	assert.equal(npsCareer.requests[0].options.body.get('to'), '2026-09');
	await npsCareerClient.getNpsCareerHistory(txId);
	assert.ok(npsCareer.requests[1].url.endsWith('/rest/get_nps_career_history'));
	assert.throws(() => npsCareerClient.requestNpsCareerHistory({ name: '홍길동', birthDate: '19900101', phone: '01011112222', authProvider: 'toss', to: '2026-9' }), /to/);

	const license = fetchStub();
	const licenseClient = new ApickClient({ apiKey: 'key', fetch: license.fetch });
	await licenseClient.requestDrivingLicense({ name: '홍길동', birthDate: '19900101', phone: '01011112222', authProvider: 'pass' });
	assert.ok(license.requests[0].url.endsWith('/rest/req_driving_license'));
	await licenseClient.getDrivingLicense(txId);
	assert.ok(license.requests[1].url.endsWith('/rest/get_driving_license'));

	const checkup = fetchStub();
	const checkupClient = new ApickClient({ apiKey: 'key', fetch: checkup.fetch });
	await checkupClient.requestHealthCheckup({ name: '홍길동', birthDate: '19900101', phone: '01011112222', authProvider: 'kb' });
	assert.ok(checkup.requests[0].url.endsWith('/rest/req_health_checkup'));
	await checkupClient.getHealthCheckup(txId);
	assert.ok(checkup.requests[1].url.endsWith('/rest/get_health_checkup'));
});

test('implements cash-receipt deduction and tax-return history with their year options', async () => {
	const txId = 'd'.repeat(32);
	const requests = [];
	const client = new ApickClient({
		apiKey: 'key',
		fetch: async (url, options) => {
			requests.push({ url, body: options.body });
			return jsonResponse({ data: { transactionId: txId, product: 'x', status: 'AUTH_REQUESTED', resultAvailable: false, charged: true, sources: [], message: '', success: 1 }, api: { success: true, cost: 20 } });
		}
	});
	const input = { name: '홍길동', birthDate: '19900101', phone: '01011112222', authProvider: 'kakao' };

	await client.requestCashReceiptDeduction({ ...input, incomeYears: 3 });
	assert.ok(requests[0].url.endsWith('/rest/req_cash_receipt_deduction'));
	assert.equal(requests[0].body.get('incomeYears'), '3');
	await client.requestCashReceiptDeduction(input);
	assert.equal(requests[1].body.get('incomeYears'), null);
	await client.getCashReceiptDeduction(txId);
	assert.ok(requests[2].url.endsWith('/rest/get_cash_receipt_deduction'));
	assert.equal(requests[2].body.get('transactionId'), txId);

	await client.requestTaxReturnHistory({ ...input, years: 10 });
	assert.ok(requests[3].url.endsWith('/rest/req_tax_return_history'));
	assert.equal(requests[3].body.get('years'), '10');
	await client.getTaxReturnHistory(txId);
	assert.ok(requests[4].url.endsWith('/rest/get_tax_return_history'));

	for (const value of [0, 4, 1.5]) assert.throws(() => client.requestCashReceiptDeduction({ ...input, incomeYears: value }), /incomeYears/);
	for (const value of [0, 11, 2.5]) assert.throws(() => client.requestTaxReturnHistory({ ...input, years: value }), /years/);
	assert.throws(() => client.getTaxReturnHistory('D'.repeat(32)), /transactionId/);
	assert.equal(requests.length, 5);
});

test('implements resident registration and the selectable Government24 bundle', async () => {
	const txId = 'e'.repeat(32);
	const requests = [];
	const client = new ApickClient({
		apiKey: 'key',
		fetch: async (url, options) => {
			requests.push({ url, body: options.body });
			return jsonResponse({ data: { transactionId: txId, product: 'x', status: 'AUTH_REQUESTED', resultAvailable: false, charged: true, sources: [], message: '', success: 1 }, api: { success: true, cost: 20 } });
		}
	});
	const base = { name: '홍길동', birthDate: '19900101', phone: '01011112222', authProvider: 'kakao' };
	const address = { sido: '서울특별시', sigungu: '구로구' };

	assert.ok(GOV24_BUNDLE_PRODUCTS.includes('resident_registration'));
	assert.ok(GOV24_BUNDLE_PRODUCTS.includes('resident_registration_cho'));

	await client.requestResidentRegistration({ ...base, ...address, includeHousehold: 'N' });
	assert.ok(requests[0].url.endsWith('/rest/req_resident_registration'));
	assert.equal(requests[0].body.get('sido'), '서울특별시');
	assert.equal(requests[0].body.get('sigungu'), '구로구');
	assert.equal(requests[0].body.get('includeHousehold'), 'N');
	await client.getResidentRegistration(txId);
	assert.ok(requests[1].url.endsWith('/rest/get_resident_registration'));
	assert.equal(requests[1].body.get('transactionId'), txId);

	await client.requestResidentRegistrationCho({ ...base, ...address });
	assert.ok(requests[2].url.endsWith('/rest/req_resident_registration_cho'));
	await client.getResidentRegistrationCho(txId);
	assert.ok(requests[3].url.endsWith('/rest/get_resident_registration_cho'));

	// 등본·초본을 고르면 주소지가 함께 가고, 선택 상품 단가가 합산된다.
	await client.requestGov24Bundle({ ...base, products: ['resident_registration', 'resident_registration_cho'], ...address });
	assert.ok(requests[4].url.endsWith('/rest/req_gov24_bundle'));
	assert.equal(requests[4].body.get('products'), 'resident_registration,resident_registration_cho');
	assert.equal(requests[4].body.get('sido'), '서울특별시');

	// 등본·초본을 고르지 않으면 주소지를 보내지 않는다.
	await client.requestGov24Bundle({ ...base, products: 'driving_license', sido: '서울특별시', sigungu: '구로구' });
	assert.equal(requests[5].body.get('products'), 'driving_license');
	assert.equal(requests[5].body.get('sido'), null);
	await client.getGov24Bundle(txId);
	assert.ok(requests[6].url.endsWith('/rest/get_gov24_bundle'));

	assert.throws(() => client.requestResidentRegistration(base), /sido/);
	assert.throws(() => client.requestResidentRegistration({ ...base, sido: '서울특별시' }), /sigungu/);
	assert.throws(() => client.requestResidentRegistration({ ...base, ...address, includeHousehold: 'yes' }), /includeHousehold/);
	assert.throws(() => client.requestGov24Bundle({ ...base, products: [] }), /products/);
	assert.throws(() => client.requestGov24Bundle({ ...base, products: ['unknown_product'] }), /unsupported key/);
	assert.throws(() => client.requestGov24Bundle({ ...base, products: 'resident_registration' }), /sido/);
	assert.throws(() => client.getGov24Bundle('E'.repeat(32)), /transactionId/);
	assert.equal(requests.length, 7);
});

test('implements Hometax certificate issuance contracts', async () => {
	const txId = 'f'.repeat(32);
	const requests = [];
	const client = new ApickClient({
		apiKey: 'key',
		fetch: async (url, options) => {
			requests.push({ url, body: options.body });
			return jsonResponse({ data: { transactionId: txId, product: 'x', status: 'AUTH_REQUESTED', resultAvailable: false, charged: true, sources: [], message: '', success: 1 }, api: { success: true, cost: 20 } });
		}
	});
	const base = { name: '홍길동', birthDate: '19900101', phone: '01011112222', authProvider: 'kakao' };
	const cert = { year: '2025', use_purpose: '99', submit_to: '99', delivery: '06' };

	await client.requestIncomeAmountCert({ ...base, ...cert });
	assert.ok(requests[0].url.endsWith('/rest/req_income_amount_cert'));
	assert.equal(requests[0].body.get('year'), '2025');
	assert.equal(requests[0].body.get('use_purpose'), '99');
	assert.equal(requests[0].body.get('delivery'), '06');
	// 형식을 고르지 않으면 둘 다(PDF·JSON) 받는다.
	assert.equal(requests[0].body.get('format'), 'both');
	await client.getIncomeAmountCert(txId);
	assert.ok(requests[1].url.endsWith('/rest/get_income_amount_cert'));
	assert.equal(requests[1].body.get('transactionId'), txId);

	await client.requestPensionCreditCert({ ...base, ...cert, format: 'json', address_open_yn: 'N' });
	assert.ok(requests[2].url.endsWith('/rest/req_pension_credit_cert'));
	assert.equal(requests[2].body.get('format'), 'json');
	assert.equal(requests[2].body.get('address_open_yn'), 'N');
	await client.getPensionCreditCert(txId);
	assert.ok(requests[3].url.endsWith('/rest/get_pension_credit_cert'));

	await client.requestFactCert({ ...base, ...cert, itrf_cd: '99', start_month: '01', end_month: '12', issuance: '1' });
	assert.ok(requests[4].url.endsWith('/rest/req_fact_cert'));
	assert.equal(requests[4].body.get('itrf_cd'), '99');
	assert.equal(requests[4].body.get('start_month'), '01');
	await client.getFactCert(txId);
	assert.ok(requests[5].url.endsWith('/rest/get_fact_cert'));

	await client.requestTaxClearanceCert({ ...base, ...cert, cert_type: 'B0006', itrf_cd: '99' });
	assert.ok(requests[6].url.endsWith('/rest/req_tax_clearance_cert'));
	assert.equal(requests[6].body.get('cert_type'), 'B0006');
	await client.getTaxClearanceCert(txId);
	assert.ok(requests[7].url.endsWith('/rest/get_tax_clearance_cert'));

	// 인증 공통 입력이 빠지면 서버 호출 전에 막는다.
	assert.throws(() => client.requestIncomeAmountCert({ ...cert }), /name/);
	assert.throws(() => client.getIncomeAmountCert('Z'.repeat(32)), /transactionId/);
	assert.equal(requests.length, 8);
});

test('implements certificate bundle issuance contracts', async () => {
	const txId = 'c'.repeat(32);
	const requests = [];
	const client = new ApickClient({
		apiKey: 'key',
		fetch: async (url, options) => {
			requests.push({ url, body: options.body });
			return jsonResponse({ data: { transactionId: txId, product: 'x', status: 'AUTH_REQUESTED', resultAvailable: false, charged: true, sources: [], message: '', success: 1 }, api: { success: true, cost: 20 } });
		}
	});
	const base = { name: '홍길동', birthDate: '19900101', phone: '01011112222', authProvider: 'kakao' };
	const cert = { year: '2025', use_purpose: '99', submit_to: '99', delivery: '06' };

	await client.requestIncomeCertBundle({ ...base, ...cert, format: 'json', amount_open_yn: 'Y' });
	assert.ok(requests[0].url.endsWith('/rest/req_income_cert_bundle'));
	assert.equal(requests[0].body.get('year'), '2025');
	assert.equal(requests[0].body.get('format'), 'json');
	assert.equal(requests[0].body.get('amount_open_yn'), 'Y');
	assert.equal(requests[0].body.get('agreed'), null);
	await client.getIncomeCertBundle(txId);
	assert.ok(requests[1].url.endsWith('/rest/get_income_cert_bundle'));
	assert.equal(requests[1].body.get('transactionId'), txId);

	await client.requestBusinessCertBundle({ ...base, ...cert, business_no: '123-45-67890', period: 'all', agreed: true });
	assert.ok(requests[2].url.endsWith('/rest/req_business_cert_bundle'));
	assert.equal(requests[2].body.get('business_no'), '1234567890');
	assert.equal(requests[2].body.get('period'), 'all');
	assert.equal(requests[2].body.get('agreed'), 'true');
	// 형식을 고르지 않으면 둘 다(PDF·JSON) 받는다.
	assert.equal(requests[2].body.get('format'), 'both');
	// 이전 결과의 bind_id 가 있으면 동의 없이 접수한다.
	await client.requestBusinessCertBundle({ ...base, ...cert, business_no: '1234567890', bind_id: 'bind_0001' });
	assert.equal(requests[3].body.get('bind_id'), 'bind_0001');
	assert.equal(requests[3].body.get('agreed'), null);
	await client.getBusinessCertBundle(txId);
	assert.ok(requests[4].url.endsWith('/rest/get_business_cert_bundle'));

	// 대표자 확인·사업자등록번호가 빠지면 서버 호출 전에 막는다.
	assert.throws(() => client.requestBusinessCertBundle({ ...base, ...cert, business_no: '1234567890' }), /agreed/);
	assert.throws(() => client.requestBusinessCertBundle({ ...base, ...cert, business_no: '1234567890', agreed: 'yes' }), /agreed/);
	assert.throws(() => client.requestBusinessCertBundle({ ...base, ...cert, business_no: '12345', agreed: true }), /businessNumber/);
	assert.throws(() => client.requestIncomeCertBundle({ ...cert }), /name/);
	assert.throws(() => client.getBusinessCertBundle('Z'.repeat(32)), /transactionId/);
	assert.equal(requests.length, 5);
});

test('implements the YouTube metadata, thumbnail and subtitle contracts', async () => {
	const requests = [];
	const client = new ApickClient({
		apiKey: 'key',
		fetch: async (url, options) => {
			requests.push({ url, body: options.body });
			if (url.endsWith('/rest/youtube_metadata') || url.endsWith('/rest/youtube_subtitle_list')) {
				return jsonResponse({ data: { video_id: 'dQw4w9WgXcQ', title: 'Video' }, api: { success: true, cost: 20 } });
			}
			const isSubtitle = url.endsWith('/rest/youtube_subtitle');
			return new Response(Uint8Array.from([7, 8, 9]), {
				status: 200,
				headers: {
					'content-type': isSubtitle ? 'text/plain; charset=utf-8' : 'image/jpeg',
					'content-disposition': 'attachment; filename=' + (isSubtitle ? 'dQw4w9WgXcQ.en.txt' : 'dQw4w9WgXcQ.jpg'),
					cost: isSubtitle ? '30' : '20'
				}
			});
		}
	});

	const metadata = await client.youtubeMetadata('https://youtu.be/dQw4w9WgXcQ');
	assert.ok(requests[0].url.endsWith('/rest/youtube_metadata'));
	assert.equal(requests[0].body.get('url'), 'https://youtu.be/dQw4w9WgXcQ');
	assert.equal(metadata.data.video_id, 'dQw4w9WgXcQ');

	await client.youtubeSubtitleList('dQw4w9WgXcQ');
	assert.ok(requests[1].url.endsWith('/rest/youtube_subtitle_list'));

	const thumbnail = await client.youtubeThumbnail('dQw4w9WgXcQ');
	assert.ok(thumbnail instanceof ApickBinaryResult);
	assert.equal(thumbnail.filename, 'dQw4w9WgXcQ.jpg');
	assert.equal(thumbnail.contentType, 'image/jpeg');

	const subtitle = await client.youtubeSubtitle('dQw4w9WgXcQ', 'en', { format: 'txt', type: 'manual' });
	assert.ok(requests[3].url.endsWith('/rest/youtube_subtitle'));
	assert.equal(requests[3].body.get('lang'), 'en');
	assert.equal(requests[3].body.get('format'), 'txt');
	assert.equal(requests[3].body.get('type'), 'manual');
	assert.equal(subtitle.filename, 'dQw4w9WgXcQ.en.txt');
	assert.deepEqual(subtitle.meta, { cost: 30, durationMs: null });

	await client.youtubeSubtitle('dQw4w9WgXcQ', 'ko');
	assert.equal(requests[4].body.get('format'), null);
	assert.equal(requests[4].body.get('type'), null);

	assert.throws(() => client.youtubeMetadata(''), /url/);
	assert.throws(() => client.youtubeSubtitle('dQw4w9WgXcQ', ''), /lang/);
	assert.throws(() => client.youtubeSubtitle('dQw4w9WgXcQ', 'en', { format: 'ass' }), /format/);
	assert.throws(() => client.youtubeSubtitle('dQw4w9WgXcQ', 'en', { type: 'translated' }), /type/);
	assert.equal(requests.length, 5);
});

test('validates inputs before making a request', async () => {
	let calls = 0;
	const client = new ApickClient({ apiKey: 'key', fetch: async () => { calls += 1; } });
	assert.throws(() => client.businessDetails('1234'), /10 digits/);
	assert.throws(() => client.holidays(1800, 1), /1900/);
	assert.throws(() => client.createTtsJob('', { voiceId: 'Kore' }), /text/);
	assert.throws(() => client.jsonToExcel({ value: 1 }), /array/);
	assert.equal(calls, 0);
});

test('ESM and CommonJS entry points expose the same client', async () => {
	const esm = await import('../src/index.js');
	assert.equal(esm.default, ApickClient);
	assert.equal(esm.ApickApiError, ApickApiError);
});

test('implements the Google news, shopping, maps, rank check and Instagram/TikTok lookup contracts', async () => {
	const requests = [];
	const client = new ApickClient({
		apiKey: 'key',
		fetch: async (url, options) => {
			requests.push({ url, body: options.body });
			return jsonResponse({ data: { keyword: 'k', count: 0, items: [] }, api: { success: true, cost: 5 } });
		}
	});
	await client.googleNewsSearch('반도체', { page: 2 });
	assert.ok(requests[0].url.endsWith('/rest/google_news_search'));
	assert.equal(requests[0].body.get('keyword'), '반도체');
	assert.equal(requests[0].body.get('page'), '2');
	await client.googleShoppingSearch('무선 이어폰');
	assert.ok(requests[1].url.endsWith('/rest/google_shopping_search'));
	assert.equal(requests[1].body.get('page'), '1');
	await client.googleMapsSearch('강남역 카페');
	assert.ok(requests[2].url.endsWith('/rest/google_maps_search'));
	await client.googleRankCheck('주소 검색 API', 'apick.app');
	assert.ok(requests[3].url.endsWith('/rest/google_rank_check'));
	assert.equal(requests[3].body.get('domain'), 'apick.app');
	await client.instagramProfile('@natgeo');
	assert.ok(requests[4].url.endsWith('/rest/instagram_profile'));
	assert.equal(requests[4].body.get('username'), 'natgeo');
	assert.equal(requests[4].body.get('url'), null);
	await client.instagramProfile('https://www.instagram.com/natgeo/');
	assert.equal(requests[5].body.get('url'), 'https://www.instagram.com/natgeo/');
	await client.instagramPost('https://www.instagram.com/reel/DdG4RIxIPyf/');
	assert.ok(requests[6].url.endsWith('/rest/instagram_post'));
	await client.tiktokProfile('https://www.tiktok.com/@tiktok');
	assert.ok(requests[7].url.endsWith('/rest/tiktok_profile'));
	assert.equal(requests[7].body.get('url'), 'https://www.tiktok.com/@tiktok');

	assert.throws(() => client.googleNewsSearch(''), /keyword/);
	assert.throws(() => client.googleRankCheck('키워드', ''), /domain/);
	assert.throws(() => client.instagramProfile(''), /usernameOrUrl/);
	assert.throws(() => client.instagramPost(''), /url/);
	assert.equal(requests.length, 8);
});

test('implements Amazon and X contracts', async () => {
	const requests = [];
	const client = new ApickClient({
		apiKey: 'key',
		fetch: async (url, options) => {
			requests.push({ url, method: options.method, body: options.body, headers: options.headers });
			return jsonResponse({ data: { ok: true }, api: { success: true, cost: 20 } });
		}
	});
	await client.amazonProduct('b0bdhwdr12');
	assert.ok(requests[0].url.endsWith('/rest/amazon_product'));
	assert.equal(requests[0].body.get('asin'), 'B0BDHWDR12');
	await client.amazonProduct('https://www.amazon.com/dp/B0BDHWDR12');
	assert.equal(requests[1].body.get('url'), 'https://www.amazon.com/dp/B0BDHWDR12');
	await client.xProfile('@NASA');
	assert.ok(requests[2].url.endsWith('/rest/x_profile'));
	assert.equal(requests[2].body.get('username'), 'NASA');
	await client.xPost('https://x.com/NASA/status/1');
	assert.ok(requests[3].url.endsWith('/rest/x_post'));
	assert.equal(requests.length, 4);
});

test('implements the Coupang, Naver brand store and LinkedIn lookup contracts', async () => {
	const requests = [];
	const client = new ApickClient({
		apiKey: 'key',
		fetch: async (url, options) => {
			requests.push({ url, body: options.body });
			return jsonResponse({ data: { ok: true }, api: { success: true, cost: 30 } });
		}
	});
	await client.coupangProduct('7812020679');
	assert.ok(requests[0].url.endsWith('/rest/coupang_product'));
	assert.equal(requests[0].body.get('product_id'), '7812020679');
	await client.coupangProduct('https://www.coupang.com/vp/products/7812020679');
	assert.equal(requests[1].body.get('url'), 'https://www.coupang.com/vp/products/7812020679');
	await client.naverShoppingProduct('https://brand.naver.com/pulmuonebynature/products/4995061380');
	assert.ok(requests[2].url.endsWith('/rest/naver_shopping_product'));
	assert.equal(requests[2].body.get('url'), 'https://brand.naver.com/pulmuonebynature/products/4995061380');
	await client.linkedinProfile('https://www.linkedin.com/in/example/');
	assert.ok(requests[3].url.endsWith('/rest/linkedin_profile'));
	assert.equal(requests[3].body.get('url'), 'https://www.linkedin.com/in/example/');
	await client.linkedinCompany('https://www.linkedin.com/company/example/');
	assert.ok(requests[4].url.endsWith('/rest/linkedin_company'));
	await client.linkedinJob('https://www.linkedin.com/jobs/view/4001234567/');
	assert.ok(requests[5].url.endsWith('/rest/linkedin_job'));
	assert.throws(() => client.coupangProduct(''), /urlOrProductId/);
	assert.throws(() => client.naverShoppingProduct(''), /url/);
	assert.throws(() => client.linkedinProfile(''), /url/);
	assert.equal(requests.length, 6);
});

test('looks up a court auction case', async () => {
	const requests = [];
	const client = new ApickClient({
		apiKey: 'key',
		fetch: async (url, options) => {
			requests.push({ url, body: options.body });
			return jsonResponse({ data: { result: 1, success: 1, count: 0, items: [] }, api: { success: true, cost: 60 } });
		}
	});
	await client.courtAuction('2025타경104697', '서울중앙지방법원');
	assert.ok(requests[0].url.endsWith('/rest/court_auction'));
	assert.equal(requests[0].body.get('case_no'), '2025타경104697');
	assert.equal(requests[0].body.get('court'), '서울중앙지방법원');
	await client.courtAuction('2025타경104697', 'B000210');
	assert.equal(requests[1].body.get('court'), 'B000210');
	assert.throws(() => client.courtAuction('', '서울중앙지방법원'), /caseNo/);
	assert.throws(() => client.courtAuction('2025타경104697', ''), /court/);
	assert.equal(requests.length, 2);
});

test('verifies a registry document issue number', async () => {
	const requests = [];
	const client = new ApickClient({
		apiKey: 'key',
		fetch: async (url, options) => {
			requests.push({ url, body: options.body });
			return jsonResponse({ data: { verified: true, status: 'confirmed', kind: 'realestate', message: 'ok' }, api: { success: true, cost: 60 } });
		}
	});
	await client.registryDocVerify('2024-1234-5678');
	assert.ok(requests[0].url.endsWith('/rest/registry_doc_verify'));
	assert.equal(requests[0].body.get('issue_no'), '2024-1234-5678');
	assert.equal(requests[0].body.get('kind'), null);
	await client.registryDocVerify('202412345678', { kind: 'corporate' });
	assert.equal(requests[1].body.get('kind'), 'corporate');
	assert.throws(() => client.registryDocVerify(''), /issueNo/);
	assert.equal(requests.length, 2);
});

test('implements the YouTube search, list and comments contracts', async () => {
	const requests = [];
	const client = new ApickClient({
		apiKey: 'key',
		fetch: async (url, options) => {
			requests.push({ url, body: options.body });
			return jsonResponse({ data: { ok: true }, api: { success: true, cost: 32 } });
		}
	});
	const field = (index, name) => requests[index].body.get(name);

	await client.youtubeSearch('파이썬 강좌', { count: 5, sort: 'views', type: 'video', uploadDate: 'week', duration: 'short' });
	assert.ok(requests[0].url.endsWith('/rest/youtube_search'));
	assert.deepEqual(['query', 'count', 'sort', 'type', 'upload_date', 'duration'].map(name => field(0, name)), ['파이썬 강좌', '5', 'views', 'video', 'week', 'short']);

	await client.youtubeSearch('a');
	assert.equal(field(1, 'count'), null);
	assert.equal(field(1, 'sort'), null);

	await client.youtubeChannel('@jocoding', { tab: 'shorts', count: 10 });
	assert.ok(requests[2].url.endsWith('/rest/youtube_channel'));
	assert.deepEqual([field(2, 'channel'), field(2, 'tab'), field(2, 'count')], ['@jocoding', 'shorts', '10']);

	await client.youtubePlaylist('PLRqwX-V7Uu6ZiZxtDDRCi6uhfTH4FilpH', { count: 200 });
	assert.ok(requests[3].url.endsWith('/rest/youtube_playlist'));
	await client.youtubeHashtag('#kpop', { count: 3 });
	assert.ok(requests[4].url.endsWith('/rest/youtube_hashtag'));
	assert.equal(field(4, 'hashtag'), '#kpop');
	await client.youtubeComments('dQw4w9WgXcQ', { count: 50, sort: 'new', replies: true });
	assert.ok(requests[5].url.endsWith('/rest/youtube_comments'));
	assert.deepEqual([field(5, 'count'), field(5, 'sort'), field(5, 'replies')], ['50', 'new', 'true']);

	assert.throws(() => client.youtubeSearch(''), /query/);
	assert.throws(() => client.youtubeSearch('a', { count: 51 }), /count/);
	assert.throws(() => client.youtubeSearch('a', { sort: 'random' }), /sort/);
	assert.throws(() => client.youtubeChannel('@x', { tab: 'community' }), /tab/);
	assert.throws(() => client.youtubeComments('dQw4w9WgXcQ', { replies: 'yes' }), /replies/);
	assert.equal(requests.length, 6);
});

test('vehicle, finance and building lookups send the documented REST fields', async () => {
	const requests = [];
	const client = new ApickClient({ apiKey: 'test-key', baseUrl: 'https://api.example.test', fetch: async (url, options) => {
		requests.push({ url, body: Object.fromEntries(options.body) });
		return jsonResponse({ data: { result: {} }, api: { success: true, cost: 60 } });
	} });
	await client.vehicleRecall({ carNo: '12가 3456' });
	await client.vehicleRecall({ vin: 'kmhxx00xxxx000000' });
	await client.hipassUnpaid('서울12가3456');
	await client.vehicleTaxCalc(1998, { carAgeYears: 4 });
	await client.vehicleEmission('KMY-SY-13-24');
	await client.corpFinance('110111-1234567', { bizYear: '2024', type: 'summary' });
	await client.buildingRegister({ sigunguCd: '11680', bjdongCd: '10300', bun: '12', type: 'title' });
	await client.appReviews(1234567890, { page: 2 });
	assert.deepEqual(requests.map(r => r.url.replace('https://api.example.test', '')), [
		'/rest/vehicle_recall', '/rest/vehicle_recall', '/rest/hipass_unpaid', '/rest/vehicle_tax_calc',
		'/rest/vehicle_emission', '/rest/corp_finance', '/rest/bldrgst', '/rest/app_reviews'
	]);
	assert.deepEqual(requests[0].body, { car_no: '12가3456' });
	assert.deepEqual(requests[1].body, { vin: 'KMHXX00XXXX000000' });
	assert.deepEqual(requests[2].body, { car_no: '서울12가3456' });
	assert.deepEqual(requests[3].body, { cc: '1998', car_age_years: '4' });
	assert.deepEqual(requests[4].body, { cert_no: 'KMY-SY-13-24' });
	assert.deepEqual(requests[5].body, { crno: '110111-1234567', bizYear: '2024', type: 'summary' });
	assert.deepEqual(requests[6].body, { sigunguCd: '11680', bjdongCd: '10300', bun: '12', type: 'title' });
	assert.deepEqual(requests[7].body, { appId: '1234567890', page: '2' });
	assert.throws(() => client.vehicleRecall({}), /exactly one/);
	assert.throws(() => client.vehicleRecall({ carNo: '12가3456', vin: 'KMHXX00XXXX000000' }), /exactly one/);
	assert.throws(() => client.vehicleTaxCalc(), /cc is required/);
	assert.throws(() => client.vehicleTaxCalc(20), /cc must be/);
	assert.throws(() => client.buildingRegister({ bun: '12' }), /pnu or sigunguCd/);
});

test('geo methods send JSON bodies so lists and GeoJSON keep their shape', async () => {
	const requests = [];
	const client = new ApickClient({ apiKey: 'test-key', baseUrl: 'https://api.example.test', fetch: async (url, options) => {
		assert.equal(options.headers['Content-Type'], 'application/json');
		requests.push({ url: url.replace('https://api.example.test', ''), body: JSON.parse(options.body) });
		return jsonResponse({ data: { matched: true }, api: { success: true, cost: 20 } });
	} });
	const polygon = { type: 'Polygon', coordinates: [[[127.02, 37.50], [127.03, 37.50], [127.03, 37.51], [127.02, 37.50]]] };
	await client.geoStandardize('서울특별시 강남구 역삼동 808');
	await client.geoBatchGeocode(['서울특별시 강남구 역삼동 808', '서울특별시 강남구 역삼동 858'], { dedupe: false });
	await client.geoReverse({ point: '127.025,37.504' });
	await client.geoAddressSearch('테헤란로 152', { size: 5 });
	await client.geoPlaceSearch('강남역', { origin: '127.025,37.504', radius: 1000 });
	await client.geoAdminCode({ x: 127.025, y: 37.504 });
	await client.geoCompareAddress('서울특별시 강남구 역삼동 808', '서울특별시 강남구 테헤란로 152');
	await client.geoMeasure([[127.02, 37.50], [127.03, 37.51]], { mode: 'path', unit: 'km' });
	await client.geoGeojsonAnalyze(polygon, { point: '127.025,37.505' });
	await client.geoAddressQuality(['서울 강남구 역삼동 808']);
	await client.geoAddressAutocomplete('테헤란로', { size: 3 });
	await client.geoDistrictBoundary(11680, { includeGeometry: false });
	await client.geoNeighborhood({ address: '서울특별시 강남구 역삼동 808', categories: ['편의점', '약국'], radius: 500 });
	assert.deepEqual(requests.map(r => r.url), [
		'/rest/geo_standardize', '/rest/geo_batch_geocode', '/rest/geo_reverse', '/rest/geo_address_search', '/rest/geo_place_search',
		'/rest/geo_admin_code', '/rest/geo_compare_address', '/rest/geo_measure', '/rest/geo_geojson_analyze', '/rest/geo_address_quality',
		'/rest/geo_address_autocomplete', '/rest/geo_district_boundary', '/rest/geo_neighborhood'
	]);
	assert.deepEqual(requests[0].body, { address: '서울특별시 강남구 역삼동 808' });
	assert.deepEqual(requests[1].body, { addresses: ['서울특별시 강남구 역삼동 808', '서울특별시 강남구 역삼동 858'], dedupe: false });
	assert.deepEqual(requests[7].body.coordinates, [[127.02, 37.50], [127.03, 37.51]]);
	assert.deepEqual(requests[8].body.geojson, polygon);
	assert.deepEqual(requests[11].body, { query: '11680', includeGeometry: false });
	assert.deepEqual(requests[12].body.categories, ['편의점', '약국']);
	assert.throws(() => client.geoStandardize({}), /address or pnu/);
	assert.throws(() => client.geoBatchGeocode([]), /non-empty array/);
	assert.throws(() => client.geoMeasure(new Array(201).fill('127,37')), /200/);
	assert.throws(() => client.geoGeojsonAnalyze(null), /geojson/);
});

test('registry search, job, status and PDF calls use the documented REST paths', async () => {
	const requests = [];
	const client = new ApickClient({ apiKey: 'test-key', baseUrl: 'https://api.example.test', fetch: async (url, options) => {
		requests.push({ url: url.replace('https://api.example.test', ''), method: options.method, body: options.body ? Object.fromEntries(options.body) : null });
		if (url.includes('download=1')) return new Response(new Uint8Array([37, 80, 68, 70]), { status: 200, headers: { 'content-type': 'application/pdf' } });
		return jsonResponse({ data: { job_id: 'a'.repeat(32), status: 'queued' }, api: { success: true, cost: 0 } }, { status: url.includes('_jobs') ? 202 : 200 });
	} });
	await client.registryRealestateSearch('서울특별시 가상구 가상로 1');
	await client.registryCorporateSearch({ corpRegNo: '110111-0000001' });
	await client.createRegistryRealestateJob({ query: '서울특별시 가상구 가상로 1', index: 2, usage: 'view', includeCancelled: false, idempotencyKey: 'order-1' });
	await client.createRegistryCorporateJob({ bizNo: '123-45-67890', usage: 'issue' });
	const job = await client.getRegistryJob('a'.repeat(32));
	const pdf = await client.downloadRegistryPdf('a'.repeat(32));
	assert.deepEqual(requests.map(r => r.method + ' ' + r.url), [
		'POST /rest/registry_realestate_search', 'POST /rest/registry_corporate_search', 'POST /rest/registry_realestate_jobs',
		'POST /rest/registry_corporate_jobs', 'GET /rest/registry_jobs/' + 'a'.repeat(32), 'GET /rest/registry_jobs/' + 'a'.repeat(32) + '?download=1'
	]);
	assert.deepEqual(requests[1].body, { corp_reg_no: '1101110000001' });
	assert.deepEqual(requests[2].body, { query: '서울특별시 가상구 가상로 1', index: '2', usage: 'view', include_cancelled: 'false', idempotency_key: 'order-1' });
	assert.deepEqual(requests[3].body, { biz_no: '1234567890', usage: 'issue' });
	assert.equal(job.data.status, 'queued');
	assert.ok(pdf instanceof ApickBinaryResult);
	assert.throws(() => client.registryCorporateSearch({}), /corpRegNo or bizNo/);
	assert.throws(() => client.createRegistryRealestateJob({}), /query or pin/);
	assert.throws(() => client.getRegistryJob('../x'), /jobId/);
});
