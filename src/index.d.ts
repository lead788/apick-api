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

export interface SearchList<T> {
	readonly keyword: string;
	readonly page?: number;
	readonly count: number;
	readonly items: readonly T[];
}

export interface NewsItem {
	readonly rank: number;
	readonly title: string;
	readonly link: string;
	readonly source: string;
	readonly published: string;
	readonly description: string;
	readonly image_url: string;
}

export interface ShoppingItem {
	readonly rank: number;
	readonly title: string;
	readonly price: string;
	readonly old_price: string;
	readonly shop: string;
	readonly rating: number | null;
	readonly reviews: number | null;
	readonly link: string;
	readonly image_url: string;
}

export interface PlaceItem {
	readonly rank: number;
	readonly name: string;
	readonly address: string;
	readonly phone: string;
	readonly categories: readonly string[];
	readonly rating: number | null;
	readonly reviews: number | null;
	readonly price_range: string;
	readonly open_status: string;
	readonly open_hours: Readonly<Record<string, string>>;
	readonly website: string;
	readonly latitude: number | null;
	readonly longitude: number | null;
	readonly place_id: string;
	readonly map_link: string;
	readonly thumbnail: string;
}

export interface RankCheck {
	readonly keyword: string;
	readonly domain: string;
	readonly found: boolean;
	readonly rank: number | null;
	readonly matches: readonly { readonly rank: number; readonly title: string; readonly link: string }[];
	readonly checked_results: number;
	/** 확인한 10위 구간 수(최대 10). */
	readonly checked_pages: number;
	/** 1~100위를 모두 확인했거나 앞에서부터 끊김 없이 확인한 구간에서 찾았으면 true. false 면 확인한 구간 비율만큼만 과금된다. */
	readonly complete: boolean;
	/** 확인하지 못한 순위 구간(예: "41-50"). */
	readonly unchecked_ranks: readonly string[];
}

export interface AmazonProduct {
	readonly asin: string;
	readonly url: string;
	readonly title: string;
	readonly brand: string;
	readonly price: number | null;
	readonly original_price: number | null;
	readonly currency: string;
	readonly rating: number | null;
	readonly reviews_count: number | null;
	readonly availability: string;
	readonly is_available: boolean;
	readonly bought_past_month: number | null;
	readonly seller_name: string;
	readonly categories: readonly string[];
	readonly features: readonly string[];
	readonly customers_say: string;
	readonly image_url: string;
	readonly image_urls: readonly string[];
	readonly date_first_available: string;
	readonly model_number: string;
}

export interface XPostSummary {
	readonly post_id: string;
	readonly url: string;
	readonly text: string;
	readonly posted_at: string;
	readonly likes: number | null;
	readonly reposts: number | null;
	readonly replies: number | null;
	readonly views: number | null;
	readonly hashtags: readonly string[];
}

export interface XProfile {
	readonly username: string;
	readonly name: string;
	readonly biography: string;
	readonly followers: number | null;
	readonly following: number | null;
	readonly posts_count: number | null;
	readonly is_verified: boolean;
	readonly is_business_account: boolean;
	readonly is_government_account: boolean;
	readonly location: string;
	readonly website: string;
	readonly joined_at: string;
	readonly profile_image_url: string;
	readonly banner_image_url: string;
	readonly profile_url: string;
	readonly recent_posts: readonly XPostSummary[];
}

export interface XPost {
	readonly post_id: string;
	readonly url: string;
	readonly username: string;
	readonly name: string;
	readonly text: string;
	readonly posted_at: string;
	readonly likes: number | null;
	readonly reposts: number | null;
	readonly replies: number | null;
	readonly quotes: number | null;
	readonly views: number | null;
	readonly bookmarks: number | null;
	readonly hashtags: readonly string[];
	readonly is_repost: boolean;
	readonly photo_urls: readonly string[];
	readonly video_urls: readonly string[];
	readonly author: { readonly followers: number | null; readonly is_verified: boolean };
}

export interface TiktokVideo {
	readonly video_id: string;
	readonly url: string;
	readonly username: string;
	readonly description: string;
	readonly posted_at: string;
	readonly views: number | null;
	readonly likes: number | null;
	readonly comments: number | null;
	readonly shares: number | null;
	readonly saves: number | null;
	readonly duration_sec: number | null;
	readonly hashtags: readonly string[];
	readonly region: string;
	readonly cover_image_url: string;
	readonly author: { readonly followers: number | null; readonly is_verified: boolean };
}

/** 댓글 작성자는 공개 사용자명만 제공한다. */
export interface SocialComment {
	readonly comment_id: string;
	readonly username: string;
	readonly text: string;
	readonly posted_at: string;
	readonly likes: number | null;
	readonly replies: number | null;
}

export interface AmazonReview {
	readonly review_id: string;
	readonly rating: number | null;
	readonly title: string;
	readonly text: string;
	readonly author: string;
	readonly posted_at: string;
	readonly country: string;
	readonly is_verified_purchase: boolean;
	readonly helpful_count: number | null;
	readonly variant: string;
}

export type ScrapeJobProduct = "instagram_posts" | "instagram_comments" | "tiktok_search" | "tiktok_video" | "tiktok_comments" | "amazon_reviews";

export interface ScrapeJobOptions {
	/** 최대 결과 수. 이 수 × 단가를 예약하고 실제 결과 건수만 차감한다(instagram_comments 15, tiktok_search 50, 그 밖 100). */
	readonly maxResults?: number;
	/** 응답을 못 받아 다시 보낼 때 같은 접수로 처리할 키(8~128자). */
	readonly idempotencyKey?: string;
}

export interface ScrapeJob<T = unknown> {
	readonly job_id: string;
	readonly product: ScrapeJobProduct;
	readonly status: "waiting" | "processing" | "completed" | "failed";
	readonly max_results: number;
	readonly unit_point: number;
	readonly reserved_point: number;
	readonly charged_point: number;
	readonly result_count: number;
	readonly created_at: string;
	readonly completed_at: string | null;
	/** 결과 보관 기한(완료 후 72시간). */
	readonly result_expires_at?: string;
	readonly result_expired?: boolean;
	readonly items?: readonly T[];
	readonly error?: { readonly code: string; readonly message: string };
}

export interface InstagramProfile {
	readonly username: string;
	readonly full_name: string;
	readonly biography: string;
	readonly followers: number | null;
	readonly following: number | null;
	readonly posts_count: number | null;
	readonly is_verified: boolean;
	readonly is_private: boolean;
	readonly external_urls: readonly string[];
	readonly highlights_count: number | null;
	readonly profile_image_url: string;
	readonly profile_url: string;
	readonly recent_posts: readonly { readonly url: string; readonly content_type: string; readonly caption: string; readonly posted_at: string; readonly image_url: string; readonly hashtags: readonly string[] }[];
}

export interface InstagramPost {
	readonly url: string;
	readonly shortcode: string;
	readonly username: string;
	readonly caption: string;
	readonly content_type: string;
	readonly posted_at: string;
	readonly likes: number | null;
	readonly comments: number | null;
	readonly views: number | null;
	readonly duration_sec: number | null;
	readonly hashtags: readonly string[];
	readonly is_paid_partnership: boolean;
	readonly coauthors: readonly string[];
	readonly thumbnail_url: string;
	readonly image_urls: readonly string[];
	readonly video_url: string;
	readonly author: { readonly followers: number | null; readonly is_verified: boolean; readonly profile_url: string };
}

export interface TiktokProfile {
	readonly username: string;
	readonly nickname: string;
	readonly biography: string;
	readonly followers: number | null;
	readonly following: number | null;
	readonly likes: number | null;
	readonly videos_count: number | null;
	readonly is_verified: boolean;
	readonly is_private: boolean;
	readonly bio_link: string;
	readonly engagement_rate: number | null;
	readonly created_at: string;
	readonly profile_image_url: string;
	readonly profile_url: string;
	readonly recent_videos: readonly { readonly video_id: string; readonly url: string; readonly views: number | null; readonly likes: number | null; readonly comments: number | null; readonly shares: number | null; readonly posted_at: string; readonly cover_image_url: string }[];
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
/** basic 40P(default) · advanced 350P · premium 1,400P per image */
export type ImageAiQuality = 'basic' | 'advanced' | 'premium';
export type ImageAiStatus = 'waiting' | 'processing' | 'completed' | 'completed_partial' | 'failed';
export type ApickImageErrorCode = `APICK_IMAGE_${string}`;
export interface ImageAiOptions { imageCount?: number; size?: ImageAiSize; outputFormat?: ImageAiFormat; background?: ImageAiBackground; quality?: ImageAiQuality;
	/** @deprecated Ignored. Every image request is generated and charged as a new request. */
	idempotencyKey?: string; }
export interface ImageAiGenerateOptions extends ImageAiOptions { referenceImage?: string|BinaryInput|ArrayBuffer|ArrayBufferView; referenceFilename?: string; referenceContentType?: 'image/png'|'image/jpeg'|'image/webp'; }
export interface ImageAiEditOptions extends ImageAiOptions { filename?: string; contentType?: 'image/png'|'image/jpeg'|'image/webp'; }
export interface ImageAiResultImage { index:number; b64_json:string; mime_type:'image/png'|'image/jpeg'|'image/webp'; width:number; height:number; }
export interface ImageAiResultData { request_id:string; image_count:number; images:ImageAiResultImage[]; idempotent_replay?:boolean; }
export interface ImageAiPendingData {request_id:string;job_id:string;status:'processing';billing_status:'pending';reserved_point:number;}
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
export interface RequestCashReceiptDeductionInput extends DataRequestInput { incomeYears?: number; }
export interface RequestTaxReturnHistoryInput extends DataRequestInput { years?: number; }

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

export interface CashReceiptTotals { 건수: number; 사용금액: number; 소득공제건수: number; 소득공제금액: number; }
export interface CashReceiptEntry {
	거래일시: string; 가맹점: string; 금액: number; 승인번호: string;
	거래구분: string; 거래상태: string; 소득공제대상: boolean; 소득공제반영: boolean;
}
export interface CashReceiptYear { 귀속연도: string; 합계: CashReceiptTotals; 사용내역: CashReceiptEntry[]; }
export interface CashReceiptDeductionInfo { 조회연도: string[]; 전체합계: CashReceiptTotals; 연도별: CashReceiptYear[]; }
export interface CashReceiptDeductionResultPayload { cashReceiptDeduction: CashReceiptDeductionInfo; }

export interface TaxReturnEntry {
	신고일: string; 과세기간: string; 신고서: string; 신고구분: string; 신고상세: string;
	세목: string; 작성방법: string; 납부년월: string; 납부금액: number; 고지금액: number;
}
export interface TaxReturnHistoryInfo {
	조회기간: { 시작: string; 끝: string };
	합계: { 건수: number; 납부금액: number; 고지금액: number };
	신고내역: TaxReturnEntry[];
}
export interface TaxReturnHistoryResultPayload { taxReturnHistory: TaxReturnHistoryInfo; }

export interface YoutubeThumbnail { url: string; width: number; height: number; }
export interface YoutubeChapter { title: string; start_time: number | null; end_time: number | null; }
export interface YoutubeMetadata {
	video_id: string; url: string; title: string | null; description: string;
	channel: { id: string | null; name: string | null; url: string | null; handle: string | null; follower_count: number | null; is_verified: boolean };
	upload_date: string | null; duration: number | null; view_count: number | null; like_count: number | null; comment_count: number | null;
	categories: string[]; tags: string[]; language: string | null; live_status: string | null; availability: string | null;
	age_limit: number | null; chapters: YoutubeChapter[]; thumbnail: string | null; thumbnails: YoutubeThumbnail[];
	subtitle_languages: string[]; automatic_caption_count: number;
}
/** translated=true 인 자동 번역 자막은 유튜브 제한으로 받지 못할 수 있다. 수동 자막이나 원어 자동 자막을 권장한다. */
export interface YoutubeSubtitleTrack { lang: string; name: string | null; auto: boolean; formats: string[]; translated?: boolean; }
export interface YoutubeSubtitleList {
	video_id: string; title: string | null; original_language: string | null;
	subtitle_count: number; automatic_caption_count: number;
	subtitles: YoutubeSubtitleTrack[]; automatic_captions: YoutubeSubtitleTrack[];
}
export interface YoutubeSubtitleOptions { format?: 'vtt' | 'srt' | 'txt'; type?: 'any' | 'manual' | 'auto'; }
export interface YoutubeChannelRef { id: string | null; name: string | null; url: string | null; handle: string | null; }
export interface YoutubeListItem {
	type: 'video' | 'short' | 'channel' | 'playlist'; id: string; url: string; title: string | null; thumbnail: string | null;
	description?: string | null; duration?: number | null; view_count?: number | null; live_status?: string | null; published_at?: string | null;
	channel?: YoutubeChannelRef | null; handle?: string | null; follower_count?: number | null; is_verified?: boolean; video_count?: number | null;
}
export interface YoutubeSearchOptions {
	count?: number; sort?: 'relevance' | 'date' | 'views' | 'rating'; type?: 'any' | 'video' | 'channel' | 'playlist' | 'movie';
	uploadDate?: 'any' | 'hour' | 'today' | 'week' | 'month' | 'year'; duration?: 'any' | 'short' | 'medium' | 'long';
}
export interface YoutubeSearchResult { query: string; count: number; results: YoutubeListItem[]; }
export interface YoutubeChannelResult {
	channel: YoutubeChannelRef & { description: string; follower_count: number | null; is_verified: boolean; tags: string[]; thumbnail: string | null };
	tab: 'videos' | 'shorts' | 'streams' | 'playlists'; count: number; items: YoutubeListItem[];
}
export interface YoutubePlaylistResult {
	playlist_id: string; url: string; title: string | null; description: string; channel: YoutubeChannelRef | null;
	video_count: number | null; view_count: number | null; modified_date: string | null; count: number; videos: YoutubeListItem[];
}
export interface YoutubeHashtagResult { hashtag: string; count: number; videos: YoutubeListItem[]; }
export interface YoutubeVideoFormat { quality: string; width: number | null; height: number; fps: number | null; codec: string | null; hdr: boolean; has_audio: boolean; bitrate_kbps: number | null; filesize: number | null; filesize_estimated: boolean; }
export interface YoutubeAudioFormat { codec: string | null; bitrate_kbps: number | null; sample_rate: number | null; channels: number | null; language: string | null; filesize: number | null; filesize_estimated: boolean; }
export interface YoutubeFormats {
	video_id: string; title: string | null; duration: number | null; live_status: string | null; downloadable: boolean;
	video_formats: YoutubeVideoFormat[]; audio_formats: YoutubeAudioFormat[];
	download_options: { video: { quality: string; estimated_size: number; estimated_cost: number }[]; audio: { format: 'mp3' | 'm4a' | 'opus'; bitrate: number | null; estimated_size: number; estimated_cost: number }[] };
}
export interface YoutubeComment {
	id: string; parent_id: string | null; text: string; author: string | null; author_channel_id: string | null; author_url: string | null; author_thumbnail: string | null;
	author_is_uploader: boolean; author_is_verified: boolean; like_count: number | null; is_pinned: boolean; is_hearted: boolean; published_at: string | null;
}
export interface YoutubeComments { video_id: string; title: string | null; sort: 'top' | 'new'; include_replies: boolean; count: number; comments: YoutubeComment[]; }
export interface YoutubeCommentsOptions { count?: number; sort?: 'top' | 'new'; replies?: boolean; }
export interface YoutubeDownloadLink {
	video_id: string | null; title: string | null; duration: number | null; size: number; size_units: number; content_type: string; filename: string;
	download_url: string; expires_at: string; quality?: string | null; format?: 'mp3' | 'm4a' | 'opus'; bitrate?: number | null;
	billing: { base: number; size_unit_cost: number; size_cost: number; total: number };
}
export interface YoutubeVideoDownloadOptions { quality?: 'best' | '2160' | '1440' | '1080' | '720' | '480' | '360' | '240' | '144' | number; codec?: 'any' | 'h264'; start?: string | number; end?: string | number; }
export interface YoutubeAudioDownloadOptions { format?: 'mp3' | 'm4a' | 'opus'; bitrate?: 128 | 192 | 320 | '128' | '192' | '320'; start?: string | number; end?: string | number; }

/** @deprecated Retired APICK voice IDs. Query listGeminiTtsVoices or listOpenAiTtsVoices. */
export const TTS_VOICE_IDS: readonly [
	'v2_ann_m_30s_01', 'v2_ann_m_30s_02', 'v2_ann_m_30s_04', 'v2_ann_m_30s_05', 'v2_ann_f_30s_02', 'v2_ann_f_30s_03', 'v2_ann_f_30s_04', 'v2_ann_f_30s_05', 'v2_m_teen_01', 'v2_m_young_01', 'v2_m_mid_01', 'v2_m_senior_01', 'v2_f_young_01', 'v2_f_senior_01'
];
export type TtsVoiceId = string;
/** @deprecated Automatic fallback is no longer supported. */
export type TtsFallbackPolicy = 'never' | 'queue_full' | 'busy';
export interface TtsFallbackOptions { voice_id?: string; style?: string; }
/** @deprecated Retired APICK request shape. Use GeminiTtsInput or OpenAiTtsInput. */
export interface ApickTtsInput { voice_id: TtsVoiceId; text?: string; utterances?: Array<{text:string;emotion?:string;speed?:number;pause_after_ms?:number}>; normalize_text?:boolean; fallback_policy?:TtsFallbackPolicy; fallback_options?:TtsFallbackOptions; }
export interface TtsStyleOptions { style?:string; emotion?:'neutral'|'calm'|'cheerful'|'excited'|'sad'|'serious'|'friendly'|'empathetic'|'confident'|'gentle'|'whisper'|'narration'; tone?:'narration'|'news'|'audiobook'|'documentary'|'ad'|'conversation'|'announcement'|'tutorial'|'storytelling'; accent?:'standard'|'seoul'|'gyeongsang'|'jeolla'|'chungcheong'; pace?:number; pitch?:number; volume_gain_db?:number; }
export interface TtsSpeakerOptions extends TtsStyleOptions { voice_id?:string; }
export interface TtsUtterance extends TtsSpeakerOptions { text:string; speaker?:string; }
export interface GeminiTtsInput extends TtsStyleOptions { voice_id?:string; text?:string; utterances?:TtsUtterance[]; speakers?:Record<string,TtsSpeakerOptions>; multi_speaker?:boolean; normalize_text?:boolean; language_code?:'ko'|'ko-KR'; }
export interface OpenAiTtsInput extends GeminiTtsInput {}
export interface TtsOptions { voiceId?:TtsVoiceId; normalizeText?:boolean; idempotencyKey?:string; }
export interface GeminiTtsVoice { voice_id:string; name:string; gender:string|null; tone:string; age_band:string|null; age_years?:number|null; age_verified?:boolean; age_basis?:'catalog_description'|'reviewed'; age_source?:string; description?:string; language_code?:string|null; reviewed_at?:string; library:string; }
export interface TtsQuote { synthesis:number; normalization:number; estimated_total:number; maximum:number; synthesis_maximum:number; normalization_maximum:number; estimated_only:true; currency:'POINT'; fallback_price_may_change:boolean; }

export interface TtsJobData {
	job_id: string;
	status: 'waiting' | 'processing' | 'completed' | 'cancelled' | 'failed';
	voice_id?: string;
	synthesis?: {engine:'apick'|'gemini'|'openai';model:string;voice_id:string;fallback_reason:string|null;age_verified:boolean;notice:string|null};
	normalization?: {enabled:boolean;run_id:string|null;status:string;skill_id:string|null};
	billing?: {status:string;synthesis:number;skill:number;total:number;reserved:number;refunded:number;released:number;currency:'POINT'};
	expires_at?:string|null;
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
	/** Skills 오류의 부가 정보. 예: INVALID_INPUT 의 `errors` 목록 */
	readonly details?: Record<string, unknown>;
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
	googleNewsSearch(keyword: string, options?: { page?: number }): Promise<ApickResult<SearchList<NewsItem>>>;
	googleShoppingSearch(keyword: string, options?: { page?: number }): Promise<ApickResult<SearchList<ShoppingItem>>>;
	googleMapsSearch(keyword: string): Promise<ApickResult<SearchList<PlaceItem>>>;
	googleRankCheck(keyword: string, domain: string): Promise<ApickResult<RankCheck>>;
	instagramProfile(usernameOrUrl: string): Promise<ApickResult<InstagramProfile>>;
	instagramPost(url: string): Promise<ApickResult<InstagramPost>>;
	tiktokProfile(usernameOrUrl: string): Promise<ApickResult<TiktokProfile>>;
	amazonProduct(urlOrAsin: string): Promise<ApickResult<AmazonProduct>>;
	xProfile(usernameOrUrl: string): Promise<ApickResult<XProfile>>;
	xPost(url: string): Promise<ApickResult<XPost>>;
	createInstagramPostsJob(usernameOrUrl: string, options?: ScrapeJobOptions): Promise<ApickResult<ScrapeJob<InstagramPost>>>;
	createInstagramCommentsJob(url: string, options?: ScrapeJobOptions): Promise<ApickResult<ScrapeJob<SocialComment>>>;
	createTiktokSearchJob(keyword: string, options?: ScrapeJobOptions): Promise<ApickResult<ScrapeJob<TiktokVideo>>>;
	createTiktokVideoJob(url: string, options?: Pick<ScrapeJobOptions, "idempotencyKey">): Promise<ApickResult<ScrapeJob<TiktokVideo>>>;
	createTiktokCommentsJob(url: string, options?: ScrapeJobOptions): Promise<ApickResult<ScrapeJob<SocialComment>>>;
	createAmazonReviewsJob(urlOrAsin: string, options?: ScrapeJobOptions): Promise<ApickResult<ScrapeJob<AmazonReview>>>;
	getScrapeJob<T = unknown>(jobId: string): Promise<ApickResult<ScrapeJob<T>>>;
	waitForScrapeJob<T = unknown>(jobId: string, options?: { intervalMs?: number; timeoutMs?: number }): Promise<ApickResult<ScrapeJob<T>>>;
	screenshot(url: string): Promise<ApickBinaryResult>;
	youtubeMetadata(url: string): Promise<ApickResult<YoutubeMetadata>>;
	youtubeThumbnail(url: string): Promise<ApickBinaryResult>;
	youtubeSubtitleList(url: string): Promise<ApickResult<YoutubeSubtitleList>>;
	youtubeSubtitle(url: string, lang: string, options?: YoutubeSubtitleOptions): Promise<ApickBinaryResult>;
	youtubeSearch(query: string, options?: YoutubeSearchOptions): Promise<ApickResult<YoutubeSearchResult>>;
	youtubeChannel(channel: string, options?: { tab?: 'videos' | 'shorts' | 'streams' | 'playlists'; count?: number }): Promise<ApickResult<YoutubeChannelResult>>;
	youtubePlaylist(url: string, options?: { count?: number }): Promise<ApickResult<YoutubePlaylistResult>>;
	youtubeHashtag(hashtag: string, options?: { count?: number }): Promise<ApickResult<YoutubeHashtagResult>>;
	youtubeFormats(url: string): Promise<ApickResult<YoutubeFormats>>;
	youtubeComments(url: string, options?: YoutubeCommentsOptions): Promise<ApickResult<YoutubeComments>>;
	downloadYoutubeVideo(url: string, options?: YoutubeVideoDownloadOptions): Promise<ApickResult<YoutubeDownloadLink>>;
	downloadYoutubeAudio(url: string, options?: YoutubeAudioDownloadOptions): Promise<ApickResult<YoutubeDownloadLink>>;
	createTtsJob(text: string | GeminiTtsInput, options?: TtsOptions): Promise<ApickResult<TtsJobData>>;
	createGeminiTtsJob(input:GeminiTtsInput, options?:{idempotencyKey?:string}):Promise<ApickResult<TtsJobData>>;
	listGeminiTtsVoices():Promise<ApickResult<{voices:GeminiTtsVoice[];complete:boolean;checked_at:string|null}>>;
	createOpenAiTtsJob(input:OpenAiTtsInput, options?:{idempotencyKey?:string}):Promise<ApickResult<TtsJobData>>;
	listOpenAiTtsVoices():Promise<ApickResult<{voices:GeminiTtsVoice[];complete:boolean;checked_at:string|null}>>;
	getTtsOptions():Promise<ApickResult<{engines:Record<'gemini'|'openai',Record<string,unknown>>}>>;
	quoteTts(input:GeminiTtsInput&{engine?:'gemini'|'openai'}):Promise<ApickResult<TtsQuote>>;
	getTtsJob(jobId: string): Promise<ApickResult<TtsJobData>>;
	cancelTtsJob(jobId: string): Promise<ApickResult<TtsJobData>>;
	downloadTtsResult(jobId: string): Promise<ApickBinaryResult>;
	downloadTtsSubtitles(jobId: string): Promise<ApickBinaryResult>;
	/** @deprecated Retired endpoint; the service returns HTTP 409. */
	getTtsQuality(jobId: string): Promise<ApickResult<TtsQualityData>>;
	/** @deprecated Retired endpoint; the service returns HTTP 409. */
	retryTtsJob(jobId: string, utteranceIds: string[], idempotencyKey: string): Promise<ApickResult<TtsJobData>>;
	/** @deprecated Retired endpoint; the service returns HTTP 409. */
	downloadTtsCandidate(jobId: string, candidateId: string): Promise<ApickBinaryResult>;
	htmlToPdf(html: string, options?: { pagination?: boolean }): Promise<ApickBinaryResult>;
	jsonToExcel(data: unknown[], options?: { sheetName?: string }): Promise<ApickBinaryResult>;
	summarize(text: string): Promise<ApickResult>;
	polish(text: string): Promise<ApickResult>;
	generateImages(prompt:string, options?:ImageAiGenerateOptions): Promise<ApickResult<ImageAiResultData|ImageAiPendingData>>;
	editImages(image:string|BinaryInput|ArrayBuffer|ArrayBufferView, prompt:string, options?:ImageAiEditOptions): Promise<ApickResult<ImageAiResultData|ImageAiPendingData>>;
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
	requestCashReceiptDeduction(input: RequestCashReceiptDeductionInput): Promise<ApickResult<DataRequestAcceptedData>>;
	getCashReceiptDeduction(transactionId: string): Promise<ApickResult<DataRequestResult<CashReceiptDeductionResultPayload>>>;
	requestTaxReturnHistory(input: RequestTaxReturnHistoryInput): Promise<ApickResult<DataRequestAcceptedData>>;
	getTaxReturnHistory(transactionId: string): Promise<ApickResult<DataRequestResult<TaxReturnHistoryResultPayload>>>;
	searchSkills(options?: SkillSearchOptions): Promise<ApickResult<SkillPage<SkillSummary>>>;
	/** Public measured results and methods; model scores are not accuracy guarantees. */
	getSkillPerformance(): Promise<ApickResult<SkillPerformanceReport>>;
	subagentStatus(): Promise<ApickResult<Record<string, unknown>>>;
	subagentUsage(): Promise<ApickResult<Record<string, unknown>>>;
	createSubagentFile(input: {path:string;bytes:number;sha256:string;retention?:'seven_days'|'none'}): Promise<ApickResult<SubagentFile>>;
	getSubagentFile(fileId:string): Promise<ApickResult<SubagentFile>>;
	uploadSubagentPart(fileId:string,partNo:number,data:string): Promise<ApickResult<Record<string,unknown>>>;
	completeSubagentFile(fileId:string): Promise<ApickResult<SubagentFile>>;
	deleteSubagentFile(fileId:string): Promise<ApickResult<Record<string,unknown>>>;
	dispatchSubagent(input:SubagentTask,options:{idempotencyKey:string}): Promise<ApickResult<SubagentJob>>;
	collectSubagent(jobId:string,options?:{cursor?:string}): Promise<ApickResult<SubagentJob>>;
	subagentEvidence(jobId:string,evidenceIds:string[]): Promise<ApickResult<Record<string,unknown>>>;
	reviewSubagent(jobId:string,resultHash:string,decision:'accepted'|'rejected'): Promise<ApickResult<Record<string,unknown>>>;
	cancelSubagent(jobId:string): Promise<ApickResult<SubagentJob>>;
	deleteSubagentJob(jobId:string): Promise<ApickResult<Record<string,unknown>>>;
	getSkill(skillId: string): Promise<ApickResult<SkillDetail>>;
	quoteSkill(skillId: string, input: Record<string, unknown>, options?: { version?: string }): Promise<ApickResult<SkillQuote>>;
	runSkill<T = Record<string, unknown>>(skillId: string, input: Record<string, unknown>, options: SkillRunOptions): Promise<ApickResult<SkillRun<T>>>;
	getSkillRun<T = Record<string, unknown>>(runId: string): Promise<ApickResult<SkillRun<T>>>;
	getSkillRunResult<T = Record<string, unknown>>(runId: string): Promise<ApickResult<SkillRunResult<T>>>;
	/** 본인 실행의 결과 파일을 인증해 내려받습니다. / Download an artifact owned by this API key. */
	getSkillArtifact(runId: string, fileId: string): Promise<ApickBinaryResult>;
	cancelSkillRun(runId: string): Promise<ApickResult<SkillRun>>;
	skillUsage(options?: { cursor?: string; limit?: number }): Promise<ApickResult<SkillPage<SkillRun>>>;
}

export const SKILL_CATEGORIES: readonly ['data', 'ai', 'dev', 'document', 'marketing', 'finance', 'productivity', 'video', 'etc'];
export type SkillCategory = typeof SKILL_CATEGORIES[number];
/** 검색 순서. 생략하면 등록 순서 / search order; registration order when omitted */
export const SKILL_SORTS: readonly ['recommended', 'popular', 'used', 'likes', 'rating', 'new', 'mine', 'liked'];
export type SkillSort = typeof SKILL_SORTS[number];
export interface SkillPerformanceRate {
	passed: number; total: number; percent: number; interval95: [number, number];
}
export interface SkillPerformanceReport {
	schema_version: 1;
	updated_at: string;
	inventory_verified: boolean;
	method: { minimum_cases: number; min_score: number; mean_score: number; min_improvement: number; critical_failures: number; description: string; limitations: string[]; interval_note: string; split: { normal: number; boundary: number; adversarial: number } };
	calibration: { at: string; cases: number; true_positive: number; false_negative: number; false_positive: number; true_negative: number; automatic_release_allowed: boolean } | null;
	additional_calibrations: Array<{ label: string; at: string; cases: number; detected: number; missed: number; false_positive: number; uncertain: number; automatic_release_allowed: boolean; scope: string }>;
	skills: Array<{
		key: string; title: string; group: string; origin: 'new' | 'existing'; published: boolean | null; url: string | null;
		current: {
			state: 'not_tested' | 'partial' | 'held' | 'passed' | 'stale'; at?: string;
			cases: number; planned_cases: number; score: number | null; baseline_score: number | null;
			score_samples?: number; evaluation_errors?: number;
			delivery: SkillPerformanceRate | null; machine: SkillPerformanceRate | null;
			median_seconds: number | null; p95_seconds: number | null; timing_samples?: number;
			reasons: string[]; method?: string; sample_type?: string;
			baseline_format_valid?: boolean;
			evaluation_stage?: 'preliminary' | 'holdout';
			dataset_composition?: { normal: number; boundary: number; adversarial: number; misplaced_rejections: number; valid: boolean };
			min_score?: number | null; critical_cases?: number | null;
			case_split?: { standard: number; boundary: number; adversarial: number };
			extra_checks?: Array<{ name: string; passed: number; total: number }>;
			tool_calls?: Array<{ label: string; samples: number; total: number | null; median: number | null; p95: number | null }>;
			case_results?: Array<{ index: number; name: string; kind: 'standard' | 'boundary' | 'adversarial'; status: 'tested' | 'evaluation_error' | 'machine_only' | 'not_tested'; expected: 'success' | 'reject' | null; machine_pass: boolean; score: number | null; baseline_score: number | null; failed_checks: string[]; reason: string | null }>;
		};
		legacy: { cases: number; score: number; baseline_score: number; method: string; independent_holdout: false; at?: string } | null;
	}>;
}
export type SkillRunStatus = 'queued' | 'running' | 'completing' | 'succeeded' | 'failed' | 'timed_out' | 'cancelled';
export type SkillBillingStatus = 'reserved' | 'captured' | 'released' | 'partially_refunded' | 'refunded';
export type SkillFailureCode = 'EXECUTION_FAILED' | 'OUTPUT_INVALID' | 'TIMED_OUT' | 'CANCELLED' | 'UPSTREAM_UNAVAILABLE';
/** `ApickApiError.serviceCode` 로 돌아오는 Skills 오류 코드 */
export type SkillErrorCode =
	| 'INVALID_INPUT' | 'AUTH_REQUIRED' | 'NOT_ALLOWED' | 'PAYMENT_REQUIRED' | 'SKILL_OR_RUN_NOT_FOUND'
	| 'IDEMPOTENCY_KEY_REQUIRED' | 'IDEMPOTENCY_CONFLICT' | 'QUOTE_EXPIRED' | 'VERSION_UNAVAILABLE'
	| 'PRICE_EXCEEDS_LIMIT' | 'RUN_NOT_CANCELLABLE' | 'RESULT_NOT_READY' | 'RESULT_EXPIRED'
	| 'INSUFFICIENT_POINTS' | 'RATE_LIMITED' | 'BUDGET_EXCEEDED' | 'TEMPORARILY_UNAVAILABLE';
export interface SkillSearchOptions {
	query?: string; category?: SkillCategory;
	/** `mine`·`liked` 는 인증키의 계정 기준 / `mine` and `liked` are scoped to the API key's account */
	sort?: SkillSort;
	cursor?: string; limit?: number;
}
export interface SkillRunOptions {
	/** 이 실행을 구분하는 고유 값. 재시도할 때 같은 값을 씁니다. 영문·숫자와 `. _ : -` 1~128자 */
	idempotencyKey: string;
	version?: string;
	quoteId?: string;
	/** 가격이 이 값보다 높으면 실행하지 않습니다 */
	maxCostPoints?: number;
	/** 결과를 기다릴 시간(0~20초, 기본 20) */
	waitSeconds?: number;
}
export interface SkillPage<T> { items: T[]; next_cursor: string | null; }
export interface SkillLimits { max_input_chars: number; timeout_seconds: number; }
export interface SkillSummary {
	execution_info?: SkillExecutionInfo;
	price_label?: string;
	skill_id: string; slug: string; title: string; summary: string;
	category: SkillCategory; category_label: string; version: string;
	/** 실행마다 같은 기본 금액 / base amount charged on every run */
	price_points: number;
	/** 사용량까지 더한 예상 금액 / estimated amount including usage */
	estimated_points: number | null;
	/** true 면 실행마다 실제 사용량만큼 금액이 달라집니다 / amount varies per run with actual usage */
	usage_priced: boolean;
	seller: { name: string }; uses_generative_ai: boolean;
	/** 사용 건수 구간. 예: `1,000회 미만`, `1,000+`, `1만+` / usage tier label, not an exact count */
	usage_label: string;
	like_count: number;
	review_count: number;
	/** 평점(1~5, 소수 첫째 자리). 리뷰가 없으면 null / average rating, null without reviews */
	rating_average: number | null;
}
export interface SkillDetail extends SkillSummary {
	description: string; billing_rule: 'validated_result' | 'subagent_usage'; limits: SkillLimits | null;
	delivery?: 'installed_agent'; installation?: {package:string;command:string;api_key_env:string;guide:string;usage:string};
	billing?: {markup_percent:number;installation_points:number;base_points:number;complete_cache_points:number;quota:null};
	input_schema: Record<string, unknown>; output_schema: Record<string, unknown>;
	examples: unknown[]; stats: Record<string, unknown> | null; published_at: string | null;
}
export interface SkillQuote {
	execution_info?: SkillExecutionInfo;
	quote_id: string; skill_id: string; version: string; price_points: number;
	/** 이 입력의 예상 금액 / estimated amount for this input */
	estimated_points: number;
	/** 예약되는 최대 금액. 실제 차감액은 이 값을 넘지 않습니다 / maximum amount reserved; the charge never exceeds it */
	max_points: number;
	usage_priced: boolean;
	expires_at: string; limits: SkillLimits; billing_rule: 'validated_result';
}
export interface SkillBilling { status: SkillBillingStatus; reserved_points: number; charged_points: number; refunded_points: number; }
export interface SkillExecutionInfo {
	price_range: { min_points: number; max_points: number; variable: boolean };
	duration: { min_seconds: number; max_seconds: number; basis: string };
	tools: Array<{ name: string; typical_calls: number | string; max_calls: number | string; min_calls?: number }>;
	billing_note: string;
}
export interface SkillArtifact {
	id: string; name: string; mime_type: string; url: string; sha256: string; bytes: number;
	label?: string; width?: number; height?: number; seconds?: number;
}
export interface SkillRun<T = Record<string, unknown>> {
	run_id: string; status: SkillRunStatus;
	skill: { id: string; version: string; title?: string };
	billing: SkillBilling; created_at: string | null; completed_at: string | null;
	links: { self: string; result?: string };
	failure_code?: SkillFailureCode; result_expires_at?: string | null;
	/** status 가 succeeded 일 때만 */
	result?: T;
}
export interface SkillRunResult<T = Record<string, unknown>> {
	run_id: string; skill: { id: string; version: string; title?: string };
	result: T; result_expires_at: string | null;
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

export interface SubagentTask { kind:'inventory'|'extract'|'summarize'|'compare';goal:string;file_ids:string[];focus?:string[];acceptance?:string[];retention?:'seven_days'|'none'; }
export interface SubagentFile { file_id:string;path:string;sha256:string;bytes:number;state:string;expires_at:string;part_bytes?:number; }
export interface SubagentJob { job_id:string;kind:SubagentTask['kind'];state:string;billing_state:string;cache_hit:boolean;reserved_points:number;charged_points:number;accrued_points:string;result_hash?:string;result?:Record<string,unknown>; }
