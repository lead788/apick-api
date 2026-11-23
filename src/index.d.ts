export interface DocumentJobReference { job_id: string; }
export interface DocumentWorkflowInput { action?: 'attachment_review'; document_id?: string; version?: number; text?: string; form?: string; edition?: string; max_points: number; total_max_points?: number; request_id: string; }
export type DocumentWorkflowAnswerInput = Omit<DocumentWorkflowInput, 'action' | 'document_id' | 'version' | 'text'> & { text: string; action?: never; document_id?: never; version?: never };
export interface DocumentWorkflowJob { job_id: string; document_id?: string | null; state: 'queued' | 'running' | 'ready' | 'awaiting_answers' | 'cancelled' | 'interrupted' | 'failed'; charged_points: number; max_points: number; total_max_points: number; total_charged_points?: number; total_reserved_points?: number; remaining_points?: number; error_code?: string | null; expires_at: string; result?: Record<string, unknown> | null; }
export interface DocumentVerification { document_version: number; verification_hash: string; content_hash: string; can_finalize: boolean; finalized?: boolean; scope: string; issues: Array<{key?: string; state: string; reason: string; blocking: boolean}>; claims: Array<Record<string, unknown>>; official: Array<Record<string, unknown>>; }
export interface DocumentWorkflowQuote { price: number; unit: 'P'; steps: number; includes: string[]; additional_steps: string; download_included: false; action?: 'attachment_review'; attachments?: number; }
export interface DocumentNode {
 type: 'doc' | 'paragraph' | 'heading' | 'text' | 'hardBreak' | 'bulletList' | 'orderedList' | 'listItem' | 'table' | 'tableRow' | 'tableCell' | 'tableHeader' | 'image' | 'pageBreak' | 'docField' | 'formSheet';
 text?: string; attrs?: Record<string, unknown>; content?: DocumentNode[];
 marks?: Array<{ type: 'bold' | 'italic' | 'underline' | 'strike' | 'textStyle' | 'highlight'; attrs?: Record<string, unknown> }>;
}
/** 같은 대화에서 앞서 오간 말. 최근 8개, 한 말당 1,500자까지 보낸다. 근거로는 user 말만 쓴다. */
export interface DocumentAssistTurn { role: 'user' | 'assistant'; text: string }

export interface DocumentBody { schema_version?: 1; title?: string; form?: string; content?: DocumentNode; }
export interface SavedDocument extends DocumentBody { document_id: string; version: number; content_hash: string; updated_at: string; expires_at: string; download_price: number; }
export interface DocumentReference { document_id: string; }
export interface DocumentVersion extends DocumentReference { version: number; }
export interface DocumentCreateInput extends DocumentBody { request_id: string; }
export interface DocumentUpdateInput extends DocumentBody, DocumentVersion { request_id: string; }
export interface DocumentQuote extends DocumentVersion { content_hash: string; price: number; redownload: boolean; expires_at: string; }
export interface DocumentDownloadInput extends DocumentVersion { content_hash: string; request_id: string; }
export interface DocumentAiInput { action?: 'draft' | 'fill' | 'polish' | 'summarize' | 'expand'; text: string; document?: DocumentBody; selection?: string; request_id: string; }
export type DocumentAiResult = { kind: 'document' | 'selection'; title: string; content: DocumentNode; notes: string } | { kind: 'fields'; values: Record<string, string>; notes: string };

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

export interface CoupangProduct {
	readonly product_id: string;
	readonly url: string;
	readonly title: string;
	readonly rating: number | null;
	readonly reviews: number | null;
	readonly initial_price: string;
	readonly final_price: string;
	readonly discount_rate: number | null;
	readonly currency: string;
	readonly seller_name: string;
	readonly shop_url: string;
	readonly seller_rating: number | null;
	readonly seller_reviews: number | null;
	readonly images: readonly string[];
	readonly main_image: string;
	readonly categories: readonly { readonly name: string; readonly url: string }[];
	readonly root_category: string;
	readonly root_category_url: string;
	readonly shipping_details: readonly string[];
	readonly variations: readonly { readonly name: string; readonly variations: readonly string[] }[];
	readonly is_in_stock: boolean;
}

/** 네이버 브랜드스토어 상품. 상품 주소는 `/{스토어}/products/{번호}` 형식만 받는다. */
export interface NaverShoppingProduct {
	readonly product_id: string;
	readonly url: string;
	readonly title: string;
	readonly original_price: string;
	readonly final_price: number | null;
	readonly discount_rate: number | null;
	readonly currency: string;
	readonly description: string;
	readonly total_reviews: number | null;
	readonly average_rating: number | null;
	readonly sold_out: boolean;
	readonly delivery_fee_type: string;
	readonly arrival_guarantee: boolean;
	readonly category_name: string;
	readonly tags: readonly string[];
	readonly breadcrumbs: readonly string[];
	readonly images: readonly string[];
	readonly sellers: readonly { readonly seller_name: string; readonly final_price: number | null; readonly currency: string; readonly seller_link: string }[];
	readonly product_information: readonly { readonly label: string; readonly value: string }[];
}

export interface LinkedinProfile {
	readonly linkedin_id: string;
	readonly name: string;
	readonly first_name: string;
	readonly last_name: string;
	readonly position: string;
	readonly about: string;
	readonly location: string;
	readonly country_code: string;
	readonly followers: number | null;
	readonly connections: number | null;
	readonly current_company_name: string;
	readonly avatar: string;
	readonly banner_image: string;
	readonly url: string;
	readonly is_influencer: boolean;
	readonly experience: readonly { readonly company: string; readonly title: string; readonly start: string; readonly end: string; readonly location: string }[];
	readonly education: readonly { readonly school: string; readonly degree: string; readonly start: string; readonly end: string }[];
	readonly certifications: readonly string[];
	readonly languages: readonly string[];
	readonly posts: readonly { readonly title: string; readonly link: string; readonly created_at: string; readonly interaction: string }[];
}

export interface LinkedinCompany {
	readonly company_id: string;
	readonly name: string;
	readonly about: string;
	readonly description: string;
	readonly slogan: string;
	readonly website: string;
	readonly industries: string;
	readonly company_size: string;
	readonly organization_type: string;
	readonly founded: number | null;
	readonly followers: number | null;
	readonly employees_on_linkedin: number | null;
	readonly headquarters: string;
	readonly locations: readonly string[];
	readonly specialties: string;
	readonly logo: string;
	readonly image: string;
	readonly url: string;
	readonly funding: Readonly<Record<string, unknown>> | null;
	readonly updates: readonly { readonly title: string; readonly link: string; readonly date: string; readonly text: string }[];
}

export interface CourtAuctionItem {
	readonly itemNo: number | null;
	readonly address: string;
	readonly propertyKind: string;
	readonly appraisedPrice: number | null;
	readonly minimumPrice: number | null;
	readonly failedCount: number;
	readonly saleDate: string;
	readonly saleTime: string;
	readonly depositRate: number | null;
}

export interface CourtAuction {
	readonly result: number;
	readonly msg: string;
	readonly success: number;
	readonly case: {
		readonly caseNo: string;
		readonly court: string;
		readonly caseName: string;
		readonly receivedAt: string;
		readonly claimAmount: number | null;
		readonly judgeDept: string;
		readonly judgeDeptTel: string;
		readonly executorTel: string;
		readonly auctionStatus: string;
		readonly completedAt: string;
		readonly suspended: boolean;
		readonly suspensionReason: string;
	};
	readonly items: readonly CourtAuctionItem[];
	readonly saleSchedule: readonly {
		readonly saleDate: string;
		readonly saleTime: string;
		readonly items: readonly { readonly itemNo: number | null; readonly minimumPrice: number | null }[];
	}[];
	readonly claimDeadline: string;
	readonly relatedCases: readonly { readonly caseNo: string; readonly court: string; readonly kind: string }[];
	readonly count: number;
}

export interface RegistryDocVerify {
	readonly verified: boolean;
	readonly status: 'confirmed' | 'not_found' | 'count_exhausted' | 'invalid_format' | 'not_opened' | 'unknown';
	readonly message: string;
	readonly kind: 'realestate' | 'corporate' | 'movable';
	readonly document: string | null;
	readonly issued_date: string | null;
	readonly registry_office: string | null;
}

export interface BidQueryOptions {
	readonly bizType?: '물품' | '공사' | '용역' | '외자';
	readonly startDate?: string;
	readonly endDate?: string;
	readonly bidNtceNo?: string;
	readonly indstrytyCd?: string;
	readonly pageNo?: number;
	readonly numOfRows?: number;
}

export interface RtmsQueryOptions {
	readonly propertyType?: 'apt' | 'rh' | 'sh' | 'offi';
	readonly pageNo?: number;
	readonly numOfRows?: number;
	/** rtmsRent 전용. false 면 같은 단지 매매가 비교(jeonse_ratio) 없이 임대 분석만 받는다. 기본 true. */
	readonly includeTrade?: boolean;
}

export interface DistributionEntry {
	readonly name?: string;
	readonly band?: string;
	readonly count: number;
	readonly share_pct: number;
}

export interface BidSummary {
	readonly total: number;
	readonly agency_count: number;
	readonly industry_count: number;
	readonly budget_total: number | null;
	readonly budget_median: number | null;
	readonly closing_within_3d: number;
	readonly closed: number;
	readonly first_close_at: string | null;
	readonly last_close_at: string | null;
}

export interface BidPosting {
	readonly bid_no: string;
	readonly bid_name: string;
	readonly agency: string;
	readonly notice_at: string | null;
	readonly close_at: string | null;
	readonly days_left: number | null;
	readonly urgency: string;
	readonly budget: number | null;
	readonly budget_band: string;
	readonly industry: string;
	readonly method: string;
}

export interface BidNotice {
	readonly summary: BidSummary;
	readonly distribution: {
		readonly by_agency: readonly DistributionEntry[];
		readonly by_industry: readonly DistributionEntry[];
		readonly by_method: readonly DistributionEntry[];
		readonly by_budget_band: readonly DistributionEntry[];
		readonly by_urgency: readonly DistributionEntry[];
	};
	readonly deadlines: readonly BidPosting[];
	readonly largest: readonly BidPosting[];
	readonly insights: readonly string[];
}

export interface BidAward {
	readonly summary: {
		readonly total: number;
		readonly winner_count: number;
		readonly avg_success_rate: number | null;
		readonly median_success_rate: number | null;
		readonly success_rate_stdev: number | null;
		readonly avg_participants: number | null;
		readonly rate_sample: number;
		readonly winner_concentration_hhi: number | null;
		readonly success_amount_total: number | null;
	};
	readonly distribution: {
		readonly by_winner: readonly DistributionEntry[];
		readonly by_agency: readonly DistributionEntry[];
		readonly by_rate_band: readonly DistributionEntry[];
	};
	readonly competitors: readonly { readonly name: string; readonly wins: number; readonly share_pct: number; readonly amount_total: number | null }[];
	readonly low_rate: readonly BidPosting[];
	readonly insights: readonly string[];
}

export interface RtmsTrade {
	readonly summary: {
		readonly total: number;
		readonly complex_count: number;
		readonly median_amount: number | null;
		readonly median_price_per_sqm: number | null;
		readonly avg_price_per_sqm: number | null;
		readonly direct_deal_share_pct: number | null;
		readonly canceled_count: number;
		readonly median_area: number | null;
		readonly median_build_year: number | null;
	};
	readonly distribution: {
		readonly by_complex: readonly DistributionEntry[];
		readonly by_area_band: readonly DistributionEntry[];
		readonly by_amount_band: readonly DistributionEntry[];
		readonly by_floor: readonly DistributionEntry[];
	};
	readonly complexes: readonly Readonly<Record<string, unknown>>[];
	readonly anomalies: readonly Readonly<Record<string, unknown>>[];
	readonly insights: readonly string[];
}

export interface RtmsRent {
	readonly summary: {
		readonly total: number;
		readonly complex_count: number;
		readonly jeonse_count: number;
		readonly jeonse_share_pct: number | null;
		readonly median_deposit: number | null;
		readonly median_monthly_rent: number | null;
		readonly median_deposit_per_sqm: number | null;
		readonly avg_annual_rent_to_deposit_pct: number | null;
		readonly renewal_share_pct: number | null;
	};
	readonly distribution: {
		readonly by_complex: readonly DistributionEntry[];
		readonly by_deposit_band: readonly DistributionEntry[];
		readonly by_monthly_band: readonly DistributionEntry[];
		readonly by_contract_type: readonly DistributionEntry[];
	};
	readonly complexes: readonly Readonly<Record<string, unknown>>[];
	readonly jeonse_ratio: Readonly<Record<string, unknown>> | null;
	readonly insights: readonly string[];
}

export interface DartDisclosureOptions {
	/** 기업 고유번호 8자리. 생략하면 기간 전체 공시를 조회한다. */
	readonly corpCode?: string;
	/** 조회 시작일 YYYYMMDD. */
	readonly startDate?: string;
	/** 조회 종료일 YYYYMMDD. */
	readonly endDate?: string;
	/** 공시유형 A~J. */
	readonly pblntfTy?: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J';
	readonly pageNo?: number;
	readonly numOfRows?: number;
}

export interface DartFinancialsOptions {
	/** 보고서 코드 (11011 사업, 11012 반기, 11013 1분기, 11014 3분기). */
	readonly reprtCode?: '11011' | '11012' | '11013' | '11014';
	/** 연결(CFS)/개별(OFS) 구분. 기본 CFS. */
	readonly fsDiv?: 'CFS' | 'OFS';
}

export interface CorpFinanceOptions {
	/** 사업연도 YYYY. 생략하면 조회 가능한 가장 최근 연도. */
	readonly bizYear?: string;
	readonly type?: 'all' | 'summary' | 'balance' | 'income';
	readonly scope?: 'all' | 'consolidated' | 'separate';
}

export interface CorpFinance {
	readonly company: { readonly crno: string; readonly bizYear: string; readonly currency: string };
	readonly summary: readonly Readonly<Record<string, unknown>>[];
	readonly balance: readonly Readonly<Record<string, unknown>>[];
	readonly income: readonly Readonly<Record<string, unknown>>[];
	readonly metrics: Readonly<Record<string, number | string | null>> | null;
	readonly count: number;
}

export interface BuildingRegisterOptions {
	/** 필지고유번호 19자리. 주면 sigunguCd·bjdongCd·bun·ji 는 쓰지 않는다. */
	readonly pnu?: string;
	readonly sigunguCd?: string;
	readonly bjdongCd?: string;
	readonly platGbCd?: string;
	readonly bun?: string;
	readonly ji?: string;
	readonly type?: 'title' | 'recap' | 'basis' | 'floor' | 'expos' | 'area' | 'price' | 'wclf' | 'jibun' | 'district';
	readonly startDate?: string;
	readonly endDate?: string;
	readonly dongNm?: string;
	readonly hoNm?: string;
	readonly flrNo?: number;
	readonly pageNo?: number;
	readonly numOfRows?: number;
}

export interface VehicleRecall {
	readonly result: {
		readonly car_no: string;
		readonly vin: string;
		readonly recall_target: boolean;
		readonly recall_count: number;
		readonly free_repair_count: number;
		readonly recalls: readonly Readonly<Record<string, unknown>>[];
		readonly free_repairs: readonly Readonly<Record<string, unknown>>[];
		readonly checked_at: string;
	};
}

export interface HipassUnpaid {
	readonly result: {
		readonly car_no: string;
		readonly unpaid_target: boolean;
		readonly unpaid_count: number;
		readonly checked_at: string;
	};
}

/** 통신판매업 신고 한 건. 값이 없으면 빈 문자열이며 날짜는 YYYY-MM-DD. */
export interface EcommerceRegistrationItem {
	readonly 신고번호: string;
	readonly 상호: string;
	readonly 대표자명: string;
	/** 정상영업 · 휴업 · 폐업 등 */
	readonly 운영상태: string;
	readonly 신고일자: string;
	readonly 신고기관: string;
	readonly 시도: string;
	readonly 소재지주소: string;
	readonly 도로명주소: string;
	/** 법인이면 000000-0000000, 개인사업자는 빈 문자열 */
	readonly 법인등록번호: string;
	readonly 대표자이메일: string;
	readonly 담당부서: string;
	readonly 담당부서전화: string;
}

export interface EcommerceRegistration {
	readonly biz_no: string;
	/** 0 이면 신고 이력이 없고 차감되지 않는다. */
	readonly count: number;
	/** 정상영업 신고가 한 건이라도 있으면 true */
	readonly active: boolean;
	readonly active_count: number;
	/** items[0] 과 같다. 이력이 없으면 null. */
	readonly representative: EcommerceRegistrationItem | null;
	/** 정상영업 신고가 앞, 같은 상태 안에서는 신고일자 최신순 */
	readonly items: readonly EcommerceRegistrationItem[];
}

export interface ExchangeRateOptions {
	/** 조회 월 YYYYMM 또는 YYYY-MM. 생략하면 지난달. 이번 달 이후는 조회할 수 없다. */
	readonly month?: string;
	/** 통화 코드(영문 3자리) 쉼표 문자열 또는 배열, 최대 60개. 생략하면 전체 통화. */
	readonly currency?: string | readonly string[];
}

export interface ExchangeRateItem {
	readonly currency: string;
	/** 값이 나타내는 외화 단위. JPY·IDR·VND 는 100, 나머지는 1. */
	readonly unit: number;
	readonly monthly_average: number;
	readonly yearly_average: number | null;
}

export interface ExchangeRate {
	readonly month: string;
	readonly base_currency: 'KRW';
	readonly count: number;
	readonly rates: readonly ExchangeRateItem[];
	readonly missing_currencies?: readonly string[];
}

export interface VehicleTaxCalc {
	readonly result: {
		readonly year: number;
		readonly cc: number;
		readonly cc_rate: number;
		readonly car_age_years: number;
		readonly discount_rate: number;
		readonly vehicle_tax: number;
		readonly local_education_tax: number;
		readonly total: number;
	};
}

export type GeoAddrType = 'auto' | 'parcel' | 'road';
/** 좌표 하나: '경도,위도' 문자열 또는 [경도, 위도]. */
export type GeoCoordinate = string | readonly [number, number];

export interface GeoTarget {
	readonly address?: string;
	readonly pnu?: string;
	readonly x?: number;
	readonly y?: number;
	/** '경도,위도' (예: '127.025,37.504') */
	readonly point?: string;
	readonly addrType?: GeoAddrType;
	readonly includeZipcode?: boolean;
}

export type RegistryCorporateTarget = { readonly corpRegNo: string; readonly bizNo?: undefined } | { readonly bizNo: string; readonly corpRegNo?: undefined };

export interface RegistryRealestateJobOptions {
	/** 검색에 사용한 주소 또는 부동산고유번호. pin 과 둘 중 하나는 필요하다. */
	readonly query?: string;
	/** 부동산고유번호 14자리 */
	readonly pin?: string;
	/** 주소(query) 접수 때 입력 주소와 맞는 결과 중 순번(1부터), 기본 1(맨 위). 특정 대상은 pin 접수를 권장한다. */
	readonly index?: number;
	readonly usage?: 'view' | 'issue' | 'transfer-gov24' | 'transfer-court';
	readonly recordScope?: 'all' | 'part';
	readonly includeCancelled?: boolean;
	readonly publishResidentNo?: boolean;
	/** 같은 접수를 다시 보낼 때 중복 접수·과금을 막는 키 */
	readonly idempotencyKey?: string;
}

export type RegistryCorporateJobOptions = RegistryCorporateTarget & {
	readonly usage?: 'view' | 'issue';
	/** 같은 접수를 다시 보낼 때 중복 접수·과금을 막는 키 */
	readonly idempotencyKey?: string;
};

/** createRegistry*Job 이 결과를 기다리는 방식 */
export interface RegistryIssueWaitOptions {
	/** 결과를 기다리는 최대 시간(밀리초, 1,000~3,600,000), 기본 600,000(10분). 넘으면 jobId 를 담은 APICK_PDF_PREPARING 오류 */
	readonly waitTimeoutMs?: number;
	/** 결과 조회 간격(밀리초, 1,000~60,000), 기본 4,000 */
	readonly pollIntervalMs?: number;
	readonly signal?: AbortSignal;
}

export interface RegistryWaitOptions {
	/** 최대 대기 시간(밀리초, 1,000~3,600,000), 기본 600,000(10분) */
	readonly timeoutMs?: number;
	/** 결과 조회 간격(밀리초, 1,000~60,000), 기본 4,000 */
	readonly intervalMs?: number;
	/** pdf(기본) 또는 json(등기 항목을 구조화한 JSON) */
	readonly format?: 'pdf' | 'json';
	readonly signal?: AbortSignal;
}

/**
 * 등기 접수·결과 조회 결과. waiting 은 아직 처리 중(과금 없음), completed 는 완료다.
 * 완료이고 format 이 pdf 면 pdf 에 문서가, json 이면 data 에 구조화 결과가 담긴다. 실패는 ApickApiError 로 던진다.
 */
export interface RegistryJobResult {
	readonly status: 'waiting' | 'completed';
	readonly jobId: string | null;
	readonly pdf: ApickBinaryResult | null;
	readonly data: Record<string, unknown> | null;
	/** 처리 중일 때 예상 대기 시간(초) */
	readonly estimateSeconds: number | null;
	readonly meta: ApickMeta;
}

export interface GeoNeighborhoodInput extends GeoTarget {
	readonly radius?: number;
	readonly categories?: readonly string[];
	readonly limit?: number;
}

export interface LinkedinJob {
	readonly job_posting_id: string;
	readonly title: string;
	readonly company_name: string;
	readonly company_id: string;
	readonly company_url: string;
	readonly company_logo: string;
	readonly location: string;
	readonly employment_type: string;
	readonly seniority_level: string;
	readonly industries: string;
	readonly summary: string;
	readonly description_html: string;
	readonly posted_time: string;
	readonly posted_date: string;
	readonly applicants: number | null;
	readonly apply_link: string;
	readonly is_easy_apply: boolean;
	readonly base_salary: Readonly<Record<string, unknown>> | null;
	readonly salary_standards: string;
	readonly url: string;
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

export interface ReadBusinessDocumentOptions extends OcrOptions {
	/** auto(기본, 자동 판별) · business_registration(사업자등록증) · ecommerce_registration(통신판매업 신고증) · corporate_registry(법인 등기사항증명서) · seal_certificate(인감증명서) */
	readonly docType?: 'auto' | 'business_registration' | 'ecommerce_registration' | 'corporate_registry' | 'seal_certificate';
	/** true 이면 현재 사업자 상태(계속·휴업·폐업)와 과세유형을 함께 확인한다(추가 요금 없음, 등기부·인감증명서는 조회 안 함). */
	readonly checkStatus?: boolean;
	/** true 이면 판독한 전체 글자를 text 로 함께 받는다(주민등록번호 뒤 6자리는 가림). */
	readonly includeText?: boolean;
}

export interface BusinessDocumentStatus {
	/** 확인 · 미등록 · 조회 실패 · 조회 안 함(사업자등록번호 확인 필요) · 조회 안 함(사업자등록번호가 없는 서류) */
	readonly 조회결과: string;
	readonly 사업자상태: string;
	readonly 과세유형: string;
	readonly 폐업일: string;
}

/** 법인 등기사항증명서의 임원(주민등록번호·주소는 담지 않는다). */
export interface BusinessDocumentOfficer {
	readonly 직위: string;
	readonly 성명: string;
}

export interface BusinessDocument {
	readonly doc_type: '사업자등록증' | '통신판매업 신고증' | '법인 등기사항증명서' | '인감증명서';
	/** 사업자등록증일 때 개인 또는 법인 */
	readonly business_kind?: '개인' | '법인';
	/** 인감증명서일 때 개인 또는 법인 */
	readonly seal_kind?: '개인' | '법인';
	/**
	 * 항목별 값. 읽지 못한 항목은 빈 문자열이며 날짜는 YYYY-MM-DD.
	 * 등기부의 1주의금액·발행할주식의총수·발행주식의총수·자본금은 숫자, 목적은 문자열 배열, 임원은 BusinessDocumentOfficer 배열.
	 * 주민등록번호는 뒤 6자리를 가린 값(700101-1******)이다.
	 */
	readonly fields: Readonly<Record<string, string | number | readonly string[] | readonly BusinessDocumentOfficer[]>>;
	/**
	 * 사업자등록증·신고증: 사업자등록번호_형식·사업자등록번호_검증숫자,
	 * 등기부·법인 인감: 법인등록번호_형식·법인등록번호_검증숫자, 개인 인감: 주민등록번호_형식. 모두 문서종류_일치를 담는다.
	 */
	readonly checks: {
		readonly 사업자등록번호_형식?: boolean;
		readonly 사업자등록번호_검증숫자?: boolean;
		readonly 법인등록번호_형식?: boolean;
		readonly 법인등록번호_검증숫자?: boolean;
		readonly 주민등록번호_형식?: boolean;
		readonly 문서종류_일치: boolean;
	};
	/** 읽지 못한 필수 항목 이름 */
	readonly missing: readonly string[];
	readonly status?: BusinessDocumentStatus;
	readonly text?: string;
	readonly success?: number;
}

export interface FaceSimilarityOptions extends Omit<OcrOptions, 'contentType'> {
	/** 기준 사진의 형식. 비교 사진은 파일 이름·Blob 형식으로 판단한다. */
	readonly contentType?: 'image/png' | 'image/jpeg' | 'image/webp' | 'image/bmp';
	/** 같은 사람으로 판정할 기준 점수 0.2~0.8, 기본 0.4 */
	readonly threshold?: number;
}

export interface FaceSimilarityFace {
	readonly face_count: number;
	readonly face_crop: readonly [readonly [number, number], readonly [number, number]];
	readonly det_score: number;
}

export interface FaceSimilarityItem {
	readonly index: number;
	readonly face_found: boolean;
	readonly similarity: number | null;
	readonly is_match: boolean;
	readonly level: '높음' | '보통' | '낮음' | null;
	readonly face: FaceSimilarityFace | null;
}

export interface FaceSimilarity {
	/** 가장 비슷한 비교 사진의 점수 0~1 */
	readonly similarity: number;
	readonly is_match: boolean;
	/** 높음 ≥ 0.5 · 보통 0.3~0.5 · 낮음 < 0.3 */
	readonly level: '높음' | '보통' | '낮음';
	readonly threshold: number;
	/** 가장 비슷한 비교 사진 번호(1부터) */
	readonly best_index: number;
	readonly base_face: FaceSimilarityFace;
	readonly results: readonly FaceSimilarityItem[];
	readonly success?: number;
}

export interface MaskResidentNumberOptions extends OcrOptions {
	type: 1 | 2 | 3 | 4;
}

export const AUTH_PROVIDERS: readonly [
	'kakao', 'naver', 'toss', 'pass', 'samsung', 'kb', 'shinhan', 'hana', 'woori', 'ibk', 'nh', 'kakaobank', 'banksalad'
];
/** 민원서류 통합 조회에서 고를 수 있는 상품 키. */
export const GOV24_BUNDLE_PRODUCTS: readonly [
	'resident_registration', 'resident_registration_cho', 'driving_license', 'health_checkup',
	'police_penalty', 'parking_fine_target', 'mortgage_loan', 'housing_refund_balance',
	'housing_pension_balance', 'housing_loan_stage', 'mortgage_application', 'confirm_verify', 'power_bill',
	'military_service_cert', 'vehicle_register_doc', 'driver_career_cert', 'local_tax_clearance_cert'
];
/** 국민연금 통합 조회에 담긴 상품 키. 한 번의 인증으로 세 조회를 모두 받는다. */
export const NPS_BUNDLE_PRODUCTS: readonly ['nps_join_history', 'nps_deduction_cert', 'nps_career_history'];
/** 개인 국세 통합 조회에서 고를 수 있는 상품 키. */
export const HOMETAX_BUNDLE_PRODUCTS: readonly [
	'personal_income', 'cash_receipt_deduction', 'income_by_payer', 'income_data_check',
	'tax_return_history', 'tax_payment_history',
	'income_amount_cert', 'pension_credit_cert', 'fact_cert'
];
/** 사업자 국세 통합 조회에서 고를 수 있는 상품 키. */
export const HOMETAX_BIZ_BUNDLE_PRODUCTS: readonly [
	'business_sales', 'business_purchase',
	'business_registration_cert', 'vat_tax_base_cert', 'financial_statement_cert',
	'closure_cert', 'tax_clearance_cert',
	'etax_sales_list', 'etax_purchase_list', 'etax_sales_summary', 'etax_purchase_summary',
	'etax_stats', 'etax_client_list', 'etax_item_list', 'etax_status'
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
/**
 * 등록 없이 요청에 실어 보내는 공동인증서. 국세청(홈택스) 상품만 받는다.
 * 서버는 이번 인증에만 쓰고 보관하지 않는다.
 */
export interface ApickCertificate {
	/** 인증서 파일(signCert.der). Buffer·Uint8Array·ArrayBuffer 또는 base64 문자열, 64KB 이하. */
	certFile: Uint8Array | ArrayBuffer | string;
	/** 개인키 파일(signPri.key). Buffer·Uint8Array·ArrayBuffer 또는 base64 문자열, 64KB 이하. */
	keyFile: Uint8Array | ArrayBuffer | string;
	/** 인증서 비밀번호(64자 이하). */
	password: string;
	/** 법인 인증서면 corporate. 없으면 personal. */
	businessType?: 'personal' | 'corporate';
}
/** 공동인증서로 인증할 때의 입력. 휴대폰 승인이 없고 이름·생년월일·휴대전화·인증방식은 보내지 않는다. */
export interface CertificateAuthInput {
	certificate: ApickCertificate;
	name?: never;
	birthDate?: never;
	phone?: never;
	authProvider?: never;
}
/** 국세청 상품의 인증 입력. 간편인증 또는 공동인증서 중 하나. */
export type HometaxAuthInput = DataRequestInput | CertificateAuthInput;
export type RequestPersonalIncomeInput = HometaxAuthInput & { incomeYears?: number };
export interface RequestNpsJoinHistoryInput extends DataRequestInput { from?: string; to?: string; }
export interface RequestNpsDeductionCertInput extends DataRequestInput { years?: number; }
export interface RequestNpsCareerHistoryInput extends DataRequestInput { from?: string; to?: string; }
/**
 * 국민연금 증명서 발급 9종의 공통 입력. 기본은 조회값만 받고,
 * `pdf: true` 또는 `format: 'pdf' | 'both'` 이면 증명서 PDF 를 발급해 `발급.발급문서`(base64)로 받는다.
 */
export interface NpsCertificateInput extends DataRequestInput {
	/** 발급 용도. 01 개인 확인용(기본) · 02 공공기관 제출용 · 03 금융기관 제출용 · 04 기타 */
	purpose?: '01' | '02' | '03' | '04';
	/** true 이면 PDF 를 함께 발급한다. 기본 false(조회만). */
	pdf?: boolean;
	/** 응답 형식. json 조회값만(기본) · pdf PDF 만 · both 둘 다 */
	format?: 'json' | 'pdf' | 'both';
}
/** 국문·영문 발급이 되는 증명서의 언어. K 국문(기본) · E 영문 */
export interface NpsLangInput { lang?: 'K' | 'E'; }
export type RequestNpsJoinCertInput = NpsCertificateInput & NpsLangInput;
export type RequestNpsCareerCertInput = NpsCertificateInput & NpsLangInput;
export type RequestNpsLumpSumCertInput = NpsCertificateInput & NpsLangInput;
export type RequestNpsRehabilitationCertInput = NpsCertificateInput;
export type RequestNpsPensionTaxCertInput = NpsCertificateInput & { year?: string };
export type RequestNpsPensionPaymentCertInput = NpsCertificateInput & NpsLangInput;
export type RequestNpsMemberCertInput = NpsCertificateInput & { maskRrn?: boolean };
export type RequestNpsPaidCertInput = NpsCertificateInput & { workplaceNo?: string; fromYear?: string; toYear?: string };
export type RequestNpsContributionUnpaidCertInput = NpsCertificateInput;
export interface RequestDrivingLicenseInput extends DataRequestInput {}
export interface RequestHealthCheckupInput extends DataRequestInput {}
export type RequestCashReceiptDeductionInput = HometaxAuthInput & { incomeYears?: number };
export type RequestTaxReturnHistoryInput = HometaxAuthInput & { years?: number };
/** 주민등록표 발급 공통 입력. `sido`·`sigungu` 는 주민등록 주소지다. */
export interface ResidentRegistrationOptions {
	sido: string;
	sigungu: string;
	purposeCd?: string;
	submitTarget?: string;
	includeAddressHistory?: 'Y' | 'N';
	includeHousehold?: 'Y' | 'N';
}
export interface RequestResidentRegistrationInput extends DataRequestInput, ResidentRegistrationOptions {}
export interface RequestResidentRegistrationChoInput extends DataRequestInput, ResidentRegistrationOptions {}
/**
 * 민원서류 통합 조회 입력. `products` 로 조회할 상품 키를 고른다.
 * 등본·초본을 고르면 `sido`·`sigungu` 가 필요하다.
 */
export interface RequestGov24BundleInput extends DataRequestInput, Partial<Omit<VehicleRegisterDocInput, keyof DataRequestInput>> {
	products: string[] | string;
	sido?: string;
	sigungu?: string;
	purposeCd?: string;
	submitTarget?: string;
	includeAddressHistory?: 'Y' | 'N';
	includeHousehold?: 'Y' | 'N';
}
/** 국민연금 통합 조회 입력. 세 조회가 모두 실행되고 기간 입력을 함께 쓴다. */
export interface RequestNpsBundleInput extends DataRequestInput {
	from?: string;
	to?: string;
	years?: number;
}
/** 개인 국세 통합 조회 입력. `products` 로 조회할 상품 키를 고른다. */
export type RequestHometaxBundleInput = HometaxAuthInput & RequestHometaxBundleOptions;
export interface RequestHometaxBundleOptions {
	products: string[] | string;
	incomeYears?: number;
	years?: number;
	year?: string;
	use_purpose?: string;
	submit_to?: string;
	delivery?: string;
	format?: 'pdf' | 'json' | 'both';
	amount_open_yn?: 'Y' | 'N';
	income_source_open_yn?: 'Y' | 'N';
	withholding_all_print_yn?: 'Y' | 'N';
	address_open_yn?: 'Y' | 'N';
	resno_open_yn?: 'Y' | 'N';
	quantity?: number;
	email?: string;
	fax_no?: string;
	wallet_address?: string;
	start_month?: string;
	end_month?: string;
	itrf_cd?: string;
	issuance?: string;
	engl_yn?: 'Y' | 'N';
}
/**
 * 사업자 국세 통합 조회 입력. 사업자 조회라 대표자 본인 확인이 필요하다.
 * `bind_id` 가 없으면 `agreed` 를 true 로 보내야 한다.
 */
export type RequestHometaxBizBundleInput = HometaxAuthInput & RequestHometaxBizBundleOptions;
export interface RequestHometaxBizBundleOptions {
	products: string[] | string;
	business_no?: string;
	businessNo?: string;
	businessYear?: string;
	businessMonths?: number;
	year?: string;
	period?: string;
	cert_type?: string;
	engl_yn?: 'Y' | 'N';
	use_purpose?: string;
	submit_to?: string;
	delivery?: string;
	format?: 'pdf' | 'json' | 'both';
	quantity?: number;
	email?: string;
	fax_no?: string;
	wallet_address?: string;
	start_month?: string;
	end_month?: string;
	itrf_cd?: string;
	issuance?: string;
	from?: string;
	to?: string;
	keyword?: string;
	approval_nos?: string;
	bind_id?: string;
	agreed?: boolean;
}
/** 고용·산재보험 사업장별 보험료 부담 조회 입력. 사업자관리번호가 필요하다. */
export interface RequestEmploymentInsuranceBurdenInput extends DataRequestInput {
	bizRegNo: string;
	insuranceYear?: string;
	rounding?: 'Y' | 'N';
	repRrno?: string;
}
/** 광주 상수도 요금 조회 입력. 민원접수번호가 필요하다. */
export interface RequestGwangjuWaterBillInput extends DataRequestInput { receiptNo: string; }
/** 자격증 진위확인 입력. 자격증번호가 필요하다. */
export interface RequestTechCertVerifyInput extends DataRequestInput { certNo: string; instCd?: string; }
/** 4대보험 사업장 가입 현황 조회 입력. 통합납부번호가 필요하다. */
export interface RequestSocialInsuranceWorkplaceInput extends DataRequestInput { unifiedNo: string; }
/** 건보료 납부 현황 조회 입력. 조회 기간(YYYYMM)을 선택할 수 있다. */
export interface RequestNhisPremiumStatusInput extends DataRequestInput { se?: string; fromYm?: string; toYm?: string; }
/** 7년 무사고 운전 경력 확인 입력. */
export interface RequestAccidentFree7yInput extends DataRequestInput {}
/** 프랜차이즈 총매출 조회 입력. 사업자등록번호 10자리가 필요하다. */
export interface RequestFranchiseSalesTotalInput extends DataRequestInput { bizNo: string; year?: string; }
/** 기업 총구매액 조회 입력. 사업자등록번호 10자리가 필요하다. */
export interface RequestBizPurchaseTotalInput extends DataRequestInput { bizNo: string; year?: string; }
/** 소비자 총사용액 조회 입력. */
export interface RequestConsumerUsageTotalInput extends DataRequestInput { year?: string; }
/** 기준급여 이력 조회 입력. 사업장명·대표자명·대표자 주민등록번호 13자리가 필요하다. */
export interface RequestStandardPayHistoryInput extends DataRequestInput {
	insrncSe?: string;
	workplaceName: string;
	ownerName: string;
	ownerRrno: string;
	insuranceYear?: string;
}
/** 여권 발급 상태 조회 입력. 통합접수번호가 필요하다. */
export interface RequestPassportStatusInput extends DataRequestInput { unityRcptNo: string; }
/** 여권 발급 이력 조회 입력. */
export interface RequestPassportHistoryInput extends DataRequestInput {}

/**
 * 세무 민원증명 발급 조건. 신청인 본인명의 발급이고 발급 1건 60P 정액이다.
 * `format` 은 응답 형식이고, `json`·`both` 이면 발급된 PDF를 파싱한 `PDF데이터` 가 함께 온다.
 * 코드 값(`use_purpose`·`submit_to`·`itrf_cd`)은 정부 공통코드다.
 */
export interface HometaxCertificateOptions {
	year?: string;
	use_purpose?: string;
	submit_to?: string;
	delivery?: '06' | '10' | '04' | '12';
	format?: 'pdf' | 'json' | 'both';
	engl_yn?: 'Y' | 'N';
	quantity?: number;
	email?: string;
	fax_no?: string;
	wallet_address?: string;
}
export type RequestIncomeAmountCertInput = HometaxAuthInput & HometaxCertificateOptions;
export type RequestPensionCreditCertInput = HometaxAuthInput & PensionCreditCertOptions;
export interface PensionCreditCertOptions extends HometaxCertificateOptions {
	address_open_yn?: 'Y' | 'N';
	resno_open_yn?: 'Y' | 'N';
}
export type RequestFactCertInput = HometaxAuthInput & FactCertOptions;
export interface FactCertOptions extends HometaxCertificateOptions {
	start_month?: string;
	end_month?: string;
	itrf_cd?: string;
	issuance?: '1' | '2';
}
/** 소득 증빙서류 통합발급 입력. `year`·`use_purpose`·`submit_to`·`delivery` 가 필수다. */
export type RequestIncomeCertBundleInput = HometaxAuthInput & IncomeCertBundleOptions;
export interface IncomeCertBundleOptions extends HometaxCertificateOptions {
	year: string;
	use_purpose: string;
	submit_to: string;
	delivery: '06' | '10' | '04' | '12';
	amount_open_yn?: 'Y' | 'N';
	income_source_open_yn?: 'Y' | 'N';
	withholding_all_print_yn?: 'Y' | 'N';
	address_open_yn?: 'Y' | 'N';
	resno_open_yn?: 'Y' | 'N';
}
/**
 * 사업자 증빙서류 통합발급 입력. `business_no` 와 발급 입력이 필수이고,
 * `bind_id` 가 없으면 대표자 본인 확인 동의 `agreed: true` 가 있어야 접수된다.
 */
export type RequestBusinessCertBundleInput = HometaxAuthInput & BusinessCertBundleOptions;
export interface BusinessCertBundleOptions extends HometaxCertificateOptions {
	business_no: string;
	year: string;
	use_purpose: string;
	submit_to: string;
	delivery: '06' | '10' | '04' | '12';
	period?: '1' | '2' | 'all';
	agreed?: boolean;
	bind_id?: string;
}
export type RequestTaxClearanceCertInput = HometaxAuthInput & TaxClearanceCertOptions;
export interface TaxClearanceCertOptions extends FactCertOptions {
	cert_type?: 'B0006' | 'B0010';
}
/** 발급 PDF를 열어 글자를 뽑고 라벨 기준으로 만든 값. 필드는 비어 있을 수 있다. */
export interface HometaxPdfData {
	사용가능: boolean;
	페이지수: number;
	필드: Record<string, string | number>;
	텍스트: string;
	사유?: string;
}
/** 세무 민원증명 결과. `format` 이 json·both 이면 `발급문서`(base64)와 `PDF데이터` 가 함께 온다. */
export interface HometaxCertificateResultPayload {
	문서확인번호: string;
	귀속연도?: string;
	소득금액?: string;
	응답형식?: 'pdf' | 'json' | 'both';
	발급문서?: string;
	문서파일명?: string;
	문서해시?: string;
	문서크기?: number;
	PDF데이터?: HometaxPdfData;
	[key: string]: unknown;
}

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
export interface VehicleRegisterDocInput extends DataRequestInput {
	carNumber: string;
	privacy?: string;
	scope?: string;
	ownerName?: string;
	ownerRrno?: string;
	admdstCd?: string;
}
export interface VehicleRegisterContent {
	추출상태: '추출됨' | '텍스트없음' | '추출실패';
	본문: string;
	차대번호?: string;
	자동차등록번호?: string;
	제원관리번호?: string;
	말소등록일?: string;
	차명?: string;
	차종?: string;
	원동기형식?: string;
	용도?: string;
	'연식(모델연도)'?: string;
	색상?: string;
}
export interface VehicleRegisterDocResult {
	문서내용?: VehicleRegisterContent;
	발급문서?: string;
	문서확인번호?: string;
	발급일자?: string;
	성명?: string;
	차량번호?: string;
	문서파일명?: string;
	문서해시?: string;
	문서크기?: number;
	조회결과?: string;
}
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

/** 국민연금 증명서 발급 결과의 공통 "발급" 절. PDF 를 요청했을 때만 온다. */
export interface NpsCertificateIssued {
	발급번호: string;
	발급용도: string;
	PDF: '발급됨' | '발급하지 못함';
	/** format 이 pdf·both 이고 발급됐을 때만 온다. */
	문서파일명?: string;
	/** PDF 원본의 base64. format 이 pdf·both 이고 발급됐을 때만 온다. */
	발급문서?: string;
	/** 발급하지 못했을 때의 오류 코드 */
	발급오류?: string;
}
/** 증명서별 조회값(개발가이드 응답 표 참고)과 선택적 발급 절. */
export type NpsCertificateInfo = Record<string, unknown> & { 발급?: NpsCertificateIssued };
export interface NpsJoinCertResultPayload { npsJoinCert: NpsCertificateInfo; }
export interface NpsCareerCertResultPayload { npsCareerCert: NpsCertificateInfo; }
export interface NpsLumpSumCertResultPayload { npsLumpSumCert: NpsCertificateInfo; }
export interface NpsRehabilitationCertResultPayload { npsRehabilitationCert: NpsCertificateInfo; }
export interface NpsPensionTaxCertResultPayload { npsPensionTaxCert: NpsCertificateInfo; }
export interface NpsPensionPaymentCertResultPayload { npsPensionPaymentCert: NpsCertificateInfo; }
export interface NpsMemberCertResultPayload { npsMemberCert: NpsCertificateInfo; }
export interface NpsPaidCertResultPayload { npsPaidCert: NpsCertificateInfo; }
export interface NpsContributionUnpaidCertResultPayload { npsContributionUnpaidCert: NpsCertificateInfo; }

export interface NpsDeductionCertYearEntry {
	발급연도: string; 사업장가입자고지금액: number; 지역가입자등납부금액: number;
	사업장가입자소급금액: number; 추납보험료납부금액: number; 실업크레딧납부금액: number; 총합계: number;
}
export interface NpsDeductionCertInfo {
	조회기간: { 시작: string; 끝: string };
	신청인: string;
	생년월일: string;
	연도별내역: NpsDeductionCertYearEntry[];
}
export interface NpsDeductionCertResultPayload { npsDeductionCert: NpsDeductionCertInfo; }

export interface NpsCareerHistoryEntry {
	사업장: string; 시작: string; 종료: string;
	기준소득월액: number; 납부개월: number; 미납개월: number; 납부금액: number;
}
export interface NpsCareerHistoryOtherEntry {
	시작: string; 종료: string; 가입자구분: string; 납부개월: number; 납부금액: number;
}
export interface NpsCareerHistoryInfo {
	조회기간: { 시작: string; 끝: string };
	합계: { 사업장수: number; 경력건수: number; 사업장납부개월: number; 사업장납부금액: number; 사업장외납부개월: number };
	경력: NpsCareerHistoryEntry[];
	사업장외가입: NpsCareerHistoryOtherEntry[];
}
export interface NpsCareerHistoryResultPayload { npsCareerHistory: NpsCareerHistoryInfo; }

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

/** 주민등록표 등본·초본 발급 결과. `발급문서` 는 PDF 원본의 base64 다. */
export interface ResidentRegistrationInfo {
	문서확인번호: string;
	발급일자: string;
	성명: string;
	발급문서: string;
	문서파일명: string;
	문서해시?: string;
	문서크기?: number;
	조회결과?: string;
}
export interface ResidentRegistrationResultPayload { residentRegistration: ResidentRegistrationInfo; }
export interface ResidentRegistrationChoResultPayload { residentRegistrationCho: ResidentRegistrationInfo; }
/** 통합 조회는 고른 상품의 섹션만 담는다. 섹션 키는 상품 키의 camelCase 다. */
/** 소득 증빙서류 통합발급 결과. 증명마다 섹션이 따로 오며 일부만 발급되면 status 가 PARTIAL_SUCCESS 다. */
export type IncomeCertBundleResultPayload = Record<string, unknown> & {
	incomeAmountCert?: HometaxCertificateResultPayload;
	pensionCreditCert?: HometaxCertificateResultPayload;
};
/** 사업자 증빙서류 통합발급 결과. 성공 응답에 다음 조회에 쓸 `bind_id` 가 함께 올 수 있다. */
export type BusinessCertBundleResultPayload = Record<string, unknown> & {
	businessRegistrationCert?: HometaxCertificateResultPayload;
	vatTaxBaseCert?: HometaxCertificateResultPayload;
	financialStatementCert?: HometaxCertificateResultPayload;
};
export type Gov24BundleResultPayload = Record<string, unknown> & {
	vehicleRegisterDoc?: VehicleRegisterDocResult;
	residentRegistration?: ResidentRegistrationInfo;
	residentRegistrationCho?: ResidentRegistrationInfo;
};
/** 국민연금 통합 조회 결과. 세 조회가 섹션으로 함께 온다. */
export type NpsBundleResultPayload = Record<string, unknown> & {
	npsJoinHistory?: Record<string, unknown>;
	npsDeductionCert?: Record<string, unknown>;
	npsCareerHistory?: Record<string, unknown>;
};
/** 개인 국세 통합 조회 결과. 접수 때 고른 상품의 섹션만 온다. */
export type HometaxBundleResultPayload = Record<string, unknown>;
/** 사업자 국세 통합 조회 결과. 접수 때 고른 상품의 섹션만 온다. */
export type HometaxBizBundleResultPayload = Record<string, unknown>;

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
export interface YoutubeComment {
	id: string; parent_id: string | null; text: string; author: string | null; author_channel_id: string | null; author_url: string | null; author_thumbnail: string | null;
	author_is_uploader: boolean; author_is_verified: boolean; like_count: number | null; is_pinned: boolean; is_hearted: boolean; published_at: string | null;
}
export interface YoutubeComments { video_id: string; title: string | null; sort: 'top' | 'new'; include_replies: boolean; count: number; comments: YoutubeComment[]; }
export interface YoutubeCommentsOptions { count?: number; sort?: 'top' | 'new'; replies?: boolean; }
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
	/** 등기 열람·발급: 접수된 작업 번호. 대기 시간 초과·실패 때 담긴다. */
	readonly jobId?: string;
	/** 등기 발급 실패: 이번 결과 조회에서 환급한 포인트(0이면 환급 없음 — 이미 환급했거나 24시간이 지났거나 결제가 나간 경우) */
	readonly refunded?: number;
	/** 등기 발급 실패: 접수 후 환급을 받을 수 있는 시간(시간 단위, 24) */
	readonly refundWindowHours?: number;
	/** 등기 점검(serviceCode REGISTRY_MAINTENANCE): 점검 시간. window 예: '11월 19일(목) 21:00 ~ 11월 20일(금) 06:00', startAt·endAt 은 ISO 시각 */
	readonly maintenance?: { readonly window: string; readonly startAt: string | null; readonly endAt: string | null };
	/** 다시 시도하기까지 기다릴 초(Retry-After). 등기 점검이면 점검 종료까지 남은 초 */
	readonly retryAfter?: number;
	toJSON(): {
		name: string;
		message: string;
		status: number;
		code: string;
		serviceCode?: string;
		jobId?: string;
		refunded?: number;
		maintenance?: { window: string; startAt: string | null; endAt: string | null };
		retryAfter?: number;
	};
}

export class ApickBinaryResult {
	readonly bytes: Uint8Array;
	readonly contentType: string;
	readonly filename: string;
	readonly meta: ApickMeta;
	/** 등기 PDF 발급 응답의 X-Apick-Job-Id. 다른 바이너리 결과에는 없습니다. */
	readonly jobId?: string;
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

/** Brand, model name, model year and trim — all optional. With no `model` the call returns the brand/model list and is free. */
export interface VehicleModelInfoOptions {
	maker?: string;
	/** 차명과 등급·연식·좌석을 함께 입력할 수 있습니다. Free text, e.g. PANAMERA GTS 19년. */
	model?: string;
	/** 2자리 또는 4자리 연식. Two or four digits; must agree with the year in model. */
	modelYear?: string;
	trim?: string;
}

/** Vehicle catalog filters — all optional. Leave everything empty to page through every vehicle. */
export interface VehicleCatalogOptions {
	/** 제조사(브랜드). Brand, e.g. 현대, Tesla. */
	maker?: string;
	/** 차명. Model name; if no exact match, models containing this text are returned with a notice. */
	model?: string;
	/** 연식(2026·26·26년식). Model year. */
	modelYear?: string;
	/** 등급. Trim. */
	trim?: string;
	/** true 이면 타이어 규격이 있는 차량만. Only vehicles with tire sizes. */
	tireOnly?: boolean;
	/** 1~10,000, 기본 1,000. Default 1,000, max 10,000. */
	limit?: number;
	/** 응답의 다음오프셋을 넣어 이어 조회. Pass the previous response's 다음오프셋. */
	offset?: number;
}

export interface VehicleCatalogItem {
	제조사: string;
	차명: string;
	연식: number | null;
	등급: string | null;
	항목수: number;
	타이어있음: boolean;
	전륜타이어?: string;
	후륜타이어?: string;
	휠크기?: string;
}

export interface VehicleCatalogData {
	차량목록: VehicleCatalogItem[];
	총건수: number;
	다음오프셋?: number;
	안내?: string;
}

export class ApickClient {
	createVideoJob(model: VideoModel, prompt: string, options?: VideoJobOptions): Promise<ApickResult<VideoJobData>>;
	getVideoJob(model: VideoModel, jobId: string): Promise<ApickResult<VideoJobData>>;
	downloadVideoResult(model: VideoModel, jobId: string): Promise<ApickBinaryResult>;
	constructor(apiKeyOrOptions: string | ApickClientOptions);
	businessDetails(businessNumber: string): Promise<ApickResult>;
	ventureBusiness(businessNumber: string): Promise<ApickResult>;
	/** 통신판매업 신고 이력 전부(건당 10P, 결제 이력 필요, 이력 0건은 차감 없음). */
	ecommerceRegistration(businessNumber: string): Promise<ApickResult<EcommerceRegistration>>;
	trackParcel(carrier: string, trackingNumber: string): Promise<ApickResult>;
	trackParcelAuto(trackingNumber: string): Promise<ApickResult>;
	validateEmail(email: string): Promise<ApickResult>;
	validatePhone(number: string): Promise<ApickResult>;
	holidays(year: number | string, month: number | string): Promise<ApickResult>;
	searchAddress(query: string, options?: { page?: number }): Promise<ApickResult>;
	/** Look up Korean-market vehicle specifications. Values use fixed standard notation (fuel, drive type, transmission, body type, efficiency grade; multiple values joined with `+`). */
	vehicleModelInfo(options?: VehicleModelInfoOptions): Promise<ApickResult>;
	/** 차량목록 조회(건당 10P, 최대 10,000건). Flat vehicle list by brand/model/year/trim; 10 points per call, charged even when empty (input and server errors are free). */
	vehicleCatalog(options?: VehicleCatalogOptions): Promise<ApickResult<VehicleCatalogData>>;
	ocr(image: string | BinaryInput | ArrayBuffer | ArrayBufferView, options?: OcrOptions): Promise<ApickResult>;
	/** Read a Korean business registration or e-commerce registration certificate field by field. No charge when nothing is read. */
	readBusinessDocument(image: string | BinaryInput | ArrayBuffer | ArrayBufferView, options?: ReadBusinessDocumentOptions): Promise<ApickResult<BusinessDocument>>;
	/** Compare the main face in `image` with one or up to 10 other images. No charge when no face is found. */
	faceSimilarity(image: string | BinaryInput | ArrayBuffer | ArrayBufferView, compareImages: string | BinaryInput | ArrayBuffer | ArrayBufferView | ReadonlyArray<string | BinaryInput | ArrayBuffer | ArrayBufferView>, options?: FaceSimilarityOptions): Promise<ApickResult<FaceSimilarity>>;
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
	/** @deprecated 2026-11-12 종료된 상품입니다. 호출하면 과금 없이 HTTP 410(`PRODUCT_RETIRED`)을 받습니다. 다음 메이저 버전에서 제거됩니다. Retired on 2026-11-12; calls return HTTP 410 (`PRODUCT_RETIRED`) without charge and the method will be removed in the next major version. */
	tiktokProfile(usernameOrUrl: string): Promise<ApickResult<TiktokProfile>>;
	amazonProduct(urlOrAsin: string): Promise<ApickResult<AmazonProduct>>;
	xProfile(usernameOrUrl: string): Promise<ApickResult<XProfile>>;
	xPost(url: string): Promise<ApickResult<XPost>>;
	coupangProduct(urlOrProductId: string): Promise<ApickResult<CoupangProduct>>;
	/** @deprecated 2026-11-12 종료된 상품입니다. 호출하면 과금 없이 HTTP 410(`PRODUCT_RETIRED`)을 받습니다. 다음 메이저 버전에서 제거됩니다. Retired on 2026-11-12; calls return HTTP 410 (`PRODUCT_RETIRED`) without charge and the method will be removed in the next major version. */
	naverShoppingProduct(url: string): Promise<ApickResult<NaverShoppingProduct>>;
	/** @deprecated 2026-11-12 종료된 상품입니다. 호출하면 과금 없이 HTTP 410(`PRODUCT_RETIRED`)을 받습니다. 다음 메이저 버전에서 제거됩니다. Retired on 2026-11-12; calls return HTTP 410 (`PRODUCT_RETIRED`) without charge and the method will be removed in the next major version. */
	linkedinProfile(url: string): Promise<ApickResult<LinkedinProfile>>;
	linkedinCompany(url: string): Promise<ApickResult<LinkedinCompany>>;
	linkedinJob(url: string): Promise<ApickResult<LinkedinJob>>;
	courtAuction(caseNo: string, court: string): Promise<ApickResult<CourtAuction>>;
	registryDocVerify(issueNo: string, options?: { readonly kind?: 'realestate' | 'corporate' | 'movable' }): Promise<ApickResult<RegistryDocVerify>>;
	bidNotice(options: BidQueryOptions): Promise<ApickResult<BidNotice>>;
	bidAward(options: BidQueryOptions): Promise<ApickResult<BidAward>>;
	rtmsTrade(lawdCd: string, dealYmd: string, options?: RtmsQueryOptions): Promise<ApickResult<RtmsTrade>>;
	rtmsRent(lawdCd: string, dealYmd: string, options?: RtmsQueryOptions): Promise<ApickResult<RtmsRent>>;
	corpFinance(crno: string, options?: CorpFinanceOptions): Promise<ApickResult<CorpFinance>>;
	dartDisclosure(options?: DartDisclosureOptions): Promise<ApickResult>;
	dartCompany(corpCode: string): Promise<ApickResult>;
	dartFinancials(corpCode: string, bsnsYear: string, options?: DartFinancialsOptions): Promise<ApickResult>;
	buildingRegister(options: BuildingRegisterOptions): Promise<ApickResult>;
	appReviews(appId: string | number, options?: { readonly country?: string; readonly page?: number }): Promise<ApickResult>;
	vehicleEmission(certNo: string): Promise<ApickResult>;
	exchangeRate(options?: ExchangeRateOptions): Promise<ApickResult<ExchangeRate>>;
	vehicleRecall(input: { readonly carNo: string; readonly vin?: undefined } | { readonly vin: string; readonly carNo?: undefined }): Promise<ApickResult<VehicleRecall>>;
	hipassUnpaid(carNo: string): Promise<ApickResult<HipassUnpaid>>;
	vehicleTaxCalc(cc: number, options?: { readonly carAgeYears?: number; readonly year?: number }): Promise<ApickResult<VehicleTaxCalc>>;
	geoStandardize(input: string | GeoTarget): Promise<ApickResult>;
	geoBatchGeocode(addresses: readonly string[], options?: { readonly addrType?: GeoAddrType; readonly dedupe?: boolean }): Promise<ApickResult>;
	geoReverse(input: { readonly x: number; readonly y: number } | { readonly point: string }): Promise<ApickResult>;
	geoAddressSearch(query: string, options?: { readonly category?: GeoAddrType; readonly page?: number; readonly size?: number }): Promise<ApickResult>;
	geoPlaceSearch(query: string, options?: { readonly origin?: string; readonly x?: number; readonly y?: number; readonly radius?: number; readonly sort?: 'distance' | 'relevance'; readonly page?: number; readonly size?: number }): Promise<ApickResult>;
	geoAdminCode(input: string | GeoTarget): Promise<ApickResult>;
	geoCompareAddress(addressA: string, addressB: string, options?: { readonly addrType?: GeoAddrType }): Promise<ApickResult>;
	geoMeasure(coordinates: readonly GeoCoordinate[], options?: { readonly mode?: 'path' | 'polygon'; readonly unit?: 'm' | 'km'; readonly matrix?: boolean }): Promise<ApickResult>;
	geoGeojsonAnalyze(geojson: Readonly<Record<string, unknown>> | string, options?: { readonly simplify?: number; readonly point?: string; readonly x?: number; readonly y?: number; readonly includeGeometry?: boolean }): Promise<ApickResult>;
	geoAddressQuality(addresses: readonly string[], options?: { readonly addrType?: GeoAddrType }): Promise<ApickResult>;
	geoAddressAutocomplete(query: string, options?: { readonly category?: GeoAddrType; readonly size?: number }): Promise<ApickResult>;
	geoDistrictBoundary(query: string | number, options?: { readonly level?: 'L1' | 'L2' | 'L3' | 'L4'; readonly simplify?: number; readonly includeGeometry?: boolean }): Promise<ApickResult>;
	geoNeighborhood(input: string | GeoNeighborhoodInput): Promise<ApickResult>;
	registryRealestateSearch(query: string): Promise<ApickResult>;
	registryCorporateSearch(input: RegistryCorporateTarget): Promise<ApickResult>;
	/** 접수 후 완료될 때까지 결과 조회를 반복해 PDF 를 돌려준다(jobId 포함). 실패면 jobId·refunded 를 담은 ApickApiError. */
	createRegistryRealestateJob(options: RegistryRealestateJobOptions & RegistryIssueWaitOptions): Promise<ApickBinaryResult>;
	createRegistryCorporateJob(options: RegistryCorporateJobOptions & RegistryIssueWaitOptions): Promise<ApickBinaryResult>;
	/** 접수만 한다. 접수 때 열람·발급 금액이 차감되며 jobId 를 돌려준다. */
	submitRegistryRealestateJob(options: RegistryRealestateJobOptions): Promise<RegistryJobResult>;
	submitRegistryCorporateJob(options: RegistryCorporateJobOptions): Promise<RegistryJobResult>;
	/** 결과 조회 1회(POST /rest/registry_jobs/:job_id/download). 대기 중 0P, 완료 첫 조회 0P, 재조회 30P. 실패면 이때 환급한다(접수 후 24시간 이내). */
	getRegistryResult(jobId: string, options?: { readonly format?: 'pdf' | 'json' }): Promise<RegistryJobResult>;
	/** 완료·실패까지 결과 조회를 반복한다. */
	waitRegistryResult(jobId: string, options?: RegistryWaitOptions): Promise<RegistryJobResult>;
	screenshot(url: string): Promise<ApickBinaryResult>;
	youtubeMetadata(url: string): Promise<ApickResult<YoutubeMetadata>>;
	youtubeThumbnail(url: string): Promise<ApickBinaryResult>;
	youtubeSubtitleList(url: string): Promise<ApickResult<YoutubeSubtitleList>>;
	youtubeSubtitle(url: string, lang: string, options?: YoutubeSubtitleOptions): Promise<ApickBinaryResult>;
	youtubeSearch(query: string, options?: YoutubeSearchOptions): Promise<ApickResult<YoutubeSearchResult>>;
	youtubeChannel(channel: string, options?: { tab?: 'videos' | 'shorts' | 'streams' | 'playlists'; count?: number }): Promise<ApickResult<YoutubeChannelResult>>;
	youtubePlaylist(url: string, options?: { count?: number }): Promise<ApickResult<YoutubePlaylistResult>>;
	youtubeHashtag(hashtag: string, options?: { count?: number }): Promise<ApickResult<YoutubeHashtagResult>>;
	youtubeComments(url: string, options?: YoutubeCommentsOptions): Promise<ApickResult<YoutubeComments>>;
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
	/** 서식 자동작성 — 계약서·증명서·신고서 200종을 PDF·DOCX·HWPX·RTF·HTML·MD·TXT·JSON·XLSX 로 만든다. */
	documentCreate(options: DocumentCreateInput): Promise<ApickResult<SavedDocument>>;
	documentList(options?: Record<string, never>): Promise<ApickResult<{ documents: Array<Pick<SavedDocument, 'document_id' | 'title' | 'form' | 'version' | 'updated_at' | 'expires_at'>> }>>;
	documentGet(options: DocumentReference): Promise<ApickResult<SavedDocument>>;
	documentUpdate(options: DocumentUpdateInput): Promise<ApickResult<SavedDocument>>;
	documentDelete(options: DocumentReference): Promise<ApickResult<{ deleted: boolean }>>;
	documentAiWrite(options: DocumentAiInput): Promise<ApickResult<DocumentAiResult>>;
	documentQuote(options: DocumentVersion): Promise<ApickResult<DocumentQuote>>;
	documentDownload(options: DocumentDownloadInput): Promise<ApickBinaryResult>;
	/** 서식 자동작성 — 계약서·증명서·신고서 200종을 PDF·DOCX·HWPX·RTF·HTML·MD·TXT·JSON·XLSX 로 만든다. */
	documentQuota(options?: Record<string, never>): Promise<ApickResult<Record<string, unknown>>>;
	documentTemplate(options: { form: string; edition?: string }): Promise<ApickResult<DocumentBody>>;
	documentTemplates(options?: { query?: string }): Promise<ApickResult<Record<string, unknown>>>;
	/** 작성 보조. `history`에 같은 대화의 앞선 말을 넣으면 이미 말한 값을 다시 묻지 않는다. 열린 서식과 다른 서식을 이름으로 요청하면 `switch: true` 응답으로 전환 여부를 먼저 묻고 차감하지 않는다. */
	documentAssist(options: { text: string; document?: DocumentBody; selection?: string; history?: DocumentAssistTurn[]; request_id: string }): Promise<ApickResult<Record<string, unknown>>>;
	documentReview(options: { document: DocumentBody; request_id: string }): Promise<ApickResult<Record<string, unknown>>>;
	documentAttachmentList(options: DocumentReference): Promise<ApickResult<Record<string, unknown>>>;
	documentAttachmentAdd(options: DocumentReference & { name: string; base64: string; request_id: string }): Promise<ApickResult<Record<string, unknown>>>;
	documentAttachmentRemove(options: DocumentReference & { attachment_id: string }): Promise<ApickResult<Record<string, unknown>>>;
	documentDownloadBundle(options: DocumentDownloadInput): Promise<ApickBinaryResult>;
	documentDownloadPdf(options: DocumentDownloadInput): Promise<ApickBinaryResult>;
	documentWorkflowQuote(options?: { action?: 'attachment_review'; document_id?: string; version?: number }): Promise<ApickResult<DocumentWorkflowQuote>>;
	documentWorkflowStart(options: DocumentWorkflowInput): Promise<ApickResult<DocumentWorkflowJob>>;
	documentWorkflowGet(options: DocumentJobReference): Promise<ApickResult<DocumentWorkflowJob>>;
	documentWorkflowAnswer(options: DocumentJobReference & DocumentWorkflowAnswerInput): Promise<ApickResult<DocumentWorkflowJob>>;
	documentWorkflowApply(options: DocumentJobReference & { request_id: string }): Promise<ApickResult<SavedDocument>>;
	documentWorkflowCancel(options: DocumentJobReference): Promise<ApickResult<DocumentWorkflowJob>>;
	documentVerify(options: DocumentVersion): Promise<ApickResult<DocumentVerification>>;
	documentFinalize(options: DocumentVersion & { verification_hash: string }): Promise<ApickResult<DocumentVerification>>;
	formDocument(form: string, options?: { text?: string; data?: Record<string, unknown>; format?: 'pdf' | 'docx' | 'hwpx' | 'rtf' | 'html' | 'md' | 'txt' | 'json' | 'xlsx'; signature_image?: string; stamp_image?: string }): Promise<ApickBinaryResult>;
	/** 서식 묶음 — 최대 10건을 한 번에 만들어 ZIP 하나로 받는다(성공한 건만 합계 과금). */
	formBundle(forms: Array<{ form: string; text?: string; data?: Record<string, unknown>; format?: 'pdf' | 'docx' | 'hwpx' | 'rtf' | 'html' | 'md' | 'txt' | 'json' | 'xlsx'; signature_image?: string; stamp_image?: string }>): Promise<ApickBinaryResult>;
	/** 무료 — 만들 수 있는 서식 목록(키·이름·분류·필드 수)을 돌려준다. */
	formList(options?: { category?: string; keyword?: string }): Promise<ApickResult>;
	/** 무료 — 서식 1종의 입력 항목(키·라벨·형식·필수 여부·예시)을 돌려준다. */
	formFields(form: string): Promise<ApickResult>;
	/** 무료 — 문서를 만들지 않고 인식 결과와 비어 있는 필수 항목만 돌려준다. */
	formPreview(form: string, options?: { text?: string; data?: Record<string, unknown> }): Promise<ApickResult>;
	/** AI 채우기 — 상황 설명(최대 3,000자)에서 서식 항목 값만 골라 돌려준다. data 로 준 값은 바꾸지 않고, 글에 없는 사실은 빈칸으로 둔다. */
	formAiFill(form: string, text: string, options?: { data?: Record<string, unknown> }): Promise<ApickResult<{ form: string; values: Record<string, string>; ai_filled: string[]; notes: string; missing: Array<{ key: string; label: string; type: string }>; filled: number; total: number }>>;
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
	requestNpsDeductionCert(input: RequestNpsDeductionCertInput): Promise<ApickResult<DataRequestAcceptedData>>;
	getNpsDeductionCert(transactionId: string): Promise<ApickResult<DataRequestResult<NpsDeductionCertResultPayload>>>;
	requestNpsCareerHistory(input: RequestNpsCareerHistoryInput): Promise<ApickResult<DataRequestAcceptedData>>;
	getNpsCareerHistory(transactionId: string): Promise<ApickResult<DataRequestResult<NpsCareerHistoryResultPayload>>>;
	requestNpsJoinCert(input: RequestNpsJoinCertInput): Promise<ApickResult<DataRequestAcceptedData>>;
	getNpsJoinCert(transactionId: string): Promise<ApickResult<DataRequestResult<NpsJoinCertResultPayload>>>;
	requestNpsCareerCert(input: RequestNpsCareerCertInput): Promise<ApickResult<DataRequestAcceptedData>>;
	getNpsCareerCert(transactionId: string): Promise<ApickResult<DataRequestResult<NpsCareerCertResultPayload>>>;
	requestNpsLumpSumCert(input: RequestNpsLumpSumCertInput): Promise<ApickResult<DataRequestAcceptedData>>;
	getNpsLumpSumCert(transactionId: string): Promise<ApickResult<DataRequestResult<NpsLumpSumCertResultPayload>>>;
	requestNpsRehabilitationCert(input: RequestNpsRehabilitationCertInput): Promise<ApickResult<DataRequestAcceptedData>>;
	getNpsRehabilitationCert(transactionId: string): Promise<ApickResult<DataRequestResult<NpsRehabilitationCertResultPayload>>>;
	requestNpsPensionTaxCert(input: RequestNpsPensionTaxCertInput): Promise<ApickResult<DataRequestAcceptedData>>;
	getNpsPensionTaxCert(transactionId: string): Promise<ApickResult<DataRequestResult<NpsPensionTaxCertResultPayload>>>;
	requestNpsPensionPaymentCert(input: RequestNpsPensionPaymentCertInput): Promise<ApickResult<DataRequestAcceptedData>>;
	getNpsPensionPaymentCert(transactionId: string): Promise<ApickResult<DataRequestResult<NpsPensionPaymentCertResultPayload>>>;
	requestNpsMemberCert(input: RequestNpsMemberCertInput): Promise<ApickResult<DataRequestAcceptedData>>;
	getNpsMemberCert(transactionId: string): Promise<ApickResult<DataRequestResult<NpsMemberCertResultPayload>>>;
	requestNpsPaidCert(input: RequestNpsPaidCertInput): Promise<ApickResult<DataRequestAcceptedData>>;
	getNpsPaidCert(transactionId: string): Promise<ApickResult<DataRequestResult<NpsPaidCertResultPayload>>>;
	requestNpsContributionUnpaidCert(input: RequestNpsContributionUnpaidCertInput): Promise<ApickResult<DataRequestAcceptedData>>;
	getNpsContributionUnpaidCert(transactionId: string): Promise<ApickResult<DataRequestResult<NpsContributionUnpaidCertResultPayload>>>;
	requestDrivingLicense(input: RequestDrivingLicenseInput): Promise<ApickResult<DataRequestAcceptedData>>;
	getDrivingLicense(transactionId: string): Promise<ApickResult<DataRequestResult<DrivingLicenseResultPayload>>>;
	requestHealthCheckup(input: RequestHealthCheckupInput): Promise<ApickResult<DataRequestAcceptedData>>;
	getHealthCheckup(transactionId: string): Promise<ApickResult<DataRequestResult<HealthCheckupResultPayload>>>;
	requestCashReceiptDeduction(input: RequestCashReceiptDeductionInput): Promise<ApickResult<DataRequestAcceptedData>>;
	getCashReceiptDeduction(transactionId: string): Promise<ApickResult<DataRequestResult<CashReceiptDeductionResultPayload>>>;
	requestTaxReturnHistory(input: RequestTaxReturnHistoryInput): Promise<ApickResult<DataRequestAcceptedData>>;
	getTaxReturnHistory(transactionId: string): Promise<ApickResult<DataRequestResult<TaxReturnHistoryResultPayload>>>;
	requestIncomeAmountCert(input: RequestIncomeAmountCertInput): Promise<ApickResult<DataRequestAcceptedData>>;
	getIncomeAmountCert(transactionId: string): Promise<ApickResult<DataRequestResult<HometaxCertificateResultPayload>>>;
	requestPensionCreditCert(input: RequestPensionCreditCertInput): Promise<ApickResult<DataRequestAcceptedData>>;
	getPensionCreditCert(transactionId: string): Promise<ApickResult<DataRequestResult<HometaxCertificateResultPayload>>>;
	requestFactCert(input: RequestFactCertInput): Promise<ApickResult<DataRequestAcceptedData>>;
	getFactCert(transactionId: string): Promise<ApickResult<DataRequestResult<HometaxCertificateResultPayload>>>;
	requestTaxClearanceCert(input: RequestTaxClearanceCertInput): Promise<ApickResult<DataRequestAcceptedData>>;
	getTaxClearanceCert(transactionId: string): Promise<ApickResult<DataRequestResult<HometaxCertificateResultPayload>>>;
	requestIncomeCertBundle(input: RequestIncomeCertBundleInput): Promise<ApickResult<DataRequestAcceptedData>>;
	getIncomeCertBundle(transactionId: string): Promise<ApickResult<DataRequestResult<IncomeCertBundleResultPayload>>>;
	requestBusinessCertBundle(input: RequestBusinessCertBundleInput): Promise<ApickResult<DataRequestAcceptedData>>;
	getBusinessCertBundle(transactionId: string): Promise<ApickResult<DataRequestResult<BusinessCertBundleResultPayload>>>;
	requestResidentRegistration(input: RequestResidentRegistrationInput): Promise<ApickResult<DataRequestAcceptedData>>;
	getResidentRegistration(transactionId: string): Promise<ApickResult<DataRequestResult<ResidentRegistrationResultPayload>>>;
	requestResidentRegistrationCho(input: RequestResidentRegistrationChoInput): Promise<ApickResult<DataRequestAcceptedData>>;
	getResidentRegistrationCho(transactionId: string): Promise<ApickResult<DataRequestResult<ResidentRegistrationChoResultPayload>>>;
	requestGov24Bundle(input: RequestGov24BundleInput): Promise<ApickResult<DataRequestAcceptedData>>;
	requestVehicleRegisterDoc(input: VehicleRegisterDocInput): Promise<ApickResult<DataRequestAcceptedData>>;
	getVehicleRegisterDoc(transactionId: string): Promise<ApickResult<DataRequestResult<{ vehicleRegisterDoc: VehicleRegisterDocResult }>>>;
	getGov24Bundle(transactionId: string): Promise<ApickResult<DataRequestResult<Gov24BundleResultPayload>>>;
	requestNpsBundle(input: RequestNpsBundleInput): Promise<ApickResult<DataRequestAcceptedData>>;
	getNpsBundle(transactionId: string): Promise<ApickResult<DataRequestResult<NpsBundleResultPayload>>>;
	requestHometaxBundle(input: RequestHometaxBundleInput): Promise<ApickResult<DataRequestAcceptedData>>;
	getHometaxBundle(transactionId: string): Promise<ApickResult<DataRequestResult<HometaxBundleResultPayload>>>;
	requestHometaxBizBundle(input: RequestHometaxBizBundleInput): Promise<ApickResult<DataRequestAcceptedData>>;
	getHometaxBizBundle(transactionId: string): Promise<ApickResult<DataRequestResult<HometaxBizBundleResultPayload>>>;
	requestEmploymentInsuranceBurden(input: RequestEmploymentInsuranceBurdenInput): Promise<ApickResult<DataRequestAcceptedData>>;
	getEmploymentInsuranceBurden(transactionId: string): Promise<ApickResult<DataRequestResult<Record<string, unknown>>>>;
	requestGwangjuWaterBill(input: RequestGwangjuWaterBillInput): Promise<ApickResult<DataRequestAcceptedData>>;
	getGwangjuWaterBill(transactionId: string): Promise<ApickResult<DataRequestResult<Record<string, unknown>>>>;
	requestTechCertVerify(input: RequestTechCertVerifyInput): Promise<ApickResult<DataRequestAcceptedData>>;
	getTechCertVerify(transactionId: string): Promise<ApickResult<DataRequestResult<Record<string, unknown>>>>;
	requestSocialInsuranceWorkplace(input: RequestSocialInsuranceWorkplaceInput): Promise<ApickResult<DataRequestAcceptedData>>;
	getSocialInsuranceWorkplace(transactionId: string): Promise<ApickResult<DataRequestResult<Record<string, unknown>>>>;
	requestNhisPremiumStatus(input: RequestNhisPremiumStatusInput): Promise<ApickResult<DataRequestAcceptedData>>;
	getNhisPremiumStatus(transactionId: string): Promise<ApickResult<DataRequestResult<Record<string, unknown>>>>;
	requestAccidentFree7y(input: RequestAccidentFree7yInput): Promise<ApickResult<DataRequestAcceptedData>>;
	getAccidentFree7y(transactionId: string): Promise<ApickResult<DataRequestResult<Record<string, unknown>>>>;
	requestFranchiseSalesTotal(input: RequestFranchiseSalesTotalInput): Promise<ApickResult<DataRequestAcceptedData>>;
	getFranchiseSalesTotal(transactionId: string): Promise<ApickResult<DataRequestResult<Record<string, unknown>>>>;
	requestBizPurchaseTotal(input: RequestBizPurchaseTotalInput): Promise<ApickResult<DataRequestAcceptedData>>;
	getBizPurchaseTotal(transactionId: string): Promise<ApickResult<DataRequestResult<Record<string, unknown>>>>;
	requestConsumerUsageTotal(input: RequestConsumerUsageTotalInput): Promise<ApickResult<DataRequestAcceptedData>>;
	getConsumerUsageTotal(transactionId: string): Promise<ApickResult<DataRequestResult<Record<string, unknown>>>>;
	requestStandardPayHistory(input: RequestStandardPayHistoryInput): Promise<ApickResult<DataRequestAcceptedData>>;
	getStandardPayHistory(transactionId: string): Promise<ApickResult<DataRequestResult<Record<string, unknown>>>>;
	requestPassportStatus(input: RequestPassportStatusInput): Promise<ApickResult<DataRequestAcceptedData>>;
	getPassportStatus(transactionId: string): Promise<ApickResult<DataRequestResult<Record<string, unknown>>>>;
	requestPassportHistory(input: RequestPassportHistoryInput): Promise<ApickResult<DataRequestAcceptedData>>;
	getPassportHistory(transactionId: string): Promise<ApickResult<DataRequestResult<Record<string, unknown>>>>;
	/** @deprecated REQEO로 이전. 네트워크 요청 없이 SKILLS_MOVED(410)를 반환합니다. */

	searchSkills(options?: SkillSearchOptions): Promise<ApickResult<SkillPage<SkillSummary>>>;
	/** Public measured results and methods; model scores are not accuracy guarantees. */
	/** @deprecated REQEO로 이전. 네트워크 요청 없이 SKILLS_MOVED(410)를 반환합니다. */

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
	/** @deprecated REQEO로 이전. 네트워크 요청 없이 SKILLS_MOVED(410)를 반환합니다. */

	getSkill(skillId: string): Promise<ApickResult<SkillDetail>>;
	/** @deprecated REQEO로 이전. 네트워크 요청 없이 SKILLS_MOVED(410)를 반환합니다. */

	quoteSkill(skillId: string, input: Record<string, unknown>, options?: { version?: string }): Promise<ApickResult<SkillQuote>>;
	runSkill<T = Record<string, unknown>>(skillId: string, input: Record<string, unknown>, options: SkillRunOptions): Promise<ApickResult<SkillRun<T>>>;
	getSkillRun<T = Record<string, unknown>>(runId: string): Promise<ApickResult<SkillRun<T>>>;
	getSkillRunResult<T = Record<string, unknown>>(runId: string): Promise<ApickResult<SkillRunResult<T>>>;
	/** 본인 실행의 결과 파일을 인증해 내려받습니다. / Download an artifact owned by this API key. */
	/** @deprecated REQEO로 이전. 네트워크 요청 없이 SKILLS_MOVED(410)를 반환합니다. */

	getSkillArtifact(runId: string, fileId: string): Promise<ApickBinaryResult>;
	/** @deprecated REQEO로 이전. 네트워크 요청 없이 SKILLS_MOVED(410)를 반환합니다. */

	cancelSkillRun(runId: string): Promise<ApickResult<SkillRun>>;
	/** @deprecated REQEO로 이전. 네트워크 요청 없이 SKILLS_MOVED(410)를 반환합니다. */

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
	| 'SKILLS_MOVED'
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
	billing?: {installation_points:number;base_points:number;complete_cache_points:number;quota:null};
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


