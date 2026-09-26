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
  DrivingLicenseResultPayload, HealthCheckupResultPayload
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
// @ts-expect-error 지원하지 않는 간편인증 방식
client.requestDrivingLicense({ name: "홍길동", birthDate: "19900101", phone: "01011112222", authProvider: "payco" });
