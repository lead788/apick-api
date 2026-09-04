<div align="center">

# APICK API for Node.js

**에이픽 데이터·AI·이미지 API를 API 키 하나로 호출하는 공식 Node.js SDK**

**Official zero-dependency Node.js SDK for APICK data, AI, and image APIs**

[![npm](https://img.shields.io/npm/v/apick-api?color=%230a7cff&label=npm%20apick-api)](https://www.npmjs.com/package/apick-api)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/license-MIT-green)](LICENSE)

[한국어 가이드](docs/guide.ko.md) · [English guide](docs/guide.en.md) · [APICK](https://apick.app) · [API 문서](https://apick.app/dev_guide)

</div>

## 빠른 시작 / Quick start

```bash
npm install apick-api
```

ES modules:

```js
import { ApickClient } from 'apick-api';

const apick = new ApickClient(process.env.APICK_API_KEY);
const { data, meta } = await apick.businessDetails('439-87-00761');

console.log(data);
console.log(`사용 포인트: ${meta.cost}`);
```

CommonJS:

```js
const { ApickClient } = require('apick-api');

const apick = new ApickClient(process.env.APICK_API_KEY);
const result = await apick.trackParcelAuto('123456789012');
console.log(result.data);
```

인증키는 [apick.app](https://apick.app) 가입 후 마이페이지에서 발급할 수 있습니다.
Get an API key from your account page after signing up at [apick.app](https://apick.app).

마이페이지의 허용 IP가 공란이면 제한 없이 호출할 수 있습니다. 제한하려면 APICK에 도착하는 공인 IPv4를 단일 주소 또는 CIDR(`/32` 등)로 등록하세요. 저장 즉시 반영되며 별도 동기화는 필요하지 않습니다.
Leave the allowed-IP list blank for unrestricted access. To restrict access, register the public IPv4 address seen by APICK as an exact address or CIDR such as `/32`. Changes apply immediately with no separate synchronization.

## 제공 서비스 / Included services

| Method | APICK service | Result |
| --- | --- | --- |
| `businessDetails(businessNumber)` | 사업자 정보 조회 / Business details | JSON |
| `ventureBusiness(businessNumber)` | 벤처기업 정보 / Venture business data | JSON |
| `trackParcel(carrier, trackingNumber)` | 택배 배송조회 / Parcel tracking | JSON |
| `trackParcelAuto(trackingNumber)` | 택배사 자동판별 배송조회 / Auto carrier tracking | JSON |
| `validateEmail(email)` | 이메일 유효성 / Email validation | JSON |
| `validatePhone(number)` | 전화번호 유효성 / Phone validation | JSON |
| `holidays(year, month)` | 대한민국 공휴일 / Korean holidays | JSON |
| `searchAddress(query, options)` | 도로명주소 검색 / Road address search | JSON |
| `ocr(image, options)` | 이미지 OCR / Image OCR | JSON |
| `dnsLookup(domain)` | DNS 조회 / DNS lookup | JSON |
| `geolocate(address)` | 도메인·IP 위치 / Domain and IP location | JSON |
| `whois(address)` | WHOIS 조회 / WHOIS lookup | JSON |
| `googleSearch(keyword, options)` | 웹 검색 / Web search | JSON |
| `googleImageSearch(keyword, options)` | 이미지 검색 / Image search | JSON |
| `screenshot(url)` | 웹페이지 화면캡처 / Web screenshot | Binary |
| `createTtsJob(text, options)` | 한국어 내레이션 작업 접수 / Create TTS job | JSON |
| `getTtsJob(jobId)` | TTS 작업 상태 / TTS job status | JSON |
| `cancelTtsJob(jobId)` | 대기·생성 중 TTS 작업 취소 / Cancel waiting or processing TTS job | JSON |
| `downloadTtsResult(jobId)` | TTS 결과 1회 다운로드 / One-time TTS result | MP3 |
| `downloadTtsSubtitles(jobId)` | TTS 자막 1회 다운로드 / One-time TTS subtitles | ASS |
| `htmlToPdf(html, options)` | HTML→PDF | Binary |
| `jsonToExcel(data, options)` | JSON→Excel | Binary |
| `summarize(text)` | 텍스트 요약 / Text summarization | JSON |
| `polish(text)` | 텍스트 다듬기 / Text polishing | JSON |
| `generateImages(prompt, options)` | 이미지 생성 / Image generation | JSON |
| `editImages(image, prompt, options)` | 이미지 편집 / Image editing | JSON |
| `createImageGenerationJob(prompt, options)` | 대량 이미지 생성 작업 / Batch generation job | JSON |
| `createImageEditJob(image, prompt, options)` | 대량 이미지 편집 작업 / Batch edit job | JSON |
| `getImageJob(jobId)` | 이미지 작업 상태 조회 / Job status | JSON |
| `downloadImageJobImage(jobId, index)` | 개별 결과 / Individual result | Binary |
| `downloadImageJobArchive(jobId)` | ZIP 결과 / ZIP archive | Binary |

## JSON 결과 / JSON results

JSON API는 실제 응답과 과금 메타데이터를 분리해 반환합니다.
JSON APIs separate the service result from billing metadata.

```js
const result = await apick.searchAddress('가산디지털로', { page: 1 });

console.log(result.data);
console.log(result.meta);
// { cost: number | null, durationMs: number | null }
```

## 파일 입력 / File input

## 이미지 생성·편집 / Image generation and editing

이미지는 장당 25포인트이며 동기는 1~4장, 작업형 API는 최대 50장까지 지원합니다. 요청이 접수되면 전체 금액을 먼저 차감하고, 생성에 실패한 이미지가 있으면 해당 장수만큼 즉시 환급합니다. 접수된 작업은 취소할 수 없으며 결과는 완료 후 24시간 동안 반복 다운로드할 수 있습니다.

Images cost 25 points each. Synchronous calls support 1–4 images and job calls support up to 50. The full amount is deducted when a request is accepted, and failed images are refunded immediately. Accepted jobs cannot be cancelled. Completed results remain downloadable for 24 hours.

```js
const made = await apick.generateImages("따뜻한 조명의 미니멀 제품 사진", {
  imageCount: 2, size: "1024x1024", outputFormat: "webp",
  idempotencyKey: "catalog-cover-20260905"
});

const referenced = await apick.generateImages("구도와 제품 형태는 유지하고 여름 해변 분위기로", {
  referenceImage: "./reference.png",
  referenceFilename: "reference.png",
  referenceContentType: "image/png"
});

const edited = await apick.editImages("./source.png", "컵 색상을 파란색으로 변경", {
  outputFormat: "png"
});

const queued = await apick.createImageGenerationJob("여행 포스터 시안", { imageCount: 20 });
const job = await apick.getImageJob(queued.data.job_id);
const image = await apick.downloadImageJobImage(job.data.job_id, 0);
await image.save("./result.png");
```

PNG·JPEG·WebP 출력, 투명 배경 미리보기(PNG/WebP), 5개 표준 크기(`1024x1024`, `1536x1024`, `1024x1536`, `1152x864`, `864x1152`)를 지원합니다. 입력 프롬프트는 최대 28,000자입니다. `idempotencyKey`는 네트워크 재전송 때 중복 생성과 중복 과금을 막는 8~128자의 요청 식별자이며, 같은 작업을 다시 보낼 때 같은 값을 사용합니다. 자동 재시도는 하지 않습니다.

PNG, JPEG, and WebP outputs, transparent-background previews for PNG/WebP, and five standard sizes are supported. Prompts are limited to 28,000 characters. `idempotencyKey` identifies the same request during network retransmission to prevent duplicate generation and billing. Requests are never retried automatically.

OCR은 PNG/JPEG 파일 경로, `Blob`, `ArrayBuffer`, `Uint8Array`를 받습니다. 최대 크기는 50MB입니다.
OCR accepts a PNG/JPEG file path, `Blob`, `ArrayBuffer`, or `Uint8Array`, up to 50MB.

```js
const result = await apick.ocr('./receipt.jpg');
console.log(result.data.result.full_text);
```

브라우저 또는 메모리 데이터:

```js
const result = await apick.ocr(imageBytes, {
  filename: 'receipt.png',
  contentType: 'image/png'
});
```

## 파일 결과 / Binary results

파일을 반환하는 메서드는 `ApickBinaryResult`를 반환합니다.
Methods producing files return an `ApickBinaryResult`.

```js
const pdf = await apick.htmlToPdf('<h1>월간 보고서</h1>', {
  pagination: true
});

console.log(pdf.contentType, pdf.size, pdf.meta.cost);
await pdf.save('./report.pdf');
```

```js
const excel = await apick.jsonToExcel(
  [{ name: 'Kim', score: 95 }, { name: 'Lee', score: 88 }],
  { sheetName: 'Scores' }
);

await excel.save('./scores.xlsx');
```

`ApickBinaryResult` provides `bytes`, `size`, `filename`, `contentType`, `meta`, `toArrayBuffer()`, `toBlob()`, and `save(path)`.

## 비동기 TTS Jobs / Asynchronous TTS Jobs

기존 동기 TTS는 종료되었습니다. 한국어 내레이션은 작업을 접수하고 `completed`가 될 때까지 2~5초 간격으로 상태를 확인한 뒤 MP3 결과를 한 번만 내려받습니다.

The legacy synchronous TTS API has retired. Create a Korean narration job, poll every 2–5 seconds until it is `completed`, then download the MP3 result once.

17 neutral narration voices are supported: the five original `narrator_m_01`–`narrator_m_05` voices plus `narrator_f_10s_01`–`03`, `narrator_m_20s_01`, `narrator_f_20s_01`–`04`, `narrator_m_30s_01`–`02`, `narrator_m_40s_01`, and `narrator_m_80s_01`. Import `TTS_VOICE_IDS` for the exact list.

표시 이름 / voice labels: `narrator_m_01` 태준, `narrator_m_02` 민석, `narrator_m_03` 도현, `narrator_m_04` 강우, `narrator_m_05` 성훈, `narrator_f_10s_01` 서아, `narrator_f_10s_02` 하린, `narrator_f_10s_03` 예린, `narrator_m_20s_01` 도윤, `narrator_f_20s_01` 지안, `narrator_f_20s_02` 서윤, `narrator_f_20s_03` 소연, `narrator_f_20s_04` 유나, `narrator_m_30s_01` 현우, `narrator_m_30s_02` 준혁, `narrator_m_40s_01` 정우, `narrator_m_80s_01` 영수.

```js
const created = await apick.createTtsJob('오늘의 이야기를 시작합니다.', {
  voiceId: 'narrator_m_03'
});
const jobId = created.data.job_id;

let job;
do {
  await new Promise(resolve => setTimeout(resolve, 3000));
  job = await apick.getTtsJob(jobId);
} while (job.data.status === 'waiting' || job.data.status === 'processing');

if (job.data.status === 'completed') {
  const result = await apick.downloadTtsResult(jobId);
  await result.save(`./${jobId}.mp3`);
  const subtitles = await apick.downloadTtsSubtitles(jobId);
  await subtitles.save(`./${jobId}.ass`);
}
```

접수 성공 시 과금되며 취소해도 환불되지 않습니다. 취소는 `waiting` 또는 `processing` 상태에서 가능하고, MP3와 ASS 자막은 각각 한 번만 내려받을 수 있습니다. 각 다운로드가 시작되면 해당 서버 원본이 즉시 폐기되므로 전송 중단 시에도 다시 받을 수 없습니다.

The charge is final when the job is accepted. Cancellation is allowed while `waiting` or `processing`. The MP3 and ASS subtitles can each be downloaded once. Starting either download immediately consumes that server copy, so an interrupted transfer cannot be downloaded again.

## 신분증 마스킹 / Identity masking

```js
const resident = await apick.maskResidentNumber('./id-card.jpg', { type: 3 });
await resident.save('./masked.png');

const passport = await apick.maskPassport('./passport.jpg');
console.log(passport.data.result.fields);
```

`maskResidenceCard`, `maskPassport`, `maskIdCard`, `maskDriverLicense`는 JSON 결과를 반환합니다. `maskResidentNumber`는 PNG 바이너리를 반환하며 `type`은 `1`, `2`, `3` 중 하나입니다.
The four document-specific methods return JSON. `maskResidentNumber` returns PNG bytes and requires `type` 1, 2, or 3.

`maskResidenceCard`는 외국인등록증·영주증·외국국적동포 국내거소신고증의 앞면 한 장을 지원합니다. 영주증과 외국국적동포 국내거소신고증 지원은 개인정보 마스킹에만 적용되며 외국인등록증 진위확인 범위는 변경되지 않습니다.
`maskResidenceCard` accepts one front-side image of a residence card, permanent resident card, or overseas Korean resident card. Permanent and overseas Korean card support is limited to PII masking and does not expand the alien registration card authenticity-check scope.

## 오류 처리 / Error handling

```js
import { ApickApiError } from 'apick-api';

try {
  await apick.whois('invalid value');
} catch (error) {
  if (error instanceof ApickApiError) {
    console.error(error.code, error.serviceCode, error.status, error.message);
  }
}
```

오류 코드는 `APICK_AUTH_ERROR`, `APICK_TIMEOUT`, `APICK_NETWORK_ERROR`, `APICK_INVALID_RESPONSE`, `APICK_API_ERROR` 중 하나입니다.
Error codes are one of `APICK_AUTH_ERROR`, `APICK_TIMEOUT`, `APICK_NETWORK_ERROR`, `APICK_INVALID_RESPONSE`, and `APICK_API_ERROR`.
신분증 서비스의 상세 오류 코드는 선택적 `serviceCode`에 보존됩니다. Identity-specific service errors are exposed through optional `serviceCode`.

## 보안과 과금 / Security and billing

- 인증키는 비밀번호처럼 취급하고 소스 코드, 공개 저장소, 브라우저 번들에 넣지 마세요.
- 서버 환경변수 `APICK_API_KEY` 사용을 권장합니다.
- SDK는 인증키를 로그나 오류 메시지에 출력하지 않습니다.
- 실제 API 호출은 에이픽 포인트를 사용할 수 있습니다. 현재 요금은 [API 문서](https://apick.app/dev_guide)에서 확인하세요.
- 중복 과금을 방지하기 위해 SDK는 실패한 요청을 자동 재시도하지 않습니다.
- Treat the key like a password. Keep it in a server-side environment variable and never ship it in a browser bundle.
- API calls may consume APICK points. The SDK deliberately performs no automatic retries.

## Requirements

- Node.js 18 or newer
- No runtime dependencies
- ESM and CommonJS support
- TypeScript declarations included

## License

MIT — see [LICENSE](LICENSE). Use of the APICK service is governed by the [APICK terms](https://apick.app/terms).
