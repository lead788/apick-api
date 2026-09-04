'use strict';

const DEFAULT_BASE_URL = 'https://apick.app';
const DEFAULT_TIMEOUT_MS = 30_000;
const MAX_OCR_BYTES = 50 * 1024 * 1024;
const MAX_IMAGE_AI_BYTES = 50 * 1024 * 1024;
const TTS_VOICE_IDS = Object.freeze([
	'narrator_m_01', 'narrator_m_02', 'narrator_m_03', 'narrator_m_04', 'narrator_m_05',
	'narrator_f_10s_01', 'narrator_f_10s_02', 'narrator_f_10s_03',
	'narrator_m_20s_01', 'narrator_f_20s_01', 'narrator_f_20s_02',
	'narrator_f_20s_03', 'narrator_f_20s_04', 'narrator_m_30s_01',
	'narrator_m_30s_02', 'narrator_m_40s_01', 'narrator_m_80s_01'
]);
const TTS_VOICE_ID_SET = new Set(TTS_VOICE_IDS);

const SERVICE_DEFINITIONS = Object.freeze({
	businessDetails: { endpoint: '/rest/biz_detail', timeoutMs: 50_000, output: 'json' },
	ventureBusiness: { endpoint: '/rest/venture_biz_info', timeoutMs: 50_000, output: 'json' },
	trackParcel: { endpoint: '/rest/parcel_tracking', timeoutMs: 30_000, output: 'json' },
	trackParcelAuto: { endpoint: '/rest/parcel_tracking_auto', timeoutMs: 30_000, output: 'json' },
	validateEmail: { endpoint: '/rest/check_email_valid', timeoutMs: 20_000, output: 'json' },
	validatePhone: { endpoint: '/rest/check_phone_valid', timeoutMs: 20_000, output: 'json' },
	holidays: { endpoint: '/rest/holiday_info', timeoutMs: 35_000, output: 'json' },
	searchAddress: { endpoint: '/rest/search_juso', timeoutMs: 20_000, output: 'json' },
	ocr: { endpoint: '/rest/ocr', timeoutMs: 35_000, output: 'json' },
	maskResidentNumber: { endpoint: '/rest/hide_rrn', timeoutMs: 35_000, output: 'binary', filename: 'masked.png' },
	maskResidenceCard: { endpoint: '/rest/identity_document_residence_card', timeoutMs: 35_000, output: 'json' },
	maskPassport: { endpoint: '/rest/identity_document_passport', timeoutMs: 35_000, output: 'json' },
	maskIdCard: { endpoint: '/rest/identity_document_id_card', timeoutMs: 35_000, output: 'json' },
	maskDriverLicense: { endpoint: '/rest/identity_document_driver_license', timeoutMs: 35_000, output: 'json' },
	dnsLookup: { endpoint: '/rest/nslookup', timeoutMs: 16_000, output: 'json' },
	geolocate: { endpoint: '/rest/location', timeoutMs: 35_000, output: 'json' },
	whois: { endpoint: '/rest/whois', timeoutMs: 35_000, output: 'json' },
	googleSearch: { endpoint: '/rest/google_search', timeoutMs: 35_000, output: 'json' },
	googleImageSearch: { endpoint: '/rest/google_image_search', timeoutMs: 35_000, output: 'json' },
	screenshot: { endpoint: '/rest/url_screenshot', timeoutMs: 75_000, output: 'binary', filename: 'screenshot.jpeg' },
	createTtsJob: { endpoint: '/rest/tts/jobs', timeoutMs: 35_000, output: 'json' },
	htmlToPdf: { endpoint: '/rest/html_to_pdf', timeoutMs: 25_000, output: 'binary', filename: 'document.pdf' },
	jsonToExcel: { endpoint: '/rest/json_to_excel', timeoutMs: 45_000, output: 'binary', filename: 'data.xlsx' },
	summarize: { endpoint: '/rest/llm/text_summary', timeoutMs: 75_000, output: 'json' },
	polish: { endpoint: '/rest/llm/text_polish', timeoutMs: 105_000, output: 'json' },
	generateImages: { endpoint: '/rest/image-generation/generate', timeoutMs: 190_000, output: 'json' }
});

const SERVICES = Object.freeze(Object.fromEntries(
	Object.entries(SERVICE_DEFINITIONS).map(([name, definition]) => [
		name,
		Object.freeze({ endpoint: definition.endpoint, output: definition.output })
	])
));

function redact(value, apiKey) {
	let text = String(value || '');
	if (apiKey) text = text.split(apiKey).join('***');
	return text.replace(/(CL_AUTH_KEY\s*[:=]\s*)\S+/gi, '$1***');
}

function requiredString(name, value, maxLength) {
	if (typeof value !== 'string' || !value.trim()) {
		throw new TypeError(`${name} must be a non-empty string.`);
	}
	const normalized = value.trim();
	if (maxLength && normalized.length > maxLength) {
		throw new RangeError(`${name} must not exceed ${maxLength} characters.`);
	}
	return normalized;
}

function positiveInteger(name, value, defaultValue) {
	if (value === undefined || value === null || value === '') return defaultValue;
	const number = Number(value);
	if (!Number.isInteger(number) || number < 1) {
		throw new RangeError(`${name} must be a positive integer.`);
	}
	return number;
}

function normalizeBusinessNumber(value) {
	const normalized = requiredString('businessNumber', value).replace(/-/g, '');
	if (!/^\d{10}$/.test(normalized)) {
		throw new TypeError('businessNumber must contain exactly 10 digits.');
	}
	return normalized;
}

function normalizeUrl(value) {
	const input = requiredString('url', value);
	let parsed;
	try {
		parsed = new URL(input);
	} catch {
		throw new TypeError('url must be a valid HTTP or HTTPS URL.');
	}
	if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
		throw new TypeError('url must use HTTP or HTTPS.');
	}
	return parsed.toString();
}

function normalizeTtsJobId(value) {
	const jobId = requiredString('jobId', value);
	if (!/^[a-f0-9]{32}$/.test(jobId)) throw new TypeError('jobId must be a 32-character lowercase hexadecimal string.');
	return jobId;
}

function normalizeTtsVoice(value) {
	const voiceId = requiredString('voiceId', value);
	if (!TTS_VOICE_ID_SET.has(voiceId)) throw new RangeError('voiceId must be one of the supported TTS voice IDs.');
	return voiceId;
}

function numberOrNull(value) {
	if (value === undefined || value === null || value === '') return null;
	const number = Number(value);
	return Number.isFinite(number) ? number : null;
}

function responseMeta(api, headers) {
	const metadata = api && typeof api === 'object' ? api : {};
	const readHeader = (name) => headers && typeof headers.get === 'function' ? headers.get(name) : null;
	return Object.freeze({
		cost: numberOrNull(metadata.cost ?? readHeader('cost')),
		durationMs: numberOrNull(metadata.ms ?? readHeader('ms'))
	});
}

function publicErrorMessage(body, fallback) {
	if (!body || typeof body !== 'object') return fallback;
	const candidates = [
		body.data && body.data.error,
		body.result && body.result.error,
		body.error,
		body.message,
		body.msg
	];
	for (const candidate of candidates) {
		if (typeof candidate === 'string' && candidate.trim()) return candidate.trim();
	}
	return fallback;
}

function parseFilename(headerValue, fallback) {
	if (typeof headerValue !== 'string') return fallback;
	const encoded = /filename\*=UTF-8''([^;]+)/i.exec(headerValue);
	if (encoded) {
		try { return decodeURIComponent(encoded[1]).replace(/[\\/]/g, '_'); } catch { /* use fallback parser */ }
	}
	const plain = /filename="?([^";]+)"?/i.exec(headerValue);
	return plain ? plain[1].trim().replace(/[\\/]/g, '_') : fallback;
}

function inferImageType(filename) {
	const lower = String(filename || '').toLowerCase();
	if (lower.endsWith('.png')) return 'image/png';
	if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
	if (lower.endsWith('.webp')) return 'image/webp';
	return '';
}

async function normalizeImage(image, options) {
	const config = options || {};
	let blob;
	let filename = config.filename || '';

	if (typeof image === 'string') {
		const [{ readFile }, path] = await Promise.all([
			import('node:fs/promises'),
			import('node:path')
		]);
		const bytes = await readFile(image);
		filename = filename || path.basename(image);
		blob = new Blob([bytes], { type: config.contentType || inferImageType(filename) });
	} else if (typeof Blob !== 'undefined' && image instanceof Blob) {
		blob = image;
		filename = filename || (typeof image.name === 'string' ? image.name : 'image.png');
	} else if (image && typeof image.arrayBuffer === 'function') {
		const bytes = await image.arrayBuffer();
		filename = filename || (typeof image.name === 'string' ? image.name : 'image.png');
		blob = new Blob([bytes], { type: config.contentType || image.type || inferImageType(filename) });
	} else if (image instanceof ArrayBuffer || ArrayBuffer.isView(image)) {
		filename = filename || 'image.png';
		blob = new Blob([image], { type: config.contentType || inferImageType(filename) });
	} else {
		throw new TypeError('image must be a file path, Blob, ArrayBuffer, or typed array.');
	}

	const contentType = config.contentType || blob.type || inferImageType(filename);
	const allowedTypes = config.allowedTypes || ['image/png', 'image/jpeg'];
	if (!allowedTypes.includes(contentType)) {
		throw new TypeError(config.typeError || 'OCR supports PNG and JPEG images only.');
	}
	if (blob.size > (config.maxBytes || MAX_OCR_BYTES)) {
		throw new RangeError('image must not exceed 50 MB.');
	}
	return { blob, filename, contentType };
}

class ApickApiError extends Error {
	constructor(message, options) {
		super(message);
		this.name = 'ApickApiError';
		this.status = options && options.status || 0;
		this.code = options && options.code || 'APICK_API_ERROR';
		this.serviceCode = options && options.serviceCode || undefined;
	}

	toJSON() {
		return {
			name: this.name,
			message: this.message,
			status: this.status,
			code: this.code,
			serviceCode: this.serviceCode
		};
	}
}

class ApickBinaryResult {
	constructor(bytes, options) {
		this.bytes = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
		this.contentType = options.contentType || 'application/octet-stream';
		this.filename = options.filename || 'result.bin';
		this.meta = options.meta;
		Object.freeze(this.meta);
	}

	get size() {
		return this.bytes.byteLength;
	}

	toArrayBuffer() {
		return this.bytes.buffer.slice(this.bytes.byteOffset, this.bytes.byteOffset + this.bytes.byteLength);
	}

	toBlob() {
		return new Blob([this.bytes], { type: this.contentType });
	}

	async save(filePath) {
		const target = requiredString('filePath', filePath);
		const { writeFile } = await import('node:fs/promises');
		await writeFile(target, this.bytes);
		return target;
	}
}

class ApickClient {
	#apiKey;
	#fetch;
	#baseUrl;
	#timeoutMs;

	constructor(apiKeyOrOptions) {
		const options = typeof apiKeyOrOptions === 'string'
			? { apiKey: apiKeyOrOptions }
			: (apiKeyOrOptions || {});

		this.#apiKey = requiredString('apiKey', options.apiKey);
		this.#fetch = options.fetch || globalThis.fetch;
		if (typeof this.#fetch !== 'function') {
			throw new TypeError('A Fetch API implementation is required. Use Node.js 18+ or pass options.fetch.');
		}

		let baseUrl;
		try {
			baseUrl = new URL(options.baseUrl || DEFAULT_BASE_URL);
		} catch {
			throw new TypeError('baseUrl must be a valid HTTPS URL.');
		}
		if (baseUrl.protocol !== 'https:' || baseUrl.username || baseUrl.password) {
			throw new TypeError('baseUrl must be an HTTPS URL without embedded credentials.');
		}
		this.#baseUrl = baseUrl.toString().replace(/\/+$/, '');
		this.#timeoutMs = options.timeoutMs === undefined
			? null
			: positiveInteger('timeoutMs', options.timeoutMs);
	}

	async _call(serviceName, payload, formData, requestOptions) {
		const baseDefinition = SERVICE_DEFINITIONS[serviceName];
		if (!baseDefinition) throw new TypeError(`Unknown APICK service: ${serviceName}`);
		const definition = Object.assign({}, baseDefinition, requestOptions || {});

		const controller = new AbortController();
		const timeoutMs = this.#timeoutMs || definition.timeoutMs || DEFAULT_TIMEOUT_MS;
		const timer = setTimeout(() => controller.abort(), timeoutMs);
		const headers = {
			Accept: definition.output === 'binary' ? '*/*' : 'application/json',
			CL_AUTH_KEY: this.#apiKey
		};
		const method = definition.method || 'POST';
		const request = {
			method,
			headers,
			signal: controller.signal,
			redirect: 'error'
		};
		if (method !== 'GET') {
			request.body = formData || JSON.stringify(payload || {});
			if (!formData) headers['Content-Type'] = 'application/json';
		}

		let response;
		try {
			response = await this.#fetch(this.#baseUrl + definition.endpoint, request);
		} catch (error) {
			const timedOut = controller.signal.aborted || error && error.name === 'AbortError';
			throw new ApickApiError(
				timedOut ? `APICK request timed out after ${timeoutMs} ms.` : redact(error && error.message || 'APICK network request failed.', this.#apiKey),
				{ code: timedOut ? 'APICK_TIMEOUT' : 'APICK_NETWORK_ERROR' }
			);
		} finally {
			clearTimeout(timer);
		}

		const contentType = String(response.headers.get('content-type') || '').toLowerCase();
		const isJson = contentType.includes('application/json') || contentType.includes('+json');

		if (definition.output === 'binary' && !isJson && response.ok) {
			const bytes = new Uint8Array(await response.arrayBuffer());
			return new ApickBinaryResult(bytes, {
				contentType: contentType.split(';')[0] || 'application/octet-stream',
				filename: parseFilename(response.headers.get('content-disposition'), definition.filename),
				meta: responseMeta(null, response.headers)
			});
		}

		const raw = await response.text();
		let body;
		try {
			body = raw ? JSON.parse(raw) : null;
		} catch {
			throw new ApickApiError(`APICK returned an unexpected response (HTTP ${response.status}).`, {
				status: response.status,
				code: 'APICK_INVALID_RESPONSE'
			});
		}

		const failureMessage = publicErrorMessage(body, 'APICK request failed.');
		const bodyFailed = Boolean(
			body && body.data && body.data.error
			|| body && body.result && body.result.error
			|| body && body.api && body.api.success === false
		);
		if (!response.ok || bodyFailed || definition.output === 'binary') {
			throw new ApickApiError(failureMessage, {
				status: response.status,
				code: response.status === 401 ? 'APICK_AUTH_ERROR' : 'APICK_API_ERROR',
				serviceCode: body && body.data && typeof (body.data.code || body.data.error_code) === 'string' ? (body.data.code || body.data.error_code) : undefined
			});
		}

		return Object.freeze({
			data: body && Object.prototype.hasOwnProperty.call(body, 'data') ? body.data : body,
			meta: responseMeta(body && body.api, response.headers)
		});
	}

	businessDetails(businessNumber) {
		return this._call('businessDetails', { biz_no: normalizeBusinessNumber(businessNumber) });
	}

	ventureBusiness(businessNumber) {
		return this._call('ventureBusiness', { biz_no: normalizeBusinessNumber(businessNumber) });
	}

	trackParcel(carrier, trackingNumber) {
		return this._call('trackParcel', {
			carrier: requiredString('carrier', carrier),
			trackingNumber: requiredString('trackingNumber', trackingNumber)
		});
	}

	trackParcelAuto(trackingNumber) {
		return this._call('trackParcelAuto', { trackingNumber: requiredString('trackingNumber', trackingNumber) });
	}

	validateEmail(email) {
		return this._call('validateEmail', { email: requiredString('email', email) });
	}

	validatePhone(number) {
		return this._call('validatePhone', { number: requiredString('number', number) });
	}

	holidays(year, month) {
		const normalizedYear = Number(year);
		const normalizedMonth = Number(month);
		if (!Number.isInteger(normalizedYear) || normalizedYear < 1900 || normalizedYear > 2200) {
			throw new RangeError('year must be an integer from 1900 through 2200.');
		}
		if (!Number.isInteger(normalizedMonth) || normalizedMonth < 1 || normalizedMonth > 12) {
			throw new RangeError('month must be an integer from 1 through 12.');
		}
		return this._call('holidays', {
			year: String(normalizedYear),
			month: String(normalizedMonth).padStart(2, '0')
		});
	}

	searchAddress(query, options) {
		const config = options || {};
		return this._call('searchAddress', {
			juso: requiredString('query', query),
			page: String(positiveInteger('page', config.page, 1))
		});
	}

	async ocr(image, options) {
		const upload = await normalizeImage(image, options);
		const form = new FormData();
		form.append('image', upload.blob, upload.filename);
		return this._call('ocr', null, form);
	}

	async _maskImage(serviceName, image, options, type) {
		const upload = await normalizeImage(image, options);
		const form = new FormData();
		form.append('image', upload.blob, upload.filename);
		if (type !== undefined) form.append('type', String(type));
		return this._call(serviceName, null, form);
	}

	maskResidentNumber(image, options) {
		const config = options || {};
		const type = Number(config.type);
		if (![1, 2, 3].includes(type)) throw new RangeError('type must be one of: 1, 2, 3.');
		return this._maskImage('maskResidentNumber', image, config, type);
	}

	maskResidenceCard(image, options) { return this._maskImage('maskResidenceCard', image, options); }
	maskPassport(image, options) { return this._maskImage('maskPassport', image, options); }
	maskIdCard(image, options) { return this._maskImage('maskIdCard', image, options); }
	maskDriverLicense(image, options) { return this._maskImage('maskDriverLicense', image, options); }

	dnsLookup(domain) {
		return this._call('dnsLookup', { domain: requiredString('domain', domain) });
	}

	geolocate(address) {
		return this._call('geolocate', { address: requiredString('address', address) });
	}

	whois(address) {
		return this._call('whois', { address: requiredString('address', address) });
	}

	googleSearch(keyword, options) {
		const config = options || {};
		return this._call('googleSearch', {
			keyword: requiredString('keyword', keyword),
			page: String(positiveInteger('page', config.page, 1))
		});
	}

	googleImageSearch(keyword, options) {
		const config = options || {};
		return this._call('googleImageSearch', {
			keyword: requiredString('keyword', keyword),
			page: String(positiveInteger('page', config.page, 1))
		});
	}

	screenshot(url) {
		return this._call('screenshot', { url: normalizeUrl(url) });
	}

	createTtsJob(text, options) {
		const config = options || {};
		return this._call('createTtsJob', {
			voice_id: normalizeTtsVoice(config.voiceId || 'narrator_m_03'),
			text: requiredString('text', text, 800)
		});
	}

	getTtsJob(jobId) {
		const id = normalizeTtsJobId(jobId);
		return this._call('createTtsJob', null, null, { endpoint: '/rest/tts/jobs/' + id, method: 'GET' });
	}

	cancelTtsJob(jobId) {
		const id = normalizeTtsJobId(jobId);
		return this._call('createTtsJob', null, null, { endpoint: '/rest/tts/jobs/' + id + '/cancel' });
	}

	downloadTtsResult(jobId) {
		const id = normalizeTtsJobId(jobId);
		return this._call('createTtsJob', null, null, {
			endpoint: '/rest/tts/jobs/' + id + '/result',
			method: 'GET',
			output: 'binary',
			filename: id + '.mp3'
		});
	}

	downloadTtsSubtitles(jobId) {
		const id = normalizeTtsJobId(jobId);
		return this._call('createTtsJob', null, null, {
			endpoint: '/rest/tts/jobs/' + id + '/subtitles',
			method: 'GET',
			output: 'binary',
			filename: id + '.ass'
		});
	}

	htmlToPdf(html, options) {
		const config = options || {};
		return this._call('htmlToPdf', {
			html: requiredString('html', html),
			pagination: config.pagination ? 1 : 0
		});
	}

	jsonToExcel(data, options) {
		if (!Array.isArray(data)) throw new TypeError('data must be an array.');
		const config = options || {};
		const payload = { data_list: data };
		if (config.sheetName !== undefined) payload.sheet_name = requiredString('sheetName', config.sheetName);
		return this._call('jsonToExcel', payload);
	}

	summarize(text) {
		return this._call('summarize', { text: requiredString('text', text, 100_000) });
	}

	polish(text) {
		return this._call('polish', { text: requiredString('text', text, 100_000) });
	}

	_imageOptions(prompt, options, maxCount) {
		const config = options || {};
		for (const key of ['model', 'quality', 'n', 'input_fidelity', 'moderation']) {
			if (Object.prototype.hasOwnProperty.call(config, key)) throw new TypeError(`${key} is not a supported image option.`);
		}
		const count = positiveInteger('count', config.count, 1);
		if (count > maxCount) throw new RangeError(`count must not exceed ${maxCount}.`);
		const payload = {
			prompt: requiredString('prompt', prompt, 6_000), count,
			size: config.size || '1024x1024', output_format: config.outputFormat || 'png',
			background: config.background || 'auto'
		};
		if (config.outputCompression !== undefined) payload.output_compression = config.outputCompression;
		if (config.idempotencyKey !== undefined) {
			payload.idempotency_key = requiredString('idempotencyKey', config.idempotencyKey, 128);
			if (!/^[A-Za-z0-9_-]{8,128}$/.test(payload.idempotency_key)) throw new TypeError('idempotencyKey must use 8-128 letters, numbers, underscores, or hyphens.');
		}
		return payload;
	}

	generateImages(prompt, options) {
		return this._call('generateImages', this._imageOptions(prompt, options, 4));
	}

	async editImages(image, prompt, options) {
		const config = options || {}, payload = this._imageOptions(prompt, config, 4);
		const uploadOptions = Object.assign({}, config, { allowedTypes:['image/png','image/jpeg','image/webp'], maxBytes:MAX_IMAGE_AI_BYTES, typeError:'image must be PNG, JPEG, or WebP.' });
		const source = await normalizeImage(image, uploadOptions), form = new FormData();
		Object.entries(payload).forEach(([key,value]) => form.append(key, String(value)));
		form.append('image', source.blob, source.filename);
		if (config.mask !== undefined) {
			const mask = await normalizeImage(config.mask, Object.assign({}, uploadOptions, { filename:config.maskFilename || 'mask.png', contentType:config.maskContentType, allowedTypes:['image/png','image/webp'], typeError:'mask must be PNG or WebP.' }));
			if (source.blob.size + mask.blob.size > MAX_IMAGE_AI_BYTES) throw new RangeError('image and mask together must not exceed 50 MB.');
			form.append('mask', mask.blob, mask.filename);
		}
		return this._call('generateImages', null, form, { endpoint:'/rest/image-generation/edit' });
	}

	createImageGenerationJob(prompt, options) {
		return this._call('generateImages', this._imageOptions(prompt, options, 50), null, { endpoint:'/rest/image-generation/jobs/generate', timeoutMs:60_000 });
	}

	async createImageEditJob(image, prompt, options) {
		const config = options || {}, payload = this._imageOptions(prompt, config, 50);
		const uploadOptions = Object.assign({}, config, { allowedTypes:['image/png','image/jpeg','image/webp'], maxBytes:MAX_IMAGE_AI_BYTES, typeError:'image must be PNG, JPEG, or WebP.' });
		const source = await normalizeImage(image, uploadOptions), form = new FormData();
		Object.entries(payload).forEach(([key,value]) => form.append(key, String(value)));
		form.append('image', source.blob, source.filename);
		if (config.mask !== undefined) {
			const mask = await normalizeImage(config.mask, Object.assign({}, uploadOptions, { filename:config.maskFilename || 'mask.png', contentType:config.maskContentType, allowedTypes:['image/png','image/webp'], typeError:'mask must be PNG or WebP.' }));
			if (source.blob.size + mask.blob.size > MAX_IMAGE_AI_BYTES) throw new RangeError('image and mask together must not exceed 50 MB.');
			form.append('mask', mask.blob, mask.filename);
		}
		return this._call('generateImages', null, form, { endpoint:'/rest/image-generation/jobs/edit', timeoutMs:60_000 });
	}

	getImageJob(jobId) {
		const id = normalizeTtsJobId(jobId);
		return this._call('generateImages', null, null, { endpoint:'/rest/image-generation/jobs/'+id, method:'GET', timeoutMs:30_000 });
	}

	cancelImageJob(jobId) {
		const id = normalizeTtsJobId(jobId);
		return this._call('generateImages', null, null, { endpoint:'/rest/image-generation/jobs/'+id+'/cancel', timeoutMs:30_000 });
	}

	downloadImageJobImage(jobId, index) {
		const id=normalizeTtsJobId(jobId), value=Number(index);
		if(!Number.isInteger(value)||value<0||value>49) throw new RangeError('index must be an integer from 0 through 49.');
		return this._call('generateImages', null, null, { endpoint:'/rest/image-generation/jobs/'+id+'/images/'+value, method:'GET', output:'binary', filename:id+'-'+value+'.bin', timeoutMs:60_000 });
	}

	downloadImageJobArchive(jobId) {
		const id=normalizeTtsJobId(jobId);
		return this._call('generateImages', null, null, { endpoint:'/rest/image-generation/jobs/'+id+'/result', method:'GET', output:'binary', filename:id+'.zip', timeoutMs:60_000 });
	}
}

module.exports = {
	ApickClient,
	ApickApiError,
	ApickBinaryResult,
	SERVICES,
	TTS_VOICE_IDS,
	DEFAULT_BASE_URL
};
