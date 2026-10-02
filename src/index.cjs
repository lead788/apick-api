'use strict';

const DEFAULT_BASE_URL = 'https://apick.app';
const DEFAULT_TIMEOUT_MS = 30_000;
const MAX_OCR_BYTES = 50 * 1024 * 1024;
const MAX_IMAGE_AI_BYTES = 50 * 1024 * 1024;
const IMAGE_AI_SIZES = Object.freeze(['1024x1024', '1536x1024', '1024x1536', '1152x864', '864x1152']);
const IMAGE_AI_SIZE_SET = new Set(IMAGE_AI_SIZES);
const TTS_VOICE_IDS = Object.freeze([
	'v2_ann_m_30s_01', 'v2_ann_m_30s_02', 'v2_ann_m_30s_04', 'v2_ann_m_30s_05', 'v2_ann_f_30s_02', 'v2_ann_f_30s_03', 'v2_ann_f_30s_04', 'v2_ann_f_30s_05', 'v2_m_teen_01', 'v2_m_young_01', 'v2_m_mid_01', 'v2_m_senior_01', 'v2_f_young_01', 'v2_f_senior_01'
]);
const TTS_VOICE_ID_SET = new Set(TTS_VOICE_IDS);
const AUTH_PROVIDERS = Object.freeze([
	'kakao', 'naver', 'toss', 'pass', 'samsung', 'kb', 'shinhan', 'hana', 'woori', 'ibk', 'nh', 'kakaobank', 'banksalad'
]);
const AUTH_PROVIDER_SET = new Set(AUTH_PROVIDERS);

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
	youtubeMetadata: { endpoint: '/rest/youtube_metadata', timeoutMs: 60_000, output: 'json' },
	youtubeThumbnail: { endpoint: '/rest/youtube_thumbnail', timeoutMs: 60_000, output: 'binary', filename: 'thumbnail.jpg' },
	youtubeSubtitleList: { endpoint: '/rest/youtube_subtitle_list', timeoutMs: 60_000, output: 'json' },
	youtubeSubtitle: { endpoint: '/rest/youtube_subtitle', timeoutMs: 60_000, output: 'binary', filename: 'subtitle.vtt' },
	createTtsJob: { endpoint: '/rest/tts/jobs', timeoutMs: 35_000, output: 'json' },
	createVideoJob: { endpoint: '/rest/seedance/jobs', timeoutMs: 60_000, output: 'json' },
	htmlToPdf: { endpoint: '/rest/html_to_pdf', timeoutMs: 25_000, output: 'binary', filename: 'document.pdf' },
	jsonToExcel: { endpoint: '/rest/json_to_excel', timeoutMs: 45_000, output: 'binary', filename: 'data.xlsx' },
	summarize: { endpoint: '/rest/llm/text_summary', timeoutMs: 75_000, output: 'json' },
	polish: { endpoint: '/rest/llm/text_polish', timeoutMs: 105_000, output: 'json' },
	generateImages: { endpoint: '/rest/image-generation/generate', timeoutMs: 190_000, output: 'json' },
	requestEmployment: { endpoint: '/rest/req_employment', timeoutMs: 35_000, output: 'json' },
	requestPersonalIncome: { endpoint: '/rest/req_personal_income', timeoutMs: 35_000, output: 'json' },
	requestNpsJoinHistory: { endpoint: '/rest/req_nps_join_history', timeoutMs: 35_000, output: 'json' },
	requestDrivingLicense: { endpoint: '/rest/req_driving_license', timeoutMs: 35_000, output: 'json' },
	requestHealthCheckup: { endpoint: '/rest/req_health_checkup', timeoutMs: 35_000, output: 'json' },
	requestCashReceiptDeduction: { endpoint: '/rest/req_cash_receipt_deduction', timeoutMs: 35_000, output: 'json' },
	requestTaxReturnHistory: { endpoint: '/rest/req_tax_return_history', timeoutMs: 35_000, output: 'json' }
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
	return text.replace(/(Authorization\s*:\s*Bearer\s*)\S+/gi, '$1***').replace(/(CL_AUTH_KEY\s*[:=]\s*)\S+/gi, '$1***');
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

function normalizeAuthProvider(value) {
	const provider = requiredString('authProvider', value).toLowerCase();
	if (!AUTH_PROVIDER_SET.has(provider)) throw new RangeError('authProvider must be one of the supported simple-auth providers.');
	return provider;
}

function normalizeBirthDate(value) {
	const birthDate = requiredString('birthDate', value);
	if (!/^(18|19|20)\d{6}$/.test(birthDate)) throw new TypeError('birthDate must be 8 digits (YYYYMMDD).');
	return birthDate;
}

function normalizeKoreanMobile(value) {
	const phone = requiredString('phone', value).replace(/[^0-9]/g, '');
	if (!/^01[0-9]{8,9}$/.test(phone)) throw new TypeError('phone must be a Korean mobile number (digits only).');
	return phone;
}

function normalizeTransactionId(value) {
	const transactionId = requiredString('transactionId', value);
	if (!/^[a-f0-9]{32}$/.test(transactionId)) throw new TypeError('transactionId must be a 32-character lowercase hexadecimal string.');
	return transactionId;
}

function normalizeYearMonth(name, value) {
	if (value === undefined || value === null || value === '') return undefined;
	const text = requiredString(name, value);
	if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(text)) throw new TypeError(`${name} must be in YYYY-MM format.`);
	return text;
}

function optionalRangeInteger(name, value, min, max) {
	if (value === undefined || value === null || value === '') return undefined;
	const number = Number(value);
	if (!Number.isInteger(number) || number < min || number > max) {
		throw new RangeError(`${name} must be an integer between ${min} and ${max}.`);
	}
	return number;
}

// 재직·소득·연금·면허·건강검진 등 간편인증 기반 조회 상품의 공통 입력.
// 서버는 최상위 평면 필드명을 그대로 받으므로 여기서 만든 객체가 폼 필드 이름이 된다.
function dataRequestInput(input) {
	const config = input || {};
	return {
		name: requiredString('name', config.name),
		birthDate: normalizeBirthDate(config.birthDate),
		phone: normalizeKoreanMobile(config.phone),
		authProvider: normalizeAuthProvider(config.authProvider)
	};
}

const SKILL_CATEGORIES = Object.freeze(['data', 'ai', 'dev', 'document', 'marketing', 'finance', 'productivity', 'video', 'etc']);
const SKILL_CATEGORY_SET = new Set(SKILL_CATEGORIES);
const SKILL_SORTS = Object.freeze(['recommended', 'popular', 'used', 'likes', 'rating', 'new', 'mine', 'liked']);
const SKILL_SORT_SET = new Set(SKILL_SORTS);

function normalizeSkillId(value) {
	return encodeURIComponent(requiredString('skillId', value, 80));
}

function normalizeSkillRunId(value) {
	return encodeURIComponent(requiredString('runId', value, 64));
}

function skillInput(value) {
	if (!value || typeof value !== 'object' || Array.isArray(value)) throw new TypeError('input must be a plain object matching the Skill input_schema.');
	return value;
}

function optionalSkillText(name, value, maxLength) {
	if (value === undefined || value === null || value === '') return undefined;
	return requiredString(name, String(value), maxLength);
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
		if (options && options.details !== undefined) this.details = options.details;
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
			Authorization: `Bearer ${this.#apiKey}`
		};
		const method = definition.method || 'POST';
		const request = {
			method,
			headers,
			signal: controller.signal,
			redirect: 'error'
		};
		if (method !== 'GET') {
			request.body = formData || require('./form.cjs').createForm(payload || {}, definition.endpoint);
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
		if (![1, 2, 3, 4].includes(type)) throw new RangeError('type must be one of: 1, 2, 3, 4.');
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

	// 유튜브 공개 영상. url 은 영상 주소(watch·youtu.be·shorts) 또는 11자리 영상 ID를 받는다.
	youtubeMetadata(url) {
		return this._call('youtubeMetadata', { url: requiredString('url', url, 2048) });
	}

	youtubeThumbnail(url) {
		return this._call('youtubeThumbnail', { url: requiredString('url', url, 2048) });
	}

	youtubeSubtitleList(url) {
		return this._call('youtubeSubtitleList', { url: requiredString('url', url, 2048) });
	}

	youtubeSubtitle(url, lang, options) {
		const config = options || {};
		const payload = { url: requiredString('url', url, 2048), lang: requiredString('lang', lang, 32) };
		if (config.format !== undefined) {
			if (!['vtt', 'srt', 'txt'].includes(config.format)) throw new RangeError('format must be vtt, srt or txt.');
			payload.format = config.format;
		}
		if (config.type !== undefined) {
			if (!['any', 'manual', 'auto'].includes(config.type)) throw new RangeError('type must be any, manual or auto.');
			payload.type = config.type;
		}
		return this._call('youtubeSubtitle', payload, null, { filename: 'subtitle.' + (payload.format || 'vtt') });
	}

	async createVideoJob(model, prompt, options) {
		if (!['seedance', 'veo', 'kling'].includes(model)) throw new RangeError('model must be seedance, veo or kling.');
		const config = options || {};
		const payload = { prompt: config.mode === 'reference' && prompt === '' ? '' : requiredString('prompt', prompt, 2000) };
		for (const [key, field] of Object.entries({ version:'version', tier:'tier', mode:'mode', duration:'duration', aspectRatio:'aspect_ratio', resolution:'resolution', audio:'audio', negativePrompt:'negative_prompt', seed:'seed', cfgScale:'cfg_scale', idempotencyKey:'idempotency_key' })) {
			if (config[key] !== undefined) payload[field] = config[key];
		}
		const files = [['image', config.image], ['last_image', config.lastImage]];
		for (const input of config.referenceImages || []) files.push(['reference_image', input]);
		for (const input of config.referenceVideos || []) files.push(['reference_video', input]);
		for (const input of config.referenceAudios || []) files.push(['reference_audio', input]);
		const present = files.filter(([, input]) => input !== undefined);
		const request = { endpoint: '/rest/' + model + '/jobs' };
		if (!present.length) return this._call('createVideoJob', payload, null, request);
		const form = new FormData();
		for (const [key, value] of Object.entries(payload)) form.append(key, String(value));
		for (const [field, input] of present) {
			if (field !== 'reference_video' && field !== 'reference_audio') {
				const upload = await normalizeImage(input);
				form.append(field, upload.blob, upload.filename);
			} else {
				let bytes, filename, contentType;
				if (typeof input === 'string') {
					bytes = await require('node:fs/promises').readFile(input);
					filename = require('node:path').basename(input);
					contentType = field === 'reference_audio' ? (/\.wav$/i.test(filename) ? 'audio/wav' : 'audio/mpeg') : /\.webm$/i.test(filename) ? 'video/webm' : /\.mov$/i.test(filename) ? 'video/quicktime' : 'video/mp4';
				} else { bytes = await input.arrayBuffer(); filename = input.name || (field === 'reference_audio' ? 'reference.mp3' : 'reference.mp4'); contentType = input.type || (field === 'reference_audio' ? 'audio/mpeg' : 'video/mp4'); }
				const allowed = field === 'reference_audio' ? ['audio/mpeg', 'audio/wav', 'audio/x-wav'] : ['video/mp4', 'video/quicktime', 'video/webm'];
				const maxBytes = field === 'reference_audio' ? 15 * 1024 * 1024 : 100 * 1024 * 1024;
				if (!allowed.includes(contentType) || bytes.byteLength < 1 || bytes.byteLength > maxBytes) throw new RangeError(field === 'reference_audio' ? 'Invalid reference audio.' : 'Invalid reference video.');
				form.append(field, new Blob([bytes], { type: contentType }), filename);
			}
		}
		return this._call('createVideoJob', null, form, request);
	}

	getVideoJob(model, jobId) {
		if (!['seedance', 'veo', 'kling'].includes(model) || !/^[a-f0-9]{32}$/.test(jobId)) throw new RangeError('Invalid video model or job ID.');
		return this._call('createVideoJob', null, null, { endpoint:'/rest/'+model+'/jobs/'+jobId, method:'GET', timeoutMs:30_000 });
	}

	downloadVideoResult(model, jobId) {
		if (!['seedance', 'veo', 'kling'].includes(model) || !/^[a-f0-9]{32}$/.test(jobId)) throw new RangeError('Invalid video model or job ID.');
		return this._call('createVideoJob', null, null, { endpoint:'/rest/'+model+'/jobs/'+jobId+'/result', method:'GET', output:'binary', filename:jobId+'.mp4', timeoutMs:60_000 });
	}

	createTtsJob(text, options) {
		const config = options || {};
		return this._call('createTtsJob', {
			voice_id: normalizeTtsVoice(config.voiceId || 'v2_ann_m_30s_01'),
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

	getTtsQuality(jobId) {
		const id = normalizeTtsJobId(jobId);
		return this._call('createTtsJob', null, null, { endpoint: '/rest/tts/jobs/' + id + '/quality', method: 'GET' });
	}

	retryTtsJob(jobId, utteranceIds, idempotencyKey) {
		const id = normalizeTtsJobId(jobId);
		if (!Array.isArray(utteranceIds) || utteranceIds.length > 100 || utteranceIds.some(value => typeof value !== 'string' || !/^u\d{3}$/.test(value))) {
			throw new TypeError('utteranceIds must contain up to 100 uNNN identifiers.');
		}
		if (typeof idempotencyKey !== 'string' || !/^[A-Za-z0-9_-]{8,128}$/.test(idempotencyKey)) {
			throw new TypeError('idempotencyKey must contain 8 to 128 letters, digits, underscores or hyphens.');
		}
		return this._call('createTtsJob', { utterance_ids: [...new Set(utteranceIds)].sort(), idempotency_key: idempotencyKey }, null,
			{ endpoint: '/rest/tts/jobs/' + id + '/retry' });
	}

	downloadTtsCandidate(jobId, candidateId) {
		const id = normalizeTtsJobId(jobId);
		if (typeof candidateId !== 'string' || !/^[a-f0-9]{32}$/.test(candidateId)) throw new TypeError('candidateId must be a 32-character hexadecimal identifier.');
		return this._call('createTtsJob', null, null, { endpoint: '/rest/tts/jobs/' + id + '/candidates/' + candidateId + '/audio',
			method: 'GET', output: 'binary', filename: candidateId + '.wav' });
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
		for (const key of ['model', 'quality', 'count', 'n', 'outputCompression', 'input_fidelity', 'moderation', 'mask', 'maskFilename', 'maskContentType']) {
			if (Object.prototype.hasOwnProperty.call(config, key)) throw new TypeError(`${key} is not a supported image option.`);
		}
		const imageCount = positiveInteger('imageCount', config.imageCount, 1);
		if (imageCount > maxCount) throw new RangeError(`imageCount must not exceed ${maxCount}.`);
		const size = config.size || '1024x1024';
		if (!IMAGE_AI_SIZE_SET.has(size)) throw new TypeError(`size must be one of: ${IMAGE_AI_SIZES.join(', ')}.`);
		const payload = {
			prompt: requiredString('prompt', prompt, 28_000), image_count: imageCount,
			size, output_format: config.outputFormat || 'png',
			background: config.background || 'auto'
		};
		if (config.idempotencyKey !== undefined) {
			payload.idempotency_key = requiredString('idempotencyKey', config.idempotencyKey, 128);
			if (!/^[A-Za-z0-9_-]{8,128}$/.test(payload.idempotency_key)) throw new TypeError('idempotencyKey must use 8-128 letters, numbers, underscores, or hyphens.');
		}
		return payload;
	}

	async generateImages(prompt, options) {
		const config = options || {}, payload = this._imageOptions(prompt, config, 4);
		if (config.referenceImage === undefined) return this._call('generateImages', payload);
		const uploadOptions = {
			filename: config.referenceFilename, contentType: config.referenceContentType,
			allowedTypes:['image/png','image/jpeg','image/webp'], maxBytes:MAX_IMAGE_AI_BYTES,
			typeError:'referenceImage must be PNG, JPEG, or WebP.'
		};
		const source = await normalizeImage(config.referenceImage, uploadOptions), form = new FormData();
		Object.entries(payload).forEach(([key,value]) => form.append(key, String(value)));
		form.append('reference_image', source.blob, source.filename);
		return this._call('generateImages', null, form);
	}

	async editImages(image, prompt, options) {
		const config = options || {}, payload = this._imageOptions(prompt, config, 4);
		const uploadOptions = Object.assign({}, config, { allowedTypes:['image/png','image/jpeg','image/webp'], maxBytes:MAX_IMAGE_AI_BYTES, typeError:'image must be PNG, JPEG, or WebP.' });
		const source = await normalizeImage(image, uploadOptions), form = new FormData();
		Object.entries(payload).forEach(([key,value]) => form.append(key, String(value)));
		form.append('image', source.blob, source.filename);
		return this._call('generateImages', null, form, { endpoint:'/rest/image-generation/edit' });
	}

	async createImageGenerationJob(prompt, options) {
		const config = options || {}, payload = this._imageOptions(prompt, config, 50);
		if (config.referenceImage === undefined) return this._call('generateImages', payload, null, { endpoint:'/rest/image-generation/jobs/generate', timeoutMs:60_000 });
		const uploadOptions = {
			filename: config.referenceFilename, contentType: config.referenceContentType,
			allowedTypes:['image/png','image/jpeg','image/webp'], maxBytes:MAX_IMAGE_AI_BYTES,
			typeError:'referenceImage must be PNG, JPEG, or WebP.'
		};
		const source = await normalizeImage(config.referenceImage, uploadOptions), form = new FormData();
		Object.entries(payload).forEach(([key,value]) => form.append(key, String(value)));
		form.append('reference_image', source.blob, source.filename);
		return this._call('generateImages', null, form, { endpoint:'/rest/image-generation/jobs/generate', timeoutMs:60_000 });
	}

	async createImageEditJob(image, prompt, options) {
		const config = options || {}, payload = this._imageOptions(prompt, config, 50);
		const uploadOptions = Object.assign({}, config, { allowedTypes:['image/png','image/jpeg','image/webp'], maxBytes:MAX_IMAGE_AI_BYTES, typeError:'image must be PNG, JPEG, or WebP.' });
		const source = await normalizeImage(image, uploadOptions), form = new FormData();
		Object.entries(payload).forEach(([key,value]) => form.append(key, String(value)));
		form.append('image', source.blob, source.filename);
		return this._call('generateImages', null, form, { endpoint:'/rest/image-generation/jobs/edit', timeoutMs:60_000 });
	}

	getImageJob(jobId) {
		const id = normalizeTtsJobId(jobId);
		return this._call('generateImages', null, null, { endpoint:'/rest/image-generation/jobs/'+id, method:'GET', timeoutMs:30_000 });
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

	// 간편인증 기반 조회 상품: 인증 요청(request*) 뒤 결과 조회(get*)로 폴링한다.
	// 각 상품은 접수 시 정액, 최초 결과 반환 시 항목 단가가 과금되고 재조회는 무과금이다.
	requestEmployment(input) {
		const payload = dataRequestInput(input);
		const insuranceYears = optionalRangeInteger('insuranceYears', (input || {}).insuranceYears, 1, 3);
		if (insuranceYears !== undefined) payload.insuranceYears = insuranceYears;
		return this._call('requestEmployment', payload);
	}

	getEmployment(transactionId) {
		return this._call('requestEmployment', { transactionId: normalizeTransactionId(transactionId) }, null, { endpoint: '/rest/get_employment' });
	}

	requestPersonalIncome(input) {
		const payload = dataRequestInput(input);
		const incomeYears = optionalRangeInteger('incomeYears', (input || {}).incomeYears, 1, 5);
		if (incomeYears !== undefined) payload.incomeYears = incomeYears;
		return this._call('requestPersonalIncome', payload);
	}

	getPersonalIncome(transactionId) {
		return this._call('requestPersonalIncome', { transactionId: normalizeTransactionId(transactionId) }, null, { endpoint: '/rest/get_personal_income' });
	}

	requestNpsJoinHistory(input) {
		const payload = dataRequestInput(input);
		const config = input || {};
		const from = normalizeYearMonth('from', config.from);
		const to = normalizeYearMonth('to', config.to);
		if (from !== undefined) payload.from = from;
		if (to !== undefined) payload.to = to;
		return this._call('requestNpsJoinHistory', payload);
	}

	getNpsJoinHistory(transactionId) {
		return this._call('requestNpsJoinHistory', { transactionId: normalizeTransactionId(transactionId) }, null, { endpoint: '/rest/get_nps_join_history' });
	}

	requestDrivingLicense(input) {
		return this._call('requestDrivingLicense', dataRequestInput(input));
	}

	getDrivingLicense(transactionId) {
		return this._call('requestDrivingLicense', { transactionId: normalizeTransactionId(transactionId) }, null, { endpoint: '/rest/get_driving_license' });
	}

	requestHealthCheckup(input) {
		return this._call('requestHealthCheckup', dataRequestInput(input));
	}

	getHealthCheckup(transactionId) {
		return this._call('requestHealthCheckup', { transactionId: normalizeTransactionId(transactionId) }, null, { endpoint: '/rest/get_health_checkup' });
	}

	requestCashReceiptDeduction(input) {
		const payload = dataRequestInput(input);
		const incomeYears = optionalRangeInteger('incomeYears', (input || {}).incomeYears, 1, 3);
		if (incomeYears !== undefined) payload.incomeYears = incomeYears;
		return this._call('requestCashReceiptDeduction', payload);
	}

	getCashReceiptDeduction(transactionId) {
		return this._call('requestCashReceiptDeduction', { transactionId: normalizeTransactionId(transactionId) }, null, { endpoint: '/rest/get_cash_receipt_deduction' });
	}

	requestTaxReturnHistory(input) {
		const payload = dataRequestInput(input);
		const years = optionalRangeInteger('years', (input || {}).years, 1, 10);
		if (years !== undefined) payload.years = years;
		return this._call('requestTaxReturnHistory', payload);
	}

	getTaxReturnHistory(transactionId) {
		return this._call('requestTaxReturnHistory', { transactionId: normalizeTransactionId(transactionId) }, null, { endpoint: '/rest/get_tax_return_history' });
	}

	// Skills: 요청·응답이 모두 JSON 이고 data·api 봉투 없이 응답 항목이 최상위에 온다.
	// 오류는 { error: { code, message, details } } 형식이며 code 를 serviceCode 로 돌려준다.
	async _skills(method, path, options) {
		const config = options || {};
		const controller = new AbortController();
		const timeoutMs = this.#timeoutMs || config.timeoutMs || DEFAULT_TIMEOUT_MS;
		const timer = setTimeout(() => controller.abort(), timeoutMs);
		const headers = { Accept: 'application/json', Authorization: `Bearer ${this.#apiKey}` };
		const request = { method, headers, signal: controller.signal, redirect: 'error' };
		if (config.idempotencyKey) headers['Idempotency-Key'] = config.idempotencyKey;
		if (method !== 'GET') {
			headers['Content-Type'] = 'application/json';
			request.body = JSON.stringify(config.body || {});
		}
		let url = this.#baseUrl + path;
		const query = new URLSearchParams(config.query || {}).toString();
		if (query) url += '?' + query;

		let response;
		try {
			response = await this.#fetch(url, request);
		} catch (error) {
			const timedOut = controller.signal.aborted || error && error.name === 'AbortError';
			throw new ApickApiError(
				timedOut ? `APICK request timed out after ${timeoutMs} ms.` : redact(error && error.message || 'APICK network request failed.', this.#apiKey),
				{ code: timedOut ? 'APICK_TIMEOUT' : 'APICK_NETWORK_ERROR' }
			);
		} finally {
			clearTimeout(timer);
		}

		const raw = await response.text();
		let body;
		try {
			body = raw ? JSON.parse(raw) : null;
		} catch {
			body = undefined;
		}
		const failure = body && typeof body === 'object' && body.error && typeof body.error === 'object' ? body.error : null;
		if (!response.ok || failure) {
			throw new ApickApiError(failure && typeof failure.message === 'string' && failure.message || publicErrorMessage(body, 'APICK request failed.'), {
				status: response.status,
				code: response.status === 401 ? 'APICK_AUTH_ERROR' : 'APICK_API_ERROR',
				serviceCode: failure && typeof failure.code === 'string' ? failure.code : undefined,
				details: failure && failure.details && typeof failure.details === 'object' ? failure.details : undefined
			});
		}
		if (!body || typeof body !== 'object') {
			throw new ApickApiError(`APICK returned an unexpected response (HTTP ${response.status}).`, {
				status: response.status,
				code: 'APICK_INVALID_RESPONSE'
			});
		}
		return Object.freeze({ data: body, meta: responseMeta(null, response.headers) });
	}

	searchSkills(options) {
		const config = options || {};
		const query = {};
		if (config.query !== undefined && config.query !== null && config.query !== '') query.query = requiredString('query', config.query, 60);
		if (config.category !== undefined && config.category !== null && config.category !== '') {
			const category = requiredString('category', config.category);
			if (!SKILL_CATEGORY_SET.has(category)) throw new RangeError('category must be one of the supported Skill categories.');
			query.category = category;
		}
		if (config.sort !== undefined && config.sort !== null && config.sort !== '') {
			const sort = requiredString('sort', config.sort);
			if (!SKILL_SORT_SET.has(sort)) throw new RangeError('sort must be one of the supported Skill sort orders.');
			query.sort = sort;
		}
		if (config.cursor !== undefined && config.cursor !== null && config.cursor !== '') query.cursor = requiredString('cursor', String(config.cursor), 20);
		const limit = optionalRangeInteger('limit', config.limit, 1, 20);
		if (limit !== undefined) query.limit = String(limit);
		return this._skills('GET', '/rest/skills', { query });
	}

	getSkill(skillId) {
		return this._skills('GET', '/rest/skills/' + normalizeSkillId(skillId));
	}

	quoteSkill(skillId, input, options) {
		const body = { input: skillInput(input) };
		const version = optionalSkillText('version', (options || {}).version, 16);
		if (version !== undefined) body.version = version;
		return this._skills('POST', '/rest/skills/' + normalizeSkillId(skillId) + '/quotes', { body });
	}

	// 같은 idempotencyKey 로 다시 보내면 새로 실행하지 않고 처음 실행을 돌려준다. 응답을 못 받았을 때는 같은 키로 재시도한다.
	runSkill(skillId, input, options) {
		const config = options || {};
		const idempotencyKey = requiredString('idempotencyKey', config.idempotencyKey);
		if (!/^[A-Za-z0-9._:-]{1,128}$/.test(idempotencyKey)) {
			throw new TypeError('idempotencyKey must be 1-128 characters of letters, digits, and . _ : -');
		}
		const body = { input: skillInput(input) };
		const version = optionalSkillText('version', config.version, 16);
		const quoteId = optionalSkillText('quoteId', config.quoteId, 40);
		const maxCostPoints = config.maxCostPoints === undefined || config.maxCostPoints === null ? undefined : positiveInteger('maxCostPoints', config.maxCostPoints);
		const waitSeconds = optionalRangeInteger('waitSeconds', config.waitSeconds, 0, 20);
		if (version !== undefined) body.version = version;
		if (quoteId !== undefined) body.quote_id = quoteId;
		if (maxCostPoints !== undefined) body.max_cost_points = maxCostPoints;
		if (waitSeconds !== undefined) body.wait_seconds = waitSeconds;
		return this._skills('POST', '/rest/skills/' + normalizeSkillId(skillId) + '/runs', { body, idempotencyKey, timeoutMs: 40_000 });
	}

	getSkillRun(runId) {
		return this._skills('GET', '/rest/skills/runs/' + normalizeSkillRunId(runId));
	}

	getSkillRunResult(runId) {
		return this._skills('GET', '/rest/skills/runs/' + normalizeSkillRunId(runId) + '/result');
	}

	cancelSkillRun(runId) {
		return this._skills('POST', '/rest/skills/runs/' + normalizeSkillRunId(runId) + '/cancel', { body: {} });
	}

	skillUsage(options) {
		const config = options || {};
		const query = {};
		if (config.cursor !== undefined && config.cursor !== null && config.cursor !== '') query.cursor = requiredString('cursor', String(config.cursor), 20);
		const limit = optionalRangeInteger('limit', config.limit, 1, 50);
		if (limit !== undefined) query.limit = String(limit);
		return this._skills('GET', '/rest/skills/usage', { query });
	}
}

module.exports = {
	ApickClient,
	ApickApiError,
	ApickBinaryResult,
	SERVICES,
	TTS_VOICE_IDS,
	AUTH_PROVIDERS,
	SKILL_CATEGORIES,
	SKILL_SORTS,
	DEFAULT_BASE_URL
};
