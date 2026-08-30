import ApickClient, {
  ApickApiError,
  ApickBinaryResult,
  ApickResult,
  SERVICES
} from '../src/index.js';
import type { TtsJobData } from '../src/index.js';

const client = new ApickClient('test-key');

const business: Promise<ApickResult> = client.businessDetails('4398700761');
const ocr: Promise<ApickResult> = client.ocr(new Uint8Array([1, 2, 3]), {
  filename: 'scan.png',
  contentType: 'image/png'
});
const maskedResidentNumber: Promise<ApickBinaryResult> = client.maskResidentNumber(new Uint8Array([1, 2, 3]), { type: 3, filename: 'id.png', contentType: 'image/png' });
const maskedIdCard: Promise<ApickResult> = client.maskIdCard(new Uint8Array([1, 2, 3]), { filename: 'id.png', contentType: 'image/png' });
const pdf: Promise<ApickBinaryResult> = client.htmlToPdf('<h1>Report</h1>');
const ttsJob: Promise<ApickResult<TtsJobData>> = client.createTtsJob('오늘의 이야기를 시작합니다.', { voiceId: 'narrator_m_03' });
const endpoint: string = SERVICES.businessDetails.endpoint;
let error!: ApickApiError;

void business;
void ocr;
void maskedResidentNumber;
void maskedIdCard;
void pdf;
void ttsJob;
void endpoint;
void error;
