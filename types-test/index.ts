import ApickClient, {
  ApickApiError,
  ApickBinaryResult,
  ApickResult,
  SERVICES,
  TTS_VOICE_IDS
} from '../src/index.js';
import type { TtsJobData, TtsVoiceId } from '../src/index.js';
import type { ImageAiJobData, ImageAiResultData } from '../src/index.js';

const client = new ApickClient('test-key');

const business: Promise<ApickResult> = client.businessDetails('4398700761');
const ocr: Promise<ApickResult> = client.ocr(new Uint8Array([1, 2, 3]), {
  filename: 'scan.png',
  contentType: 'image/png'
});
const maskedResidentNumber: Promise<ApickBinaryResult> = client.maskResidentNumber(new Uint8Array([1, 2, 3]), { type: 3, filename: 'id.png', contentType: 'image/png' });
const maskedIdCard: Promise<ApickResult> = client.maskIdCard(new Uint8Array([1, 2, 3]), { filename: 'id.png', contentType: 'image/png' });
const pdf: Promise<ApickBinaryResult> = client.htmlToPdf('<h1>Report</h1>');
const ttsJob: Promise<ApickResult<TtsJobData>> = client.createTtsJob('오늘의 이야기를 시작합니다.', { voiceId: 'v2_ann_m_30s_01' });
const newTtsJob: Promise<ApickResult<TtsJobData>> = client.createTtsJob('새 목소리입니다.', { voiceId: 'v2_f_teen_01' });
const ttsSubtitles: Promise<ApickBinaryResult> = client.downloadTtsSubtitles('a'.repeat(32));
const voiceId: TtsVoiceId = TTS_VOICE_IDS[15];
const endpoint: string = SERVICES.businessDetails.endpoint;
const generated: Promise<ApickResult<ImageAiResultData>> = client.generateImages('product', { imageCount: 2, outputFormat: 'webp' });
const referenced: Promise<ApickResult<ImageAiResultData>> = client.generateImages('keep composition', { referenceImage: new Uint8Array([1]), referenceFilename: 'reference.png', referenceContentType: 'image/png' });
const imageJob: Promise<ApickResult<ImageAiJobData>> = client.createImageGenerationJob('covers', { imageCount: 20 });
const imageFile: Promise<ApickBinaryResult> = client.downloadImageJobImage('a'.repeat(32), 0);
let error!: ApickApiError;

void business;
void ocr;
void maskedResidentNumber;
void maskedIdCard;
void pdf;
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
const npsRequest: Promise<ApickResult<DataRequestAcceptedData>> = client.requestNpsJoinHistory({
  name: "홍길동", birthDate: "19900101", phone: "01011112222", authProvider: "toss", from: "1988-01", to: "2026-09"
});
const npsResult: Promise<ApickResult<DataRequestResult<NpsJoinHistoryResultPayload>>> = client.getNpsJoinHistory("a".repeat(32));
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
const youtubeTracks: Promise<ApickResult<YoutubeSubtitleList>> = client.youtubeSubtitleList("dQw4w9WgXcQ");
const youtubeThumb: Promise<ApickBinaryResult> = client.youtubeThumbnail("dQw4w9WgXcQ");
const youtubeText: Promise<ApickBinaryResult> = client.youtubeSubtitle("dQw4w9WgXcQ", "en", { format: "srt", type: "auto" });
void receiptRequest; void receiptResult; void taxRequest; void taxResult;
void youtubeMeta; void youtubeTracks; void youtubeThumb; void youtubeText;
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
const skillCancel: Promise<ApickResult<SkillRun>> = client.cancelSkillRun("run_example");
const skillUsage: Promise<ApickResult<SkillPage<SkillRun>>> = client.skillUsage({ limit: 20 });
void skillPage; void skillDetail; void skillQuote; void skillRun; void skillRunRead; void skillRunResult; void skillCancel; void skillUsage;
// @ts-expect-error 실행에는 idempotencyKey 가 필요하다
client.runSkill("sk_example", { product_name: "우산" }, { maxCostPoints: 50 });
// @ts-expect-error 지원하지 않는 분류
client.searchSkills({ category: "unknown" });
