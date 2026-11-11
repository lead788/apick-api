import ApickClient, {
  ApickApiError,
  ApickBinaryResult,
  ApickResult,
  DocumentAssistTurn,
  SERVICES,
  TTS_VOICE_IDS
} from '../src/index.js';
import type { TtsJobData, TtsVoiceId } from '../src/index.js';
import type { ImageAiJobData, ImageAiResultData, ImageAiPendingData } from '../src/index.js';

const client = new ApickClient('test-key');
async function vehicleRegisterVin(transactionId: string): Promise<string | undefined> {
  const result = await client.getVehicleRegisterDoc(transactionId);
  return result.data.result?.vehicleRegisterDoc.문서내용?.차대번호;
}
void vehicleRegisterVin;

const business: Promise<ApickResult> = client.businessDetails('4398700761');
const ocr: Promise<ApickResult> = client.ocr(new Uint8Array([1, 2, 3]), {
  filename: 'scan.png',
  contentType: 'image/png'
});
const maskedResidentNumber: Promise<ApickBinaryResult> = client.maskResidentNumber(new Uint8Array([1, 2, 3]), { type: 3, filename: 'id.png', contentType: 'image/png' });
const maskedIdCard: Promise<ApickResult> = client.maskIdCard(new Uint8Array([1, 2, 3]), { filename: 'id.png', contentType: 'image/png' });
const pdf: Promise<ApickBinaryResult> = client.htmlToPdf('<h1>Report</h1>');
const registryJobId: Promise<string | undefined> = client.createRegistryRealestateJob({ query: '서울특별시 가상구 가상로 1' }).then(result => result.jobId);
const corporateRegistryJobId: Promise<string | undefined> = client.createRegistryCorporateJob({ bizNo: '1234567890' }).then(result => result.jobId);
const ttsJob: Promise<ApickResult<TtsJobData>> = client.createTtsJob('오늘의 이야기를 시작합니다.', { voiceId: 'Kore' });
const newTtsJob: Promise<ApickResult<TtsJobData>> = client.createOpenAiTtsJob({text:'새 목소리입니다.', voice_id:'alloy',emotion:'calm',tone:'documentary',pace:0.9,pitch:1,volume_gain_db:-1});
client.createGeminiTtsJob({utterances:[{speaker:'진행',text:'안녕하세요.'},{speaker:'손님',text:'반갑습니다.'}],speakers:{진행:{voice_id:'Kore',style:'또렷하게'},손님:{voice_id:'Charon'}},multi_speaker:true});
client.getTtsOptions();
client.listOpenAiTtsVoices();
const ttsSubtitles: Promise<ApickBinaryResult> = client.downloadTtsSubtitles('a'.repeat(32));
const voiceId: TtsVoiceId = TTS_VOICE_IDS[13];
const endpoint: string = SERVICES.businessDetails.endpoint;
const generated: Promise<ApickResult<ImageAiResultData | ImageAiPendingData>> = client.generateImages('product', { imageCount: 2, outputFormat: 'webp' });
const referenced: Promise<ApickResult<ImageAiResultData | ImageAiPendingData>> = client.generateImages('keep composition', { referenceImage: new Uint8Array([1]), referenceFilename: 'reference.png', referenceContentType: 'image/png' });
const imageJob: Promise<ApickResult<ImageAiJobData>> = client.createImageGenerationJob('covers', { imageCount: 20 });
const imageFile: Promise<ApickBinaryResult> = client.downloadImageJobImage('a'.repeat(32), 0);
let error!: ApickApiError;

void business;
void ocr;
void maskedResidentNumber;
void maskedIdCard;
void pdf;
void registryJobId;
void corporateRegistryJobId;
void ttsJob;
void newTtsJob;
void ttsSubtitles;
void voiceId;
void endpoint;
void generated;
void referenced;
void imageJob;
void imageFile;
void error;

import type { VideoJobData, VideoJobOptions } from "../src/index.js";
const videoOptions: VideoJobOptions = { version:"1.6", tier:"std", audio:false, duration:5 };
const videoJob: Promise<ApickResult<VideoJobData>> = client.createVideoJob("kling", "a boat", videoOptions);
const videoStatus: Promise<ApickResult<VideoJobData>> = client.getVideoJob("kling", "a".repeat(32));
const videoResult: Promise<ApickBinaryResult> = client.downloadVideoResult("kling", "a".repeat(32));
void videoJob; void videoStatus; void videoResult;
// @ts-expect-error 지원하지 않는 제품
client.createVideoJob("other", "a boat");

import type {
  AuthProvider, DataRequestAcceptedData, DataRequestResult,
  EmploymentResultPayload, PersonalIncomeResultPayload, NpsJoinHistoryResultPayload,
  NpsDeductionCertResultPayload, NpsCareerHistoryResultPayload,
  DrivingLicenseResultPayload, HealthCheckupResultPayload,
  CashReceiptDeductionResultPayload, TaxReturnHistoryResultPayload,
  YoutubeMetadata, YoutubeSubtitleList
} from "../src/index.js";
const provider: AuthProvider = "kakao";
const employmentRequest: Promise<ApickResult<DataRequestAcceptedData>> = client.requestEmployment({
  name: "홍길동", birthDate: "19900101", phone: "01011112222", authProvider: provider, insuranceYears: 3
});
const employmentResult: Promise<ApickResult<DataRequestResult<EmploymentResultPayload>>> = client.getEmployment("a".repeat(32));
const incomeRequest: Promise<ApickResult<DataRequestAcceptedData>> = client.requestPersonalIncome({
  name: "홍길동", birthDate: "19900101", phone: "01011112222", authProvider: "naver", incomeYears: 5
});
const incomeResult: Promise<ApickResult<DataRequestResult<PersonalIncomeResultPayload>>> = client.getPersonalIncome("a".repeat(32));
// 국세청 상품은 간편인증 대신 공동인증서를 실어 보낼 수 있다.
const certIncomeRequest: Promise<ApickResult<DataRequestAcceptedData>> = client.requestPersonalIncome({
  certificate: { certFile: new Uint8Array([1]), keyFile: "AQ==", password: "secret" }, incomeYears: 2
});
const certBizBundleRequest: Promise<ApickResult<DataRequestAcceptedData>> = client.requestHometaxBizBundle({
  certificate: { certFile: "AQ==", keyFile: "AQ==", password: "secret", businessType: "corporate" },
  products: ["business_sales"], business_no: "1234567890", agreed: true
});
// @ts-expect-error 공동인증서와 간편인증 입력을 함께 보낼 수 없다.
client.requestIncomeAmountCert({ certificate: { certFile: "AQ==", keyFile: "AQ==", password: "x" }, name: "홍길동", year: "2025" });
// @ts-expect-error 국세청 밖 상품은 공동인증서를 받지 않는다.
client.requestEmployment({ certificate: { certFile: "AQ==", keyFile: "AQ==", password: "x" } });
const npsRequest: Promise<ApickResult<DataRequestAcceptedData>> = client.requestNpsJoinHistory({
  name: "홍길동", birthDate: "19900101", phone: "01011112222", authProvider: "toss", from: "1988-01", to: "2026-09"
});
const npsResult: Promise<ApickResult<DataRequestResult<NpsJoinHistoryResultPayload>>> = client.getNpsJoinHistory("a".repeat(32));
const npsCertRequest: Promise<ApickResult<DataRequestAcceptedData>> = client.requestNpsDeductionCert({
  name: "홍길동", birthDate: "19900101", phone: "01011112222", authProvider: "toss", years: 5
});
const npsCertResult: Promise<ApickResult<DataRequestResult<NpsDeductionCertResultPayload>>> = client.getNpsDeductionCert("a".repeat(32));
const npsCareerRequest: Promise<ApickResult<DataRequestAcceptedData>> = client.requestNpsCareerHistory({
  name: "홍길동", birthDate: "19900101", phone: "01011112222", authProvider: "toss", from: "1988-01", to: "2026-09"
});
const npsCareerResult: Promise<ApickResult<DataRequestResult<NpsCareerHistoryResultPayload>>> = client.getNpsCareerHistory("a".repeat(32));
const licenseRequest: Promise<ApickResult<DataRequestAcceptedData>> = client.requestDrivingLicense({
  name: "홍길동", birthDate: "19900101", phone: "01011112222", authProvider: "pass"
});
const licenseResult: Promise<ApickResult<DataRequestResult<DrivingLicenseResultPayload>>> = client.getDrivingLicense("a".repeat(32));
const checkupRequest: Promise<ApickResult<DataRequestAcceptedData>> = client.requestHealthCheckup({
  name: "홍길동", birthDate: "19900101", phone: "01011112222", authProvider: "kb"
});
const checkupResult: Promise<ApickResult<DataRequestResult<HealthCheckupResultPayload>>> = client.getHealthCheckup("a".repeat(32));
void employmentRequest; void employmentResult; void incomeRequest; void incomeResult;
void npsRequest; void npsResult; void licenseRequest; void licenseResult; void checkupRequest; void checkupResult;
const receiptRequest: Promise<ApickResult<DataRequestAcceptedData>> = client.requestCashReceiptDeduction({
  name: "홍길동", birthDate: "19900101", phone: "01011112222", authProvider: "kakao", incomeYears: 3
});
const receiptResult: Promise<ApickResult<DataRequestResult<CashReceiptDeductionResultPayload>>> = client.getCashReceiptDeduction("a".repeat(32));
const taxRequest: Promise<ApickResult<DataRequestAcceptedData>> = client.requestTaxReturnHistory({
  name: "홍길동", birthDate: "19900101", phone: "01011112222", authProvider: "toss", years: 10
});
const taxResult: Promise<ApickResult<DataRequestResult<TaxReturnHistoryResultPayload>>> = client.getTaxReturnHistory("a".repeat(32));
const youtubeMeta: Promise<ApickResult<YoutubeMetadata>> = client.youtubeMetadata("dQw4w9WgXcQ");
const rank = client.googleRankCheck("주소 검색 API", "apick.app").then((result) => (result.data.complete ? result.data.rank : result.data.unchecked_ranks.length));
const places = client.googleMapsSearch("강남역 카페").then((result) => result.data.items[0]?.latitude);
const igProfile = client.instagramProfile("natgeo").then((result) => result.data.followers);
const igPost = client.instagramPost("https://www.instagram.com/p/DeHufcWDCjf/").then((result) => result.data.likes);
const ttProfile = client.tiktokProfile("https://www.tiktok.com/@tiktok").then((result) => result.data.recent_videos.length);
const news = client.googleNewsSearch("반도체", { page: 2 }).then((result) => result.data.items[0]?.source);
const shopping = client.googleShoppingSearch("무선 이어폰").then((result) => result.data.items[0]?.price);
void rank; void places; void igProfile; void igPost; void ttProfile; void news; void shopping;
const amazon = client.amazonProduct("B0BDHWDR12").then((result) => result.data.price);
const xp = client.xProfile("NASA").then((result) => result.data.recent_posts[0]?.likes);
const xpost = client.xPost("https://x.com/NASA/status/1").then((result) => result.data.views);
void amazon; void xp; void xpost;
const coupang = client.coupangProduct("https://www.coupang.com/vp/products/7812020679").then((result) => result.data.final_price);
const naverProduct = client.naverShoppingProduct("https://brand.naver.com/pulmuonebynature/products/4995061380").then((result) => result.data.sellers[0]?.final_price);
const linkedinMe = client.linkedinProfile("https://www.linkedin.com/in/example/").then((result) => result.data.experience[0]?.company);
const linkedinCo = client.linkedinCompany("https://www.linkedin.com/company/example/").then((result) => result.data.employees_on_linkedin);
const linkedinJob = client.linkedinJob("https://www.linkedin.com/jobs/view/4001234567/").then((result) => result.data.applicants);
void coupang; void naverProduct; void linkedinMe; void linkedinCo; void linkedinJob;
const youtubeTracks: Promise<ApickResult<YoutubeSubtitleList>> = client.youtubeSubtitleList("dQw4w9WgXcQ");
const youtubeThumb: Promise<ApickBinaryResult> = client.youtubeThumbnail("dQw4w9WgXcQ");
const youtubeText: Promise<ApickBinaryResult> = client.youtubeSubtitle("dQw4w9WgXcQ", "en", { format: "srt", type: "auto" });
void receiptRequest; void receiptResult; void taxRequest; void taxResult;
void youtubeMeta; void youtubeTracks; void youtubeThumb; void youtubeText;
const ytSearch = client.youtubeSearch("파이썬 강좌", { count: 5, sort: "views", uploadDate: "week", type: "video" }).then((result) => result.data.results[0]?.type);
const ytChannel = client.youtubeChannel("@jocoding", { tab: "shorts", count: 10 }).then((result) => result.data.channel.follower_count);
const ytPlaylist = client.youtubePlaylist("PLRqwX-V7Uu6ZiZxtDDRCi6uhfTH4FilpH").then((result) => result.data.videos.length);
const ytHashtag = client.youtubeHashtag("kpop").then((result) => result.data.videos[0]?.id);
const ytComments = client.youtubeComments("dQw4w9WgXcQ", { count: 50, sort: "new", replies: true }).then((result) => result.data.comments[0]?.like_count);
void ytSearch; void ytChannel; void ytPlaylist; void ytHashtag; void ytComments;
// @ts-expect-error 지원하지 않는 검색 정렬
client.youtubeSearch("a", { sort: "random" });
// @ts-expect-error 지원하지 않는 자막 형식
client.youtubeSubtitle("dQw4w9WgXcQ", "en", { format: "ass" });
// @ts-expect-error 지원하지 않는 간편인증 방식
client.requestDrivingLicense({ name: "홍길동", birthDate: "19900101", phone: "01011112222", authProvider: "payco" });

import type { SkillDetail, SkillPage, SkillQuote, SkillRun, SkillRunResult, SkillSummary } from '../src/index.js';
const skillPage: Promise<ApickResult<SkillPage<SkillSummary>>> = client.searchSkills({ query: "상품명", category: "marketing", limit: 5 });
const skillDetail: Promise<ApickResult<SkillDetail>> = client.getSkill("sk_example");
const skillQuote: Promise<ApickResult<SkillQuote>> = client.quoteSkill("sk_example", { product_name: "우산" });
skillQuote.then(quote => { const range: number[] = [quote.data.price_points, quote.data.estimated_points, quote.data.max_points]; const varies: boolean = quote.data.usage_priced; return [range, varies]; });
skillPage.then(page => page.data.items.map(item => item.usage_priced ? item.estimated_points : item.price_points));
const skillRun: Promise<ApickResult<SkillRun<{ passed: boolean }>>> = client.runSkill<{ passed: boolean }>("sk_example", { product_name: "우산" }, { idempotencyKey: "order-0001", maxCostPoints: 50 });
const skillRunRead: Promise<ApickResult<SkillRun>> = client.getSkillRun("run_example");
const skillRunResult: Promise<ApickResult<SkillRunResult>> = client.getSkillRunResult("run_example");
const skillArtifact: Promise<ApickBinaryResult> = client.getSkillArtifact("run_example", "art_" + "a".repeat(24));
skillQuote.then(quote => {
  const info = quote.data.execution_info;
  if (info) {
    const bounds: number[] = [info.price_range.min_points, info.price_range.max_points, info.duration.min_seconds, info.duration.max_seconds];
    const calls: Array<number | string> = info.tools.map(tool => tool.typical_calls);
    return [bounds, calls];
  }
});
void skillArtifact;
const skillCancel: Promise<ApickResult<SkillRun>> = client.cancelSkillRun("run_example");
const skillUsage: Promise<ApickResult<SkillPage<SkillRun>>> = client.skillUsage({ limit: 20 });
import type { SkillSort } from '../src/index.js';
const skillSorted: Promise<ApickResult<SkillPage<SkillSummary>>> = client.searchSkills({ sort: "popular", limit: 5 });
skillSorted.then(page => page.data.items.map(item => { const label: string = item.usage_label; const rating: number | null = item.rating_average; return [label, rating, item.like_count + item.review_count]; }));
const skillSort: SkillSort = "recommended";
// @ts-expect-error 지원하지 않는 순서는 타입에서 거른다
client.searchSkills({ sort: "bogus" });
void skillSorted; void skillSort;
void skillPage; void skillDetail; void skillQuote; void skillRun; void skillRunRead; void skillRunResult; void skillCancel; void skillUsage;
// @ts-expect-error 실행에는 idempotencyKey 가 필요하다
client.runSkill("sk_example", { product_name: "우산" }, { maxCostPoints: 50 });
// @ts-expect-error 지원하지 않는 분류
client.searchSkills({ category: "unknown" });

const premiumImage = client.generateImages("제품 사진", { quality: "premium", imageCount: 1 });
void premiumImage;
// @ts-expect-error 공개 품질은 basic·advanced·premium 뿐이다
client.generateImages("제품 사진", { quality: "high" });

const documentDraft = client.documentCreate({ request_id: 'request-id-123456', title: '문서', content: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: '본문' }] }] } });
const documentList = client.documentList();
const documentResult = client.documentGet({ document_id: 'document-id-12345' });
const documentUpdate = client.documentUpdate({ document_id: 'document-id-12345', version: 1, title: '수정', request_id: 'request-id-123456' });
const documentProposal = client.documentAiWrite({ action: 'draft', text: '주간 보고', request_id: 'request-id-123456' });
const documentQuote = client.documentQuote({ document_id: 'document-id-12345', version: 1 });
const documentFile: Promise<ApickBinaryResult> = client.documentDownload({ document_id: 'document-id-12345', version: 1, content_hash: 'a'.repeat(64), request_id: 'request-id-123456' });
const documentRemoved = client.documentDelete({ document_id: 'document-id-12345' });

client.documentWorkflowStart({text:'문서 작성',max_points:20,total_max_points:100,request_id:'workflow-request-1'}).then(r=>{const remaining: number | undefined=r.data.remaining_points;void remaining;});
client.documentWorkflowQuote({action:'attachment_review',document_id:'document-id-0001',version:1});
client.documentFinalize({document_id:'document-id-0001',version:1,verification_hash:'hash'});
client.documentDownloadPdf({document_id:'document-id-0001',version:1,content_hash:'hash',request_id:'download-id-001'});
client.documentTemplate({form:'labor_contract_standard',edition:'labor-open-20250307'});
client.documentWorkflowAnswer({job_id:'workflow-id-001',text:'추가 답변',max_points:20,request_id:'answer-request-1'});
// @ts-expect-error 첨부 대조는 신규 접수에서만 가능하다.
client.documentWorkflowAnswer({job_id:'workflow-id-001',text:'추가 답변',action:'attachment_review',max_points:20,request_id:'answer-request-2'});
// @ts-expect-error 추가 답변은 본문이 필수다.
client.documentWorkflowAnswer({job_id:'workflow-id-001',max_points:20,request_id:'answer-request-3'});

// documentAssist history
const assistTurns: DocumentAssistTurn[] = [{ role: 'user', text: '공급자는 에이픽입니다' }];
void assistTurns;

// exchangeRate
client.exchangeRate({ month: '202609', currency: ['USD', 'JPY'] }).then(r => { const unit: number | undefined = r.data.rates[0]?.unit; void unit; });
client.exchangeRate();
// @ts-expect-error currency 는 문자열 또는 문자열 배열이다.
client.exchangeRate({ currency: 840 });
