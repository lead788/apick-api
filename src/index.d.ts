export interface ApickClientOptions {
	apiKey: string;
	baseUrl?: string;
	timeoutMs?: number;
	fetch?: typeof fetch;
}

export interface ApickMeta {
	readonly cost: number | null;
	readonly durationMs: number | null;
}

export interface ApickResult<T = Record<string, unknown>> {
	readonly data: T;
	readonly meta: ApickMeta;
}

export interface BinaryInput {
	readonly size?: number;
	readonly type?: string;
	readonly name?: string;
	arrayBuffer(): Promise<ArrayBuffer>;
}

export interface OcrOptions {
	filename?: string;
	contentType?: 'image/png' | 'image/jpeg';
}

export type ImageAiFormat = 'png' | 'jpeg' | 'webp';
export type ImageAiBackground = 'auto' | 'opaque' | 'transparent';
export type ImageAiStatus = 'waiting' | 'processing' | 'completed' | 'completed_partial' | 'cancelled' | 'failed';
export type ApickImageErrorCode = `APICK_IMAGE_${string}`;
export interface ImageAiOptions { count?: number; size?: string; outputFormat?: ImageAiFormat; background?: ImageAiBackground; outputCompression?: number; idempotencyKey?: string; }
export interface ImageAiEditOptions extends ImageAiOptions { mask?: string | BinaryInput | ArrayBuffer | ArrayBufferView; filename?: string; contentType?: 'image/png'|'image/jpeg'|'image/webp'; maskFilename?: string; maskContentType?: 'image/png'|'image/webp'; }
export interface ImageAiResultImage { index:number; b64_json:string; mime_type:'image/png'|'image/jpeg'|'image/webp'; width:number; height:number; }
export interface ImageAiResultData { request_id:string; count:number; images:ImageAiResultImage[]; idempotent_replay?:boolean; }
export interface ImageAiJobData { job_id:string; status:ImageAiStatus; requested_count:number; completed_count?:number; failed_count?:number; charged_point?:number; result_available?:boolean; expires_at?:string|null; error_code?:ApickImageErrorCode|null; }

export interface MaskResidentNumberOptions extends OcrOptions {
	type: 1 | 2 | 3;
}

export const TTS_VOICE_IDS: readonly [
	'narrator_m_01', 'narrator_m_02', 'narrator_m_03', 'narrator_m_04', 'narrator_m_05',
	'narrator_f_10s_01', 'narrator_f_10s_02', 'narrator_f_10s_03',
	'narrator_m_20s_01', 'narrator_f_20s_01', 'narrator_f_20s_02',
	'narrator_f_20s_03', 'narrator_f_20s_04', 'narrator_m_30s_01',
	'narrator_m_30s_02', 'narrator_m_40s_01', 'narrator_m_80s_01'
];
export type TtsVoiceId = typeof TTS_VOICE_IDS[number];

export interface TtsJobData {
	job_id: string;
	status: 'waiting' | 'processing' | 'completed' | 'cancelled' | 'failed';
	voice_id?: TtsVoiceId;
	character_count?: number;
	result_available?: boolean;
	subtitles_available?: boolean;
}

export class ApickApiError extends Error {
	readonly status: number;
	readonly code: string;
	readonly serviceCode?: string;
	toJSON(): {
		name: string;
		message: string;
		status: number;
		code: string;
		serviceCode?: string;
	};
}

export class ApickBinaryResult {
	readonly bytes: Uint8Array;
	readonly contentType: string;
	readonly filename: string;
	readonly meta: ApickMeta;
	readonly size: number;
	toArrayBuffer(): ArrayBuffer;
	toBlob(): Blob;
	save(filePath: string): Promise<string>;
}

export const DEFAULT_BASE_URL: 'https://apick.app';

export const SERVICES: Readonly<Record<string, Readonly<{
	endpoint: string;
	output: 'json' | 'binary';
}>>>;

export class ApickClient {
	constructor(apiKeyOrOptions: string | ApickClientOptions);
	businessDetails(businessNumber: string): Promise<ApickResult>;
	ventureBusiness(businessNumber: string): Promise<ApickResult>;
	trackParcel(carrier: string, trackingNumber: string): Promise<ApickResult>;
	trackParcelAuto(trackingNumber: string): Promise<ApickResult>;
	validateEmail(email: string): Promise<ApickResult>;
	validatePhone(number: string): Promise<ApickResult>;
	holidays(year: number | string, month: number | string): Promise<ApickResult>;
	searchAddress(query: string, options?: { page?: number }): Promise<ApickResult>;
	ocr(image: string | BinaryInput | ArrayBuffer | ArrayBufferView, options?: OcrOptions): Promise<ApickResult>;
	maskResidentNumber(image: string | BinaryInput | ArrayBuffer | ArrayBufferView, options: MaskResidentNumberOptions): Promise<ApickBinaryResult>;
	maskResidenceCard(image: string | BinaryInput | ArrayBuffer | ArrayBufferView, options?: OcrOptions): Promise<ApickResult>;
	maskPassport(image: string | BinaryInput | ArrayBuffer | ArrayBufferView, options?: OcrOptions): Promise<ApickResult>;
	maskIdCard(image: string | BinaryInput | ArrayBuffer | ArrayBufferView, options?: OcrOptions): Promise<ApickResult>;
	maskDriverLicense(image: string | BinaryInput | ArrayBuffer | ArrayBufferView, options?: OcrOptions): Promise<ApickResult>;
	dnsLookup(domain: string): Promise<ApickResult>;
	geolocate(address: string): Promise<ApickResult>;
	whois(address: string): Promise<ApickResult>;
	googleSearch(keyword: string, options?: { page?: number }): Promise<ApickResult>;
	googleImageSearch(keyword: string, options?: { page?: number }): Promise<ApickResult>;
	screenshot(url: string): Promise<ApickBinaryResult>;
	createTtsJob(text: string, options?: { voiceId?: TtsVoiceId }): Promise<ApickResult<TtsJobData>>;
	getTtsJob(jobId: string): Promise<ApickResult<TtsJobData>>;
	cancelTtsJob(jobId: string): Promise<ApickResult<TtsJobData>>;
	downloadTtsResult(jobId: string): Promise<ApickBinaryResult>;
	downloadTtsSubtitles(jobId: string): Promise<ApickBinaryResult>;
	htmlToPdf(html: string, options?: { pagination?: boolean }): Promise<ApickBinaryResult>;
	jsonToExcel(data: unknown[], options?: { sheetName?: string }): Promise<ApickBinaryResult>;
	summarize(text: string): Promise<ApickResult>;
	polish(text: string): Promise<ApickResult>;
	generateImages(prompt:string, options?:ImageAiOptions): Promise<ApickResult<ImageAiResultData>>;
	editImages(image:string|BinaryInput|ArrayBuffer|ArrayBufferView, prompt:string, options?:ImageAiEditOptions): Promise<ApickResult<ImageAiResultData>>;
	createImageGenerationJob(prompt:string, options?:ImageAiOptions): Promise<ApickResult<ImageAiJobData>>;
	createImageEditJob(image:string|BinaryInput|ArrayBuffer|ArrayBufferView, prompt:string, options?:ImageAiEditOptions): Promise<ApickResult<ImageAiJobData>>;
	getImageJob(jobId:string): Promise<ApickResult<ImageAiJobData>>;
	cancelImageJob(jobId:string): Promise<ApickResult<ImageAiJobData>>;
	downloadImageJobImage(jobId:string,index:number): Promise<ApickBinaryResult>;
	downloadImageJobArchive(jobId:string): Promise<ApickBinaryResult>;
}

export default ApickClient;
