export interface ApickClientOptions {
	apiKey: string;
	baseUrl?: string;
	timeoutMs?: number;
	/** Requests with a body use native FormData; GET requests have no body. */
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
export type ImageAiSize = '1024x1024' | '1536x1024' | '1024x1536' | '1152x864' | '864x1152';
export type ImageAiStatus = 'waiting' | 'processing' | 'completed' | 'completed_partial' | 'failed';
export type ApickImageErrorCode = `APICK_IMAGE_${string}`;
export interface ImageAiOptions { imageCount?: number; size?: ImageAiSize; outputFormat?: ImageAiFormat; background?: ImageAiBackground; idempotencyKey?: string; }
export interface ImageAiGenerateOptions extends ImageAiOptions { referenceImage?: string|BinaryInput|ArrayBuffer|ArrayBufferView; referenceFilename?: string; referenceContentType?: 'image/png'|'image/jpeg'|'image/webp'; }
export interface ImageAiEditOptions extends ImageAiOptions { filename?: string; contentType?: 'image/png'|'image/jpeg'|'image/webp'; }
export interface ImageAiResultImage { index:number; b64_json:string; mime_type:'image/png'|'image/jpeg'|'image/webp'; width:number; height:number; }
export interface ImageAiResultData { request_id:string; image_count:number; images:ImageAiResultImage[]; idempotent_replay?:boolean; }
export interface ImageAiJobData { job_id:string; status:ImageAiStatus; requested_count:number; completed_count?:number; failed_count?:number; prepaid_point?:number; charged_point?:number; refunded_point?:number; result_available?:boolean; expires_at?:string|null; error_code?:ApickImageErrorCode|null; }

export interface MaskResidentNumberOptions extends OcrOptions {
	type: 1 | 2 | 3 | 4;
}

export const AUTH_PROVIDERS: readonly [
	'kakao', 'naver', 'toss', 'pass', 'samsung', 'kb', 'shinhan', 'hana', 'woori', 'ibk', 'nh', 'kakaobank', 'banksalad'
];
export type AuthProvider = typeof AUTH_PROVIDERS[number];

/** 간편인증 기반 조회 상품(재직·소득·연금·면허·건강검진 등)의 공통 입력. */
export interface DataRequestInput {
	name: string;
	birthDate: string;
	phone: string;
	authProvider: AuthProvider;
}
export interface RequestEmploymentInput extends DataRequestInput { insuranceYears?: number; }
export interface RequestPersonalIncomeInput extends DataRequestInput { incomeYears?: number; }
export interface RequestNpsJoinHistoryInput extends DataRequestInput { from?: string; to?: string; }
export interface RequestDrivingLicenseInput extends DataRequestInput {}
export interface RequestHealthCheckupInput extends DataRequestInput {}

export type DataRequestStatus =
	| 'AUTH_REQUESTED' | 'AUTH_WAITING' | 'AUTH_COMPLETED' | 'AUTH_REJECTED' | 'AUTH_EXPIRED'
	| 'COLLECTING' | 'COLLECTED' | 'PARTIAL_SUCCESS' | 'SUCCESS' | 'FAILED';
export type DataRequestErrorCode = 'RESULT_EXPIRED' | 'AUTH_EXPIRED' | 'AUTH_REJECTED' | 'COLLECT_FAILED';
export interface DataRequestSource { source: string; type: string; status: string; }

/** `request*()` (POST /rest/req_*) 응답의 `data`. */
export interface DataRequestAcceptedData {
	schemaVersion: string;
	transactionId: string;
	product: string;
	status: DataRequestStatus;
	resultAvailable: boolean;
	charged: boolean;
	sources: DataRequestSource[];
	message: string;
	expiresAt: string;
	success: number;
	approvals?: number;
}

/** `get*()` (POST /rest/get_*) 응답의 `data`. `result`는 결과가 있을 때만 온다. */
export interface DataRequestResult<T> {
	schemaVersion: string;
	transactionId: string;
	product: string;
	status: DataRequestStatus;
	resultAvailable: boolean;
	charged: boolean;
	sources: DataRequestSource[];
	message: string;
	expiresAt?: string;
	success: number;
	progress?: { total: number; completed: number };
	checkedAt?: string;
	resultExpiresAt?: string;
	result?: T;
	errorCode?: DataRequestErrorCode;
}

export interface EmploymentHistoryEntry { 사업장: string; 취득일: string; 상실일: string; 자격구분: string; }
export interface EmploymentPremiumEntry {
	사업장: string; 고지년월: string; 보수월액: number;
	'건강보험 산정보험료': number; '건강보험 정산보험료': number; '건강보험 고지보험료': number; '건강보험 연말정산보험료': number;
	'장기요양 산정보험료': number; '장기요양 정산보험료': number; '장기요양 고지보험료': number; '장기요양 연말정산보험료': number;
	가입자부담금: number;
}
export interface EmploymentInfo {
	재직상태: 'EMPLOYED' | 'UNEMPLOYED' | 'UNKNOWN';
	현재사업장?: string;
	취득일?: string;
	이력: EmploymentHistoryEntry[];
	보험료연도: string[];
	보험료: EmploymentPremiumEntry[];
}
export interface EmploymentResultPayload { employment: EmploymentInfo; }

export interface PersonalIncomeAmount { 건수: number; 소득금액: number; 소득세: number; 지방소득세: number; 농어촌특별세: number; 세액합계: number; }
export interface PersonalIncomeYear {
	귀속연도: string;
	소득종류별: { 이자소득?: PersonalIncomeAmount; 배당소득?: PersonalIncomeAmount };
	합계: PersonalIncomeAmount;
}
export interface PersonalIncomeInfo { 조회연도: string[]; 연도별: PersonalIncomeYear[]; }
export interface PersonalIncomeResultPayload { personalIncome: PersonalIncomeInfo; }

export interface NpsJoinHistoryEntry {
	시작: string; 종료: string; 기준소득월액: number;
	납부개월: number; 납부금액: number; 미납개월: number; 미납금액: number;
	가입자구분: string; 사업장: string;
}
export interface NpsJoinHistoryInfo {
	조회기간: { 시작: string; 종료: string };
	합계: { 납부개월: number; 납부금액: number; 미납개월: number; 미납금액: number };
	가입내역: NpsJoinHistoryEntry[];
}
export interface NpsJoinHistoryResultPayload { npsJoinHistory: NpsJoinHistoryInfo; }

export interface DrivingLicenseAcquisition {
	면허종류코드: string; 발급일자: string; 합격일자: string; 발급지역: string; 발급일련번호: string;
	학원명: string; 졸업일자: string; 공고시험장: string; 등록일자: string; 면허조건: string;
}
export interface DrivingLicenseInfo {
	이름?: string; 주소?: string; 면허번호?: string; 관할경찰서?: string; 국적?: string; 면허상태?: string;
	취소일자?: string; 적성검사일자?: string; 적성검사기관?: string; 적성검사유효기간?: string;
	적성검사시작?: string; 적성검사종료?: string; 정지기간?: string; 정지사유?: string;
	재교부일자?: string; 재교부사유?: string;
	subList?: unknown[];
	취득이력?: DrivingLicenseAcquisition[];
	조회결과?: string;
}
export interface DrivingLicenseResultPayload { drivingLicense: DrivingLicenseInfo; }

export interface HealthCheckupEntry { 검진연도: string; 검진종류: string; 검진일자: string; 검진기관: string; }
export interface HealthCheckupInfo { 이름: string; 건수: number; 검진내역: HealthCheckupEntry[]; }
export interface HealthCheckupResultPayload { healthCheckup: HealthCheckupInfo; }

export const TTS_VOICE_IDS: readonly [
	'v2_ann_m_30s_01', 'v2_ann_m_30s_02', 'v2_ann_m_30s_04', 'v2_ann_m_30s_05', 'v2_ann_f_30s_01', 'v2_ann_f_30s_02', 'v2_ann_f_30s_03', 'v2_ann_f_30s_04', 'v2_ann_f_30s_05', 'v2_m_teen_01', 'v2_m_young_01', 'v2_m_mid_01', 'v2_m_senior_01', 'v2_f_teen_01', 'v2_f_young_01', 'v2_f_senior_01'
];
export type TtsVoiceId = typeof TTS_VOICE_IDS[number];

export interface TtsJobData {
	job_id: string;
	status: 'waiting' | 'processing' | 'completed' | 'cancelled' | 'failed';
	voice_id?: TtsVoiceId;
	character_count?: number;
	result_available?: boolean;
	subtitles_available?: boolean;
	resume_revision?: number;
	operation_revision?: number;
	quality?: TtsQualityData | null;
}

export interface TtsQualityData {
	job_id?: string;
	resume_revision?: number;
	phase?: string;
	accepted_utterances?: number;
	failed_utterances?: number;
	total_utterances?: number;
	utterances?: Array<{ id: string; status: string; attempt?: number; reasons?: string[];
		speech_rate?: { chars: number; duration_sec: number; cps: number; expected_sec: number; duration_ratio: number | null; status: string } }>;
	candidates?: Array<{ candidate_id: string; utterance_id: string; status: string; attempt: number; audio_available?: boolean }>;
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
	createVideoJob(model: VideoModel, prompt: string, options?: VideoJobOptions): Promise<ApickResult<VideoJobData>>;
	getVideoJob(model: VideoModel, jobId: string): Promise<ApickResult<VideoJobData>>;
	downloadVideoResult(model: VideoModel, jobId: string): Promise<ApickBinaryResult>;
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
	getTtsQuality(jobId: string): Promise<ApickResult<TtsQualityData>>;
	retryTtsJob(jobId: string, utteranceIds: string[], idempotencyKey: string): Promise<ApickResult<TtsJobData>>;
	downloadTtsCandidate(jobId: string, candidateId: string): Promise<ApickBinaryResult>;
	htmlToPdf(html: string, options?: { pagination?: boolean }): Promise<ApickBinaryResult>;
	jsonToExcel(data: unknown[], options?: { sheetName?: string }): Promise<ApickBinaryResult>;
	summarize(text: string): Promise<ApickResult>;
	polish(text: string): Promise<ApickResult>;
	generateImages(prompt:string, options?:ImageAiGenerateOptions): Promise<ApickResult<ImageAiResultData>>;
	editImages(image:string|BinaryInput|ArrayBuffer|ArrayBufferView, prompt:string, options?:ImageAiEditOptions): Promise<ApickResult<ImageAiResultData>>;
	createImageGenerationJob(prompt:string, options?:ImageAiGenerateOptions): Promise<ApickResult<ImageAiJobData>>;
	createImageEditJob(image:string|BinaryInput|ArrayBuffer|ArrayBufferView, prompt:string, options?:ImageAiEditOptions): Promise<ApickResult<ImageAiJobData>>;
	getImageJob(jobId:string): Promise<ApickResult<ImageAiJobData>>;
	downloadImageJobImage(jobId:string,index:number): Promise<ApickBinaryResult>;
	downloadImageJobArchive(jobId:string): Promise<ApickBinaryResult>;
	requestEmployment(input: RequestEmploymentInput): Promise<ApickResult<DataRequestAcceptedData>>;
	getEmployment(transactionId: string): Promise<ApickResult<DataRequestResult<EmploymentResultPayload>>>;
	requestPersonalIncome(input: RequestPersonalIncomeInput): Promise<ApickResult<DataRequestAcceptedData>>;
	getPersonalIncome(transactionId: string): Promise<ApickResult<DataRequestResult<PersonalIncomeResultPayload>>>;
	requestNpsJoinHistory(input: RequestNpsJoinHistoryInput): Promise<ApickResult<DataRequestAcceptedData>>;
	getNpsJoinHistory(transactionId: string): Promise<ApickResult<DataRequestResult<NpsJoinHistoryResultPayload>>>;
	requestDrivingLicense(input: RequestDrivingLicenseInput): Promise<ApickResult<DataRequestAcceptedData>>;
	getDrivingLicense(transactionId: string): Promise<ApickResult<DataRequestResult<DrivingLicenseResultPayload>>>;
	requestHealthCheckup(input: RequestHealthCheckupInput): Promise<ApickResult<DataRequestAcceptedData>>;
	getHealthCheckup(transactionId: string): Promise<ApickResult<DataRequestResult<HealthCheckupResultPayload>>>;
}

export default ApickClient;

export type VideoModel = 'seedance' | 'veo' | 'kling';
export interface VideoJobOptions {
	version?: string; tier?: string; mode?: 'text' | 'image' | 'reference'; duration?: number;
	aspectRatio?: string; resolution?: string; audio?: boolean; negativePrompt?: string;
	seed?: number; cfgScale?: number; idempotencyKey?: string;
	image?: string | BinaryInput | ArrayBuffer | ArrayBufferView;
	lastImage?: string | BinaryInput | ArrayBuffer | ArrayBufferView;
	referenceImages?: Array<string | BinaryInput | ArrayBuffer | ArrayBufferView>;
	referenceVideos?: Array<string | BinaryInput>;
	referenceAudios?: Array<string | BinaryInput>;
}
export interface VideoJobData {
	job_id: string; model: VideoModel; version: string; mode: string; tier: string;
	status: 'waiting' | 'processing' | 'completed' | 'failed' | 'cancelled';
	duration: number; resolution?: string; audio?: boolean; point_per_second?: number;
	charged_point?: number; result_available?: boolean; result_url?: string;
	result_expires_at?: string | null; idempotent_replay?: boolean;
	error?: { code: string; message: string };
}
