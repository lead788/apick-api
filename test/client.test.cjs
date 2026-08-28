'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const {
	ApickClient,
	ApickApiError,
	ApickBinaryResult,
	SERVICES
} = require('../src/index.cjs');

function jsonResponse(body, options) {
	return new Response(JSON.stringify(body), {
		status: options && options.status || 200,
		headers: { 'content-type': 'application/json' }
	});
}

test('exports a focused catalog of 20 named services', () => {
	assert.equal(Object.keys(SERVICES).length, 20);
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
	assert.equal(request.options.headers.CL_AUTH_KEY, 'private-test-key');
	assert.deepEqual(JSON.parse(request.options.body), { biz_no: '4398700761' });
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

test('validates inputs before making a request', async () => {
	let calls = 0;
	const client = new ApickClient({ apiKey: 'key', fetch: async () => { calls += 1; } });
	assert.throws(() => client.businessDetails('1234'), /10 digits/);
	assert.throws(() => client.holidays(1800, 1), /1900/);
	assert.throws(() => client.textToSpeech('hello', { language: 'xx' }), /language/);
	assert.throws(() => client.jsonToExcel({ value: 1 }), /array/);
	assert.equal(calls, 0);
});

test('ESM and CommonJS entry points expose the same client', async () => {
	const esm = await import('../src/index.js');
	assert.equal(esm.default, ApickClient);
	assert.equal(esm.ApickApiError, ApickApiError);
});
