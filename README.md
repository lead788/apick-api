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

본문이 있는 요청은 `multipart/form-data`로 전송됩니다. 배열·객체도 개별 폼 항목으로 전달하고 SDK가 boundary를 자동 설정합니다. 기존 메서드와 JSON·파일 응답 형식은 유지됩니다.

Requests with a body use `multipart/form-data`, including indexed fields for nested values. The SDK sets the boundary automatically; method signatures and JSON/file results remain unchanged.

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
| `youtubeMetadata(url)` | 유튜브 영상 정보 / YouTube video metadata | JSON |
| `youtubeThumbnail(url)` | 유튜브 썸네일 / YouTube thumbnail | JPG |
| `youtubeSubtitleList(url)` | 유튜브 자막 언어 목록 / YouTube subtitle languages | JSON |
| `youtubeSubtitle(url, lang, options)` | 유튜브 자막 다운로드 / YouTube subtitles | VTT·SRT·TXT |
| `createTtsJob(text, options)` | 한국어 내레이션 작업 접수 / Create TTS job | JSON |
| `getTtsJob(jobId)` | TTS 작업 상태 / TTS job status | JSON |
| `cancelTtsJob(jobId)` | 대기·생성 중 TTS 작업 취소 / Cancel waiting or processing TTS job | JSON |
| `downloadTtsResult(jobId)` | TTS 결과 1회 다운로드 / One-time TTS result | MP3 |
| `downloadTtsSubtitles(jobId)` | TTS 자막 1회 다운로드 / One-time TTS subtitles | ASS |
| `getTtsQuality(jobId)` | 발화별 검수·후보 이력 / Utterance quality and candidates | JSON |
| `retryTtsJob(jobId, utteranceIds, idempotencyKey)` | 같은 작업의 국소 복구 / Idempotent local recovery | JSON |
| `downloadTtsCandidate(jobId, candidateId)` | 검수 후보 청취 / Candidate audio | WAV |
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
| `requestEmployment(input)` / `getEmployment(transactionId)` | 재직·보험료 확인 / Employment & insurance premium check | JSON |
| `requestPersonalIncome(input)` / `getPersonalIncome(transactionId)` | 금융소득(이자·배당) 조회 / Financial income (interest/dividend) | JSON |
| `requestNpsJoinHistory(input)` / `getNpsJoinHistory(transactionId)` | 국민연금 가입내역조회 / National Pension join history | JSON |
| `requestDrivingLicense(input)` / `getDrivingLicense(transactionId)` | 운전면허 조회 / Driver's license check | JSON |
| `requestHealthCheckup(input)` / `getHealthCheckup(transactionId)` | 국가 건강검진 결과 조회 / National health checkup results | JSON |
| `requestCashReceiptDeduction(input)` / `getCashReceiptDeduction(transactionId)` | 현금영수증 소득공제 내역 / Cash receipt income deductions | JSON |
| `requestTaxReturnHistory(input)` / `getTaxReturnHistory(transactionId)` | 국세 신고내역 조회 / National tax return history | JSON |
| `searchSkills(options)` / `getSkill(skillId)` | Skill 검색·상세 / Search and inspect Skills | JSON |
| `quoteSkill(skillId, input, options)` | Skill 견적(무료) / Quote a run (free) | JSON |
| `runSkill(skillId, input, options)` | Skill 실행 / Run a Skill | JSON |
| `getSkillRun(runId)` / `getSkillRunResult(runId)` / `cancelSkillRun(runId)` | 실행 조회·결과·취소 / Read, fetch result, cancel | JSON |
| `skillUsage(options)` | 내 Skill 실행 내역 / My Skill runs | JSON |

## Skills

검수를 거친 Skill 을 검색하고 실행합니다. 결과가 약속한 형식으로 반환된 실행만 포인트가 차감되고, 실패·시간초과·취소는 차감되지 않습니다. 생성형 AI 를 쓰는 Skill 은 실행마다 실제 사용량만큼 금액이 달라지므로, 실행 전에 `quoteSkill()` 로 예상 금액(`estimated_points`)과 최대 금액(`max_points`)을 확인하세요. 1회 이상 결제한 계정에서 실행할 수 있습니다.
Search and run reviewed Skills. Points are charged only when a result in the promised format is returned; failures, timeouts and cancellations are not charged. For Skills that use generative AI the amount varies per run with actual usage, so call `quoteSkill()` first to get the estimated (`estimated_points`) and maximum (`max_points`) amount. Running requires an account with at least one payment.

```js
import { randomUUID } from 'node:crypto';

const found = await apick.searchSkills({ query: '상품명', limit: 5 });
const skillId = found.data.items[0].skill_id;
const detail = await apick.getSkill(skillId);          // input_schema, output_schema, price_points, estimated_points
const input = { product_name: '튼튼한 접이식 우산' };
const quote = (await apick.quoteSkill(skillId, input)).data; // 무료 / free: estimated_points, max_points

const idempotencyKey = randomUUID();                    // 재시도할 때 같은 값을 다시 씁니다 / reuse on retry
let run = (await apick.runSkill(skillId, input, { idempotencyKey, quoteId: quote.quote_id, maxCostPoints: quote.max_points })).data;
while (!['succeeded', 'failed', 'timed_out', 'cancelled'].includes(run.status)) {
  await new Promise(resolve => setTimeout(resolve, 2000));
  run = (await apick.getSkillRun(run.run_id)).data;
}
console.log(run.status, run.billing, run.result);
```

Skills 응답은 다른 API 와 달리 봉투 없이 그대로 `data` 에 담깁니다. 과금 상태는 `data.billing`(`reserved`·`captured`·`released`…)에서 확인하며 `meta.cost` 는 채워지지 않습니다. 응답을 받지 못했을 때는 **같은 `idempotencyKey`** 로 다시 호출하세요. 포인트는 한 번만 차감됩니다. 같은 키에 다른 입력을 보내면 `IDEMPOTENCY_CONFLICT` 로 거부됩니다.
Skills responses are returned as-is in `data`. Read the charge from `data.billing`; `meta.cost` is not populated. If a response is lost, call again with the **same `idempotencyKey`** — points are charged once. The same key with a different input is rejected with `IDEMPOTENCY_CONFLICT`.

접수 전에 거절된 요청은 `ApickApiError` 로 던져지며 `serviceCode` 에 `INVALID_INPUT`·`INSUFFICIENT_POINTS`·`PRICE_EXCEEDS_LIMIT`·`RATE_LIMITED` 같은 코드가, `details` 에 부가 정보가 담깁니다. 접수된 뒤 실패한 실행은 예외가 아니라 `status` 와 `failure_code` 로 확인합니다.
Requests rejected before acceptance throw `ApickApiError` with the code in `serviceCode` and extra information in `details`. A run that fails after acceptance is reported through `status` and `failure_code`, not an exception.

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

TTS supports 16 voice IDs. Use `TTS_VOICE_IDS` and the developer guide for the current list.

`v2_ann_m_30s_01`, `v2_ann_m_30s_02`, `v2_ann_m_30s_04`, `v2_ann_m_30s_05`, `v2_ann_f_30s_01`, `v2_ann_f_30s_02`, `v2_ann_f_30s_03`, `v2_ann_f_30s_04`, `v2_ann_f_30s_05`, `v2_m_teen_01`, `v2_m_young_01`, `v2_m_mid_01`, `v2_m_senior_01`, `v2_f_teen_01`, `v2_f_young_01`, `v2_f_senior_01`

```js
const created = await apick.createTtsJob('오늘의 이야기를 시작합니다.', {
  voiceId: 'v2_ann_m_30s_01'
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

`maskResidenceCard`, `maskPassport`, `maskIdCard`, `maskDriverLicense`는 JSON 결과를 반환합니다. `maskResidentNumber`는 PNG 바이너리를 반환하며 `type`은 `1`, `2`, `3`, `4` 중 하나이며 4는 주민등록번호와 주소를 함께 가립니다.
The four document-specific methods return JSON. `maskResidentNumber` returns PNG bytes and requires `type` 1, 2, 3, or 4 (number and address).

`maskResidenceCard`는 외국인등록증·영주증·외국국적동포 국내거소신고증의 앞면 한 장을 지원합니다. 영주증과 외국국적동포 국내거소신고증 지원은 개인정보 마스킹에만 적용되며 외국인등록증 진위확인 범위는 변경되지 않습니다.
`maskResidenceCard` accepts one front-side image of a residence card, permanent resident card, or overseas Korean resident card. Permanent and overseas Korean card support is limited to PII masking and does not expand the alien registration card authenticity-check scope.

## 간편인증 기반 데이터 조회 / Simple-auth data lookups

본인 간편인증이 필요한 조회 상품(재직·소득·연금·면허·건강검진·현금영수증·국세 신고내역)은 접수(`request*`)와 결과 조회(`get*`)가 분리되어 있습니다. 접수 응답의 `transactionId`로 결과를 폴링하세요.

Products that require the user's own simple-auth verification (employment, income, pension, driver's license, health checkup, cash receipts, tax returns) split the call into a `request*()` acceptance and a `get*()` poll. Use the `transactionId` from the accepted response to poll for the result.

아래 함수는 7종 모두에 공통으로 사용합니다. 같은 `transactionId`로 순차 조회하며 5→10→20→30초 간격으로 늘린 뒤 30초를 유지합니다. `resultAvailable === true`이면 즉시 결과를 반환합니다. `SUCCESS`는 전체 성공, `PARTIAL_SUCCESS`는 부분 성공이므로 `sources`에서 누락·실패 항목을 확인하세요. `AUTH_REJECTED`·`AUTH_EXPIRED`·`FAILED`는 실패 종료이며, `errorCode: 'RESULT_EXPIRED'`는 결과 보관 기간 만료입니다. 실패·만료 시 자동으로 재접수하지 않습니다.

Use this helper for all seven products. Poll sequentially with the same `transactionId`, waiting 5→10→20→30 seconds and then keeping the 30-second interval. Return the result immediately when `resultAvailable === true`. `SUCCESS` means full success; `PARTIAL_SUCCESS` means partial success, so inspect `sources` for missing or failed items. `AUTH_REJECTED`, `AUTH_EXPIRED`, and `FAILED` are terminal failures; `errorCode: 'RESULT_EXPIRED'` means the retained result has expired. Never resubmit automatically after failure or expiry.

<!-- simple-auth-polling:start -->
```js
async function pollDataResult(getResult, accepted, { timeoutMs = 600_000 } = {}) {
  const pending = new Set([
    'AUTH_REQUESTED', 'AUTH_WAITING', 'AUTH_COMPLETED', 'COLLECTING', 'COLLECTED'
  ]);
  const failed = new Set(['AUTH_REJECTED', 'AUTH_EXPIRED', 'FAILED']);
  const completed = new Set(['SUCCESS', 'PARTIAL_SUCCESS']);
  const delays = [5_000, 10_000, 20_000, 30_000];
  const deadline = Date.now() + timeoutMs;
  const transactionId = accepted.data.transactionId;
  const stop = code => { throw Object.assign(new Error(code), { code }); };
  let response = accepted;
  let attempt = 0;

  for (;;) {
    const data = response.data;
    if (data.errorCode === 'RESULT_EXPIRED') stop('RESULT_EXPIRED');
    if (failed.has(data.status)) stop(data.errorCode || data.status);
    if (data.resultAvailable === true) {
      if (data.result == null) stop('INVALID_RESULT');
      return response;
    }
    if (completed.has(data.status)) stop('RESULT_NOT_AVAILABLE');
    if (!pending.has(data.status)) stop('UNKNOWN_STATUS');

    const awaitingApproval = ['AUTH_REQUESTED', 'AUTH_WAITING'].includes(data.status);
    const authDeadline = Date.parse(data.expiresAt || accepted.data.expiresAt);
    const limit = awaitingApproval && Number.isFinite(authDeadline)
      ? Math.min(deadline, authDeadline) : deadline;
    const timeoutCode = awaitingApproval && limit === authDeadline
      ? 'AUTH_WAIT_TIMEOUT' : 'CLIENT_POLL_TIMEOUT';
    const remaining = limit - Date.now();
    if (remaining <= 0) stop(timeoutCode);
    await new Promise(resolve => setTimeout(resolve,
      Math.min(delays[Math.min(attempt++, delays.length - 1)], remaining)));
    if (Date.now() >= limit) stop(timeoutCode);
    response = await getResult(transactionId);
  }
}
```
<!-- simple-auth-polling:end -->

`AUTH_REQUESTED`·`AUTH_WAITING`은 사용자 승인을 기다리고, `AUTH_COMPLETED`·`COLLECTING`·`COLLECTED`는 결과가 준비될 때까지 계속 조회합니다. 과금 여부(`charged`, `success`)는 완료 기준이 아닙니다. 인증 대기에만 `expiresAt`을 적용하고 승인 후에는 전체 대기 한도를 적용합니다. 예제의 10분 한도는 클라이언트 정책이며, 진행 중인 호출의 제한 시간은 SDK의 `timeoutMs`로 별도 설정하세요. `AUTH_WAIT_TIMEOUT`·`CLIENT_POLL_TIMEOUT`·`RESULT_NOT_AVAILABLE`·`INVALID_RESULT`·`UNKNOWN_STATUS`는 예제에서 만드는 로컬 오류로, 응답 모순이나 알 수 없는 상태에서 무한 반복하지 않습니다. 통신 오류도 재시도 없이 호출자에게 전달합니다.

`AUTH_REQUESTED` and `AUTH_WAITING` wait for the user's approval; `AUTH_COMPLETED`, `COLLECTING`, and `COLLECTED` keep polling until a result is available. Billing fields (`charged`, `success`) do not indicate completion. Apply `expiresAt` only while awaiting approval, then use the overall waiting limit. The example's 10-minute limit is a client policy; configure the SDK's `timeoutMs` separately to bound each in-flight call. `AUTH_WAIT_TIMEOUT`, `CLIENT_POLL_TIMEOUT`, `RESULT_NOT_AVAILABLE`, `INVALID_RESULT`, and `UNKNOWN_STATUS` are local example errors that prevent endless polling on inconsistent responses or unknown states. Transport errors propagate without retries.

<!-- simple-auth-usage:start -->
```js
const accepted = await apick.requestEmployment({
  name: '홍길동',
  birthDate: '19900101',
  phone: '01011112222',
  authProvider: 'kakao',
  insuranceYears: 3
});

try {
  const result = await pollDataResult(id => apick.getEmployment(id), accepted);
  if (result.data.status === 'PARTIAL_SUCCESS') console.warn(result.data.sources);
  console.log(result.data.result);
} catch (error) {
  if ((error.serviceCode || error.code) === 'RESULT_EXPIRED') {
    console.error('결과 보관 기간 만료: 사용자 확인 후 새 인증을 요청하세요.');
  } else {
    throw error;
  }
}
```
<!-- simple-auth-usage:end -->

근거: [APICK 개발가이드](https://apick.app/dev_guide/data_health_checkup) · [MCP 3.5.0 상태 계약](https://github.com/lead788/apick-mcp/blob/a803abcb81d07377c85f49bb0b670baf0c17ed04/TOOLS.md)

지원 간편인증 방식(`authProvider`) 13종은 `AUTH_PROVIDERS`로 제공됩니다: `kakao`, `naver`, `toss`, `pass`, `samsung`, `kb`, `shinhan`, `hana`, `woori`, `ibk`, `nh`, `kakaobank`, `banksalad`.
The 13 supported `authProvider` values are exported as `AUTH_PROVIDERS`: `kakao`, `naver`, `toss`, `pass`, `samsung`, `kb`, `shinhan`, `hana`, `woori`, `ibk`, `nh`, `kakaobank`, `banksalad`.

접수 시 정액 과금되고, 결과는 최초 반환에서만 과금되며 재조회는 무료입니다. 결과는 `resultExpiresAt`까지만 재조회할 수 있고, 그 이후에는 `errorCode: 'RESULT_EXPIRED'`가 오며 접수부터 다시 시작해야 합니다.
Acceptance is billed at a flat rate; the result is billed only on its first successful return and free to re-poll afterward. The result can be re-fetched until `resultExpiresAt`; after that `errorCode` is `'RESULT_EXPIRED'` and you must request again from the start.

| 상품 / Product | Request / Get | 선택 입력 / Optional input |
| --- | --- | --- |
| 재직·보험료 확인 / Employment & insurance premium | `requestEmployment` / `getEmployment` | `insuranceYears` (1–3) |
| 금융소득 조회 / Financial income | `requestPersonalIncome` / `getPersonalIncome` | `incomeYears` (1–5) |
| 국민연금 가입내역 / NPS join history | `requestNpsJoinHistory` / `getNpsJoinHistory` | `from`, `to` (`YYYY-MM`) |
| 운전면허 조회 / Driver's license | `requestDrivingLicense` / `getDrivingLicense` | — |
| 국가 건강검진 결과 / Health checkup | `requestHealthCheckup` / `getHealthCheckup` | — |
| 현금영수증 소득공제 내역 / Cash receipt deductions | `requestCashReceiptDeduction` / `getCashReceiptDeduction` | `incomeYears` (1–3) |
| 국세 신고내역 조회 / Tax return history | `requestTaxReturnHistory` / `getTaxReturnHistory` | `years` (1–10) |

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

## Video model versions

Omitting `version` preserves Seedance 2.5, Veo 3.1 and Kling 3.0. Set `version` and `tier` explicitly to select a generation; jobs are never silently switched to another version. Submission and status responses include `version`.

Available generations: Seedance 1.0/1.5/2.0/2.5, including Seedance 2.0 Standard/Fast/Mini; Veo 3.1 (Standard/Fast/Lite); Kling 1.6/2.0/2.1/2.5/2.6/3.0/O1/O3. Veo 3.0 is unavailable. Modes, tiers, resolutions, durations, audio, file limits and prices vary by combination. See the [Seedance](https://apick.app/dev_guide/seedancejobs), [Veo](https://apick.app/dev_guide/veojobs) and [Kling](https://apick.app/dev_guide/klingjobs) version tables. Unsupported combinations are rejected before submission.

Seedance reference mode accepts `referenceImages`, `referenceVideos`, and `referenceAudios` (MP3/WAV) when supported by the selected version.

## 영상 모델 버전 선택

`version`을 생략하면 Seedance 2.5, Veo 3.1, Kling 3.0을 사용합니다. 버전과 등급을 명시하면 해당 조합으로 생성하며 다른 모델로 자동 대체하지 않습니다. 생성과 상태 응답의 `version`으로 확인할 수 있습니다.

| 제품 | 제공 버전 | 제약과 요금 |
|---|---|---|
| Seedance | 2.5, 2.0(Standard·Fast·Mini), 1.5, 1.0 | [버전별 지원표](https://apick.app/dev_guide/seedancejobs) |
| Veo | 3.1 (Standard, Fast, Lite) | [버전별 지원표](https://apick.app/dev_guide/veojobs) |
| Kling | 3.0, O3, O1, 2.6, 2.5, 2.1, 2.0, 1.6 | [버전별 지원표](https://apick.app/dev_guide/klingjobs) |

등급·해상도·길이·오디오·파일 개수와 초당 포인트는 선택 조합별로 다릅니다. Seedance 2.0은 Standard·Fast·Mini를 제공하며 Mini는 480p·720p와 4~15초를 지원합니다. 무음 전용 모델은 `audio=false`, 오디오 필수 모델은 `audio=true`만 허용합니다. Veo 3.0은 현재 제공하지 않습니다. 지원하지 않는 조합은 접수 전에 거절됩니다.

Seedance 참조 소재 모드는 지원 버전에서 `referenceImages`, `referenceVideos`, `referenceAudios`(MP3·WAV)를 함께 사용할 수 있습니다.

```js
const job = await client.createVideoJob("kling", "A boat crossing the sea", {
  version: "1.6", tier: "std", mode: "text", duration: 5, audio: false,
  idempotencyKey: "boat-video-0001"
});
const status = await client.getVideoJob("kling", job.data.job_id);
if (status.data.status === "completed") {
  await (await client.downloadVideoResult("kling", job.data.job_id)).save("boat.mp4");
}
```
