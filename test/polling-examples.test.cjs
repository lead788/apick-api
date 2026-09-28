'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const { ApickClient } = require('../src/index.cjs');

const files = ['README.md', 'docs/guide.ko.md', 'docs/guide.en.md'];
const transactionId = 'a'.repeat(32);
const pending = ['AUTH_REQUESTED', 'AUTH_WAITING', 'AUTH_COMPLETED', 'COLLECTING', 'COLLECTED'];
const completed = ['SUCCESS', 'PARTIAL_SUCCESS'];
const failed = ['AUTH_REJECTED', 'AUTH_EXPIRED', 'FAILED'];

function example(file, name) {
	const text = fs.readFileSync(path.join(__dirname, '..', file), 'utf8').replace(/\r\n/g, '\n');
	const start = `<!-- simple-auth-${name}:start -->\n\x60\x60\x60js\n`;
	const end = `\n\x60\x60\x60\n<!-- simple-auth-${name}:end -->`;
	assert.equal(text.split(start).length, 2, `${file}: exactly one ${name} example`);
	const tail = text.split(start)[1];
	assert.equal(tail.split(end).length, 2, `${file}: closing ${name} marker`);
	return tail.split(end)[0];
}

function response(status, extra = {}) {
	return { data: { transactionId, status, resultAvailable: false, charged: false, success: 0, ...extra } };
}

function result(status = 'SUCCESS') {
	return response(status, {
		resultAvailable: true,
		result: { records: [] },
		sources: [{ type: 'records', status: status === 'PARTIAL_SUCCESS' ? 'FAILED' : 'SUCCESS' }]
	});
}

function harness(file = files[0]) {
	let now = Date.parse('2026-09-28T00:00:00Z');
	const delays = [];
	const clock = { now: () => now, parse: Date.parse };
	const sleep = (callback, delay) => {
		delays.push(delay);
		now += delay;
		callback();
	};
	const poll = new Function('Date', 'setTimeout', `${example(file, 'polling')}\nreturn pollDataResult;`)(clock, sleep);
	return { poll, delays, now: clock.now };
}

test('all three documents execute the same polling helper', () => {
	for (const file of files.slice(1)) assert.equal(example(file, 'polling'), example(files[0], 'polling'));
	const types = fs.readFileSync(path.join(__dirname, '../src/index.d.ts'), 'utf8');
	const union = types.match(/export type DataRequestStatus\s*=([^;]+);/)[1];
	const declared = [...union.matchAll(/'([^']+)'/g)].map(match => match[1]);
	assert.deepEqual(declared.sort(), [...pending, ...completed, ...failed].sort(), 'new SDK states require regression coverage');
});

for (const file of files) {
	test(`${file}: every progress state keeps polling with capped backoff and the original ID`, async () => {
		const { poll, delays } = harness(file);
		const expected = result();
		const sequence = [...pending.map(status => response(status)), expected];
		const ids = [];
		const actual = await poll(async id => {
			ids.push(id);
			assert.ok(sequence.length, 'must stop when the result becomes available');
			return sequence.shift();
		}, response('AUTH_REQUESTED'));
		assert.equal(actual, expected);
		assert.deepEqual(ids, Array(6).fill(transactionId));
		assert.deepEqual(delays, [5_000, 10_000, 20_000, 30_000, 30_000, 30_000]);
		assert.equal(sequence.length, 0);
	});
}

for (const status of [...completed, 'COLLECTED']) {
	test(`available ${status} returns immediately, including a free replay`, async () => {
		const { poll, delays } = harness();
		const expected = result(status);
		assert.equal(await poll(() => assert.fail('unexpected extra poll'), expected), expected);
		assert.deepEqual(delays, []);
	});
}

for (const status of failed) {
	test(`${status} terminates without another poll`, async () => {
		const { poll, delays } = harness();
		await assert.rejects(poll(() => assert.fail('must not poll a terminal failure'), response(status)), { code: status });
		assert.deepEqual(delays, []);
	});
}

test('collection failure after progress preserves its error code and does not retry', async () => {
	const { poll, delays } = harness();
	await assert.rejects(poll(async () => response('FAILED', { errorCode: 'COLLECT_FAILED' }), response('COLLECTING')), { code: 'COLLECT_FAILED' });
	assert.deepEqual(delays, [5_000]);
});

test('RESULT_EXPIRED is an error code, even when the saved status is SUCCESS', async () => {
	const { poll, delays } = harness();
	await assert.rejects(poll(() => assert.fail('expired results must not be polled'), response('SUCCESS', { errorCode: 'RESULT_EXPIRED' })), { code: 'RESULT_EXPIRED' });
	assert.deepEqual(delays, []);
});

for (const status of completed) {
	test(`${status} without an available result is not treated as success`, async () => {
		await assert.rejects(harness().poll(() => assert.fail('terminal state must not loop'), response(status)), { code: 'RESULT_NOT_AVAILABLE' });
	});
}

test('missing payloads and unknown states stop instead of looping forever', async () => {
	const { poll } = harness();
	const unexpected = () => assert.fail('invalid response must not be polled');
	await assert.rejects(poll(unexpected, response('SUCCESS', { resultAvailable: true })), { code: 'INVALID_RESULT' });
	await assert.rejects(poll(unexpected, response('NEW_STATUS')), { code: 'UNKNOWN_STATUS' });
});

test('the client waiting limit bounds sleeps and prevents a new call at the deadline', async () => {
	const { poll, delays } = harness();
	let calls = 0;
	await assert.rejects(poll(async () => {
		calls++;
		return response('COLLECTING');
	}, response('COLLECTING'), { timeoutMs: 6_000 }), { code: 'CLIENT_POLL_TIMEOUT' });
	assert.equal(calls, 1);
	assert.deepEqual(delays, [5_000, 1_000]);
});

test('authentication expiry bounds approval waiting, including the accepted expiry fallback', async () => {
	const { poll, delays, now } = harness();
	const expiresAt = new Date(now() + 6_000).toISOString();
	let calls = 0;
	await assert.rejects(poll(async () => {
		calls++;
		return response('AUTH_WAITING');
	}, response('AUTH_REQUESTED', { expiresAt })), { code: 'AUTH_WAIT_TIMEOUT' });
	assert.equal(calls, 1);
	assert.deepEqual(delays, [5_000, 1_000]);
});

test('approval completion lets collection continue beyond the authentication expiry', async () => {
	const { poll, delays, now } = harness();
	const expiresAt = new Date(now() + 6_000).toISOString();
	const expected = result();
	const sequence = [response('AUTH_COMPLETED', { expiresAt }), response('COLLECTING'), response('COLLECTED'), expected];
	assert.equal(await poll(async () => {
		assert.ok(sequence.length);
		return sequence.shift();
	}, response('AUTH_REQUESTED', { expiresAt })), expected);
	assert.deepEqual(delays, [5_000, 10_000, 20_000, 30_000]);
});

test('transport errors propagate without retrying', async () => {
	const { poll, delays } = harness();
	const error = new Error('connection failed');
	await assert.rejects(poll(async () => { throw error; }, response('AUTH_REQUESTED')), actual => actual === error);
	assert.deepEqual(delays, [5_000]);
});

for (const file of files) {
	for (const status of ['SUCCESS', 'PARTIAL_SUCCESS', 'RESULT_EXPIRED', ...failed]) {
		test(`${file}: usage handles ${status} through the SDK with one acceptance`, async () => {
			const { poll } = harness(file);
			const terminal = status === 'RESULT_EXPIRED'
				? response('SUCCESS', { errorCode: status })
				: failed.includes(status) ? response(status) : result(status);
			const requests = [];
			const output = { log: [], warn: [], error: [] };
			const client = new ApickClient({
				apiKey: 'test-key', baseUrl: 'https://api.example.test',
				fetch: async (url, options) => {
					requests.push({ url, body: Object.fromEntries(options.body) });
					assert.ok(requests.length <= 2, 'must not reauthenticate or keep polling');
					const body = requests.length === 1 ? response('AUTH_REQUESTED') : terminal;
					return new Response(JSON.stringify({ ...body, api: { success: true, cost: 0 } }), { headers: { 'content-type': 'application/json' } });
				}
			});
			const logger = Object.fromEntries(Object.keys(output).map(level => [level, value => output[level].push(value)]));
			const run = new Function('pollDataResult', 'apick', 'client', 'console', `return (async () => {\n${example(file, 'usage')}\n})();`);
			const promise = run(poll, client, client, logger);
			if (failed.includes(status)) await assert.rejects(promise, { code: status });
			else await promise;
			const product = file === 'README.md' ? 'employment' : 'driving_license';
			assert.deepEqual(requests.map(request => new URL(request.url).pathname), [`/rest/req_${product}`, `/rest/get_${product}`]);
			assert.deepEqual(requests[1].body, { transactionId });
			assert.deepEqual(output.log, completed.includes(status) ? [terminal.data.result] : []);
			assert.deepEqual(output.warn, status === 'PARTIAL_SUCCESS' ? [terminal.data.sources] : []);
			assert.equal(output.error.length, status === 'RESULT_EXPIRED' ? 1 : 0);
		});
	}
}
