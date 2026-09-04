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
	TTS_VOICE_IDS
} = require('../src/index.cjs');

function jsonResponse(body, options) {
	return new Response(JSON.stringify(body), {
		status: options && options.status || 200,
		headers: { 'content-type': 'application/json' }
	});
}

test('exports a focused catalog of 26 named services', () => {
	assert.equal(Object.keys(SERVICES).length, 26);
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

test('supports synchronous and batch image contracts without provider options', async () => {
	const requests = [];
	const client = new ApickClient({ apiKey:'key', baseUrl:'https://api.example.test', fetch:async (url, options) => {
		requests.push({url,options});
		if (url.endsWith('/images/0')) return new Response(new Uint8Array([1,2,3]), {status:200,headers:{'content-type':'image/png'}});
		return jsonResponse({data:url.includes('/jobs/')?{job_id:'a'.repeat(32),status:'waiting',requested_count:20}:{request_id:'b'.repeat(32),image_count:1,images:[]},api:{success:true,cost:0}});
	}});
	await client.generateImages('제품 사진', { imageCount:1, outputFormat:'webp', idempotencyKey:'image-test-0001' });
	await client.createImageGenerationJob('커버 시안', { imageCount:20 });
	await client.getImageJob('a'.repeat(32));
	const binary=await client.downloadImageJobImage('a'.repeat(32),0);
	assert.equal(binary.contentType,'image/png');
	assert.equal(requests[0].url,'https://api.example.test/rest/image-generation/generate');
	assert.deepEqual(JSON.parse(requests[0].options.body),{prompt:'제품 사진',image_count:1,size:'1024x1024',output_format:'webp',background:'auto',idempotency_key:'image-test-0001'});
	assert.equal(requests[1].url,'https://api.example.test/rest/image-generation/jobs/generate');
	assert.equal(requests[2].options.method,'GET');
	await assert.rejects(client.generateImages('x',{imageCount:5}),/imageCount must not exceed 4/);
	await assert.rejects(client.generateImages('x',{count:1}),/count is not a supported image option/);
	await assert.rejects(client.generateImages('x',{outputCompression:80}),/outputCompression is not a supported image option/);
	await assert.rejects(client.generateImages('x',{size:'2560x1440'}),/size must be one of/);
	await assert.rejects(client.generateImages('x',{model:'hidden'}),/not a supported image option/);
	await assert.rejects(client.generateImages('x',{idempotencyKey:'short'}),/8-128/);
	await client.editImages(Uint8Array.from([1]), '손잡이 색상 변경', {
		filename:'source.webp', contentType:'image/webp'
	});
	assert.equal(requests[4].url,'https://api.example.test/rest/image-generation/edit');
	assert.ok(requests[4].options.body instanceof FormData);
	assert.equal(requests[4].options.body.get('image').name,'source.webp');
	assert.equal(requests[4].options.body.has('mask'),false);
	await client.generateImages('구도를 유지하고 여름 분위기로', {
		referenceImage:Uint8Array.from([1]), referenceFilename:'reference.png', referenceContentType:'image/png'
	});
	assert.ok(requests[5].options.body instanceof FormData);
	assert.equal(requests[5].options.body.get('reference_image').name,'reference.png');
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

test('implements processing cancellation and the one-time MP3 TTS Jobs contract', async () => {
	assert.equal(TTS_VOICE_IDS.length, 17);
	assert.ok(TTS_VOICE_IDS.includes('narrator_f_10s_01'));
	assert.ok(TTS_VOICE_IDS.includes('narrator_m_80s_01'));
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
			return jsonResponse({ data: { job_id: jobId, status: 'waiting', voice_id: 'narrator_m_03', character_count: 14 }, api: { success: true, cost: 10 } }, { status: 202 });
		}
	});
	const created = await client.createTtsJob('오늘의 이야기를 시작합니다.', { voiceId: 'narrator_m_03' });
	assert.equal(created.data.status, 'waiting');
	assert.equal(created.meta.cost, 10);
	assert.deepEqual(JSON.parse(requests[0].options.body), { voice_id: 'narrator_m_03', text: '오늘의 이야기를 시작합니다.' });
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
	assert.throws(() => client.createTtsJob('hello', { voiceId: 'unknown' }), /voiceId/);
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
	assert.throws(() => client.maskResidentNumber(input, { type: 4, filename: 'id.png', contentType: 'image/png' }), /1, 2, 3/);
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

test('validates inputs before making a request', async () => {
	let calls = 0;
	const client = new ApickClient({ apiKey: 'key', fetch: async () => { calls += 1; } });
	assert.throws(() => client.businessDetails('1234'), /10 digits/);
	assert.throws(() => client.holidays(1800, 1), /1900/);
	assert.throws(() => client.createTtsJob('', { voiceId: 'narrator_m_03' }), /text/);
	assert.throws(() => client.jsonToExcel({ value: 1 }), /array/);
	assert.equal(calls, 0);
});

test('ESM and CommonJS entry points expose the same client', async () => {
	const esm = await import('../src/index.js');
	assert.equal(esm.default, ApickClient);
	assert.equal(esm.ApickApiError, ApickApiError);
});
