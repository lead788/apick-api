# apick-api 한국어 가이드

## 요청과 응답 형식

SDK의 본문 요청은 모두 `multipart/form-data`입니다. `utterance_ids[0]`처럼 배열을 개별 필드로 전송하며 `Content-Type` 헤더를 직접 지정할 필요가 없습니다. GET 조회는 본문을 보내지 않습니다. 기존 JSON 요청도 서버에서 호환용으로 계속 처리합니다.

SDK는 줄바꿈 문자열을 `__apick_encoding[필드]=base64-utf8` 메타 항목과 함께 보내 원문의 LF·CR을 보존합니다. Excel 셀은 타입 메타 항목을 함께 사용하며 Date는 ISO 문자열, 배열의 빈 칸은 null로 전달합니다.

응답은 서비스별 JSON 또는 파일입니다. 파일 다운로드 실패 시 JSON 오류가 반환될 수 있으며 SDK는 이를 `ApickApiError`로 전달합니다. 직접 REST를 연동할 때는 개발가이드의 OpenAPI 명세와 Postman 컬렉션을 내려받을 수 있습니다. MCP 외부 연결은 기존 JSON-RPC를 사용합니다.

`apick-api`는 에이픽의 주요 REST API를 Node.js에서 간단히 호출하기 위한 공식 SDK입니다. 런타임 의존성이 없으며 ESM, CommonJS, TypeScript를 지원합니다.

## 설치와 인증

```bash
npm install apick-api
```

```js
import { ApickClient } from 'apick-api';

const client = new ApickClient({
  apiKey: process.env.APICK_API_KEY,
  timeoutMs: 60_000
});
```

인증키는 생성자에만 전달하세요. 클라이언트 객체의 열거 가능한 속성에 저장되지 않으며 SDK가 로그로 출력하지 않습니다.

마이페이지의 허용 IP가 공란이면 제한 없이 호출할 수 있습니다. 제한하려면 APICK에 도착하는 공인 IPv4를 단일 주소 또는 CIDR(`/32` 등)로 등록하세요. 저장 즉시 반영되며 별도 동기화는 필요하지 않습니다.

## 조회와 검증

```js
const business = await client.businessDetails('439-87-00761');
const venture = await client.ventureBusiness('4398700761');
const email = await client.validateEmail('sample@example.com');
const phone = await client.validatePhone('01012341234');
const holidays = await client.holidays(2026, 10);
const addresses = await client.searchAddress('가산디지털로', { page: 1 });
```

사업자등록번호의 하이픈은 자동으로 제거합니다. 잘못된 필수값은 네트워크 요청 전에 `TypeError` 또는 `RangeError`로 차단합니다.

## 배송조회

택배사를 알면 지정조회가 더 정확합니다.

```js
const parcel = await client.trackParcel('cj', '123456789012');
```

택배사를 모르면 자동판별 조회를 사용할 수 있습니다.

```js
const parcel = await client.trackParcelAuto('123456789012');
```

## 도메인·검색

```js
const dns = await client.dnsLookup('apick.app');
const location = await client.geolocate('apick.app');
const registration = await client.whois('apick.app');
const web = await client.googleSearch('에이픽 API', { page: 1 });
const images = await client.googleImageSearch('서울 야경', { page: 1 });
```

## OCR

PNG와 JPEG를 지원하며 최대 크기는 50MB입니다.

```js
const ocr = await client.ocr('./receipt.jpg');
console.log(ocr.data.result.full_text);
```

메모리 데이터에는 파일명과 콘텐츠 타입을 지정할 수 있습니다.

```js
await client.ocr(bytes, {
  filename: 'scan.png',
  contentType: 'image/png'
});
```

## 파일 생성

TTS는 14개 목소리 ID를 지원합니다. 정확한 목록은 `TTS_VOICE_IDS` 상수와 개발가이드에서 확인합니다.

`v2_ann_m_30s_01`, `v2_ann_m_30s_02`, `v2_ann_m_30s_04`, `v2_ann_m_30s_05`, `v2_ann_f_30s_02`, `v2_ann_f_30s_03`, `v2_ann_f_30s_04`, `v2_ann_f_30s_05`, `v2_m_teen_01`, `v2_m_young_01`, `v2_m_mid_01`, `v2_m_senior_01`, `v2_f_young_01`, `v2_f_senior_01`

`createTtsJob()`으로 접수한 문장의 숫자·단위·기호·영문은 문맥에 맞는 한글 읽기로 자동 변환한 뒤 음성을 생성합니다(예: `5번 버스` → 오 번 버스, `버튼을 5번` → 다섯 번, `-5℃` → 영하 오 도, `인증번호 105028` → 한 자리씩). 모든 TTS 요청에 자동 적용되므로 추가 옵션이나 별도 Skill 호출이 필요하지 않습니다. 과금 글자 수와 요금은 보낸 원문 기준이며 요청·응답 형식은 그대로입니다. 요금은 100자까지 30포인트이고 이후 100자마다 10포인트가 추가되며, 자동 변환에 따른 추가 요금은 없습니다. 읽는 법을 직접 정하려면 한글로 풀어 써서 보내세요. ASS 자막은 보낸 원문 표기로 제공됩니다. 정규화에 실패하면 원문으로 음성을 생성합니다.

```js
const screenshot = await client.screenshot('https://example.com');
await screenshot.save('./example.jpeg');

// 유튜브 공개 영상: 영상 주소 또는 11자리 영상 ID
const video = await client.youtubeMetadata('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
const tracks = await client.youtubeSubtitleList(video.data.video_id);
const subtitle = await client.youtubeSubtitle(video.data.video_id, 'en', { format: 'srt' });
await subtitle.save('./' + subtitle.filename);
await (await client.youtubeThumbnail(video.data.video_id)).save('./thumbnail.jpg');

const created = await client.createTtsJob('오늘의 이야기를 시작합니다.', { voiceId: 'v2_ann_m_30s_01' });
const jobId = created.data.job_id;
let job = await client.getTtsJob(jobId);
while (job.data.status === 'waiting' || job.data.status === 'processing') {
  await new Promise(resolve => setTimeout(resolve, 3000));
  job = await client.getTtsJob(jobId);
}
if (job.data.status === 'completed') {
  const result = await client.downloadTtsResult(jobId);
  await result.save(`./${jobId}.mp3`); // audio/mpeg, 1회만 다운로드 가능
  const subtitles = await client.downloadTtsSubtitles(jobId);
  await subtitles.save(`./${jobId}.ass`); // ASS 자막, 별도 1회 다운로드
}

// 취소는 waiting 또는 processing 상태에서 가능하며 이미 과금된 금액은 환불되지 않습니다.
// MP3와 ASS는 각각 다운로드 시작 시 해당 서버 원본이 즉시 폐기되어 재다운로드할 수 없습니다.

const pdf = await client.htmlToPdf('<h1>보고서</h1>', { pagination: true });
await pdf.save('./report.pdf');

const excel = await client.jsonToExcel([{ item: 'A', count: 3 }], {
  sheetName: '재고'
});
await excel.save('./inventory.xlsx');
```

파일 결과에는 `bytes`, `size`, `filename`, `contentType`, `meta`가 포함됩니다. `save()`는 Node.js에서 파일을 저장하며, `toBlob()`은 웹 표준 `Blob`을 만듭니다.

## 텍스트 AI

```js
const summary = await client.summarize(longText);
const polished = await client.polish(draftText);
```

입력 텍스트는 최대 100,000자입니다.

## 이미지 AI

```js
const result = await client.generateImages('흰 배경의 제품 사진', {
  imageCount: 4,
  size: '1024x1024',
  outputFormat: 'webp',
  idempotencyKey: 'product-draft-001'
});

const referenceResult = await client.generateImages('제품 모양과 구도는 유지하고 배경을 햇살 좋은 주방으로 변경', {
  referenceImage: './reference.png',
  referenceFilename: 'reference.png',
  referenceContentType: 'image/png'
});

const job = await client.createImageGenerationJob('가로형 커버 시안', { imageCount: 20, size: '1536x1024' });
const status = await client.getImageJob(job.data.job_id);
```

`imageCount`는 만들 이미지 장수이며 생략하면 1장입니다. 동기 생성·편집은 1~4장, 작업형 생성·편집은 1~50장입니다. 생성에 `referenceImage`를 함께 전달하면 참고 이미지의 구도·색감·제품 형태 등을 프롬프트와 조합할 수 있습니다. 편집은 50MB 이하의 PNG/JPEG/WebP 원본 이미지 한 장과 프롬프트를 받으며 마스크 파일은 지원하지 않습니다. 크기는 `1024x1024`, `1536x1024`, `1024x1536`, `1152x864`, `864x1152` 중에서 선택하고 프롬프트는 최대 28,000자까지 입력할 수 있습니다. 접수 시 이미지 장수×25포인트를 먼저 차감하며 실패한 이미지의 25포인트는 즉시 환급합니다. 접수된 작업은 취소할 수 없습니다. 결과 보관 기간은 완료 후 24시간입니다.

`idempotencyKey`는 같은 요청이 통신 오류로 두 번 전송됐을 때 중복 생성과 중복 과금을 막는 안전번호입니다. 영문·숫자·밑줄·하이픈으로 8~128자를 만들고, 같은 작업을 다시 보낼 때는 같은 값을 사용하세요. 프롬프트나 옵션이 달라진 새 작업에는 새 값을 사용해야 합니다.

지원 메서드: `generateImages`, `editImages`, `createImageGenerationJob`, `createImageEditJob`, `getImageJob`, `downloadImageJobImage`, `downloadImageJobArchive`.

## 응답 구조

JSON 메서드:

```ts
{
  data: unknown;
  meta: {
    cost: number | null;
    durationMs: number | null;
  };
}
```

`meta.cost`는 실제 응답에 포함된 차감 포인트입니다. API별 현재 요금은 에이픽 문서를 확인하세요.

## 신분증 마스킹

```js
const png = await client.maskResidentNumber('./id-card.jpg', { type: 3 });
await png.save('./masked.png');

const result = await client.maskDriverLicense('./license.jpg');
console.log(result.data.result.fields);
```

문서별 메서드는 `maskResidenceCard`, `maskPassport`, `maskIdCard`, `maskDriverLicense`입니다. 글자 판독 불가, 문서 불일치, 처리 실패는 각각 `IDENTITY_TEXT_UNREADABLE`, `IDENTITY_DOCUMENT_MISMATCH`, `IDENTITY_PROCESSING_FAILED`로 `ApickApiError.serviceCode`에 제공됩니다.

`maskResidenceCard`는 외국인등록증·영주증·외국국적동포 국내거소신고증의 앞면 한 장을 지원합니다. 영주증과 외국국적동포 국내거소신고증은 개인정보 마스킹만 지원하며 외국인등록증 진위확인 범위에는 포함되지 않습니다.

## 간편인증 데이터 조회

재직·소득·연금·면허·건강검진·현금영수증·국세 신고내역 조회는 본인 간편인증이 필요해 접수(`request*`)와 결과 조회(`get*`)가 나뉩니다.

아래 함수는 7종 모두에 공통으로 사용합니다. 같은 `transactionId`로 순차 조회하며 5→10→20→30초 간격으로 늘린 뒤 30초를 유지합니다. `resultAvailable === true`이면 즉시 결과를 반환합니다. `SUCCESS`는 전체 성공, `PARTIAL_SUCCESS`는 부분 성공이므로 `sources`에서 누락·실패 항목을 확인하세요. `AUTH_REJECTED`·`AUTH_EXPIRED`·`FAILED`는 실패 종료이며, `errorCode: 'RESULT_EXPIRED'`는 결과 보관 기간 만료입니다. 실패·만료 시 자동으로 재접수하지 않습니다.

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

<!-- simple-auth-usage:start -->
```js
const accepted = await client.requestDrivingLicense({
  name: '홍길동',
  birthDate: '19900101',
  phone: '01011112222',
  authProvider: 'kakao'
});

try {
  const result = await pollDataResult(id => client.getDrivingLicense(id), accepted);
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

`authProvider`는 `AUTH_PROVIDERS`(13종: kakao, naver, toss, pass, samsung, kb, shinhan, hana, woori, ibk, nh, kakaobank, banksalad) 중 하나입니다. 접수는 정액 과금, 결과는 최초 반환에서만 과금되며 재조회는 무료입니다. `requestEmployment`는 `insuranceYears`(1~3), `requestPersonalIncome`은 `incomeYears`(1~5), `requestNpsJoinHistory`는 `from`/`to`(`YYYY-MM`) 선택 입력을 받습니다. `requestCashReceiptDeduction`은 `incomeYears`(1~3), `requestTaxReturnHistory`는 `years`(1~10) 선택 입력을 받습니다. 나머지 상품은 `requestDrivingLicense`, `requestHealthCheckup`입니다.

## Skills

검수를 거친 Skill 을 검색하고 실행합니다. Skill 마다 입력 형식(`input_schema`)·결과 형식(`output_schema`)·기본 금액(`price_points`)이 정해져 있으며, 결과가 약속한 형식으로 반환된 실행만 차감됩니다.

생성형 AI 를 쓰는 Skill(`usage_priced: true`)은 기본 금액에 그 실행의 실제 사용량이 더해져 실행마다 금액이 달라집니다. `quoteSkill()` 은 예상 금액(`estimated_points`)과 최대 금액(`max_points`)을 돌려줍니다. 실행을 접수할 때 최대 금액을 예약하고, 끝나면 실제 금액만 차감한 뒤 나머지를 돌려줍니다. 실제 차감액은 `run.billing.charged_points` 에서 확인합니다.

```js
import { randomUUID } from 'node:crypto';

const found = await client.searchSkills({ query: '상품명', limit: 5 });
const skillId = found.data.items[0].skill_id;
const detail = await client.getSkill(skillId);
const input = { product_name: '튼튼한 접이식 우산' };

const quote = await client.quoteSkill(skillId, input);   // 무료. 5분 동안 유효
const idempotencyKey = randomUUID();                      // 재시도할 때 같은 값을 다시 씁니다
let run = (await client.runSkill(skillId, input, {
  idempotencyKey, quoteId: quote.data.quote_id, maxCostPoints: quote.data.max_points
})).data;
while (!['succeeded', 'failed', 'timed_out', 'cancelled'].includes(run.status)) {
  await new Promise(resolve => setTimeout(resolve, 2000));
  run = (await client.getSkillRun(run.run_id)).data;
}
console.log(run.status, run.billing, run.result);
```

| 메서드 | 설명 |
| --- | --- |
| `searchSkills({ query, category, cursor, limit })` | 검색. `limit` 1~20, `category` 는 `SKILL_CATEGORIES` 중 하나 |
| `getSkill(skillId)` | 입력·결과 형식, 가격, 처리 상한, 예제 |
| `quoteSkill(skillId, input, { version })` | 입력 검사와 차감될 포인트 확인. 실행하지 않습니다 |
| `runSkill(skillId, input, { idempotencyKey, quoteId, maxCostPoints, version, waitSeconds })` | 실행. `idempotencyKey` 필수, `waitSeconds` 0~20(기본 20) |
| `getSkillRun(runId)` / `getSkillRunResult(runId)` | 실행 상태(성공하면 결과 포함) / 결과만 조회. 결과는 7일 동안 보관 |
| `cancelSkillRun(runId)` | 끝나지 않은 실행 취소. 취소된 실행은 차감되지 않습니다 |
| `skillUsage({ cursor, limit })` | 내 실행 내역. `limit` 1~50 |

- Skills 응답은 봉투 없이 `data` 에 그대로 담기며, 과금 상태는 `data.billing.status`(`reserved`·`captured`·`released`·`partially_refunded`·`refunded`)로 확인합니다. `meta.cost` 는 채워지지 않습니다.
- 20초 안에 끝나지 않으면 `status` 가 `queued`·`running` 인 채로 돌아오므로 `getSkillRun` 으로 확인하세요.
- 응답을 받지 못했을 때는 같은 `idempotencyKey` 로 다시 호출하세요. 포인트는 한 번만 차감됩니다. 같은 키에 다른 입력을 보내면 `IDEMPOTENCY_CONFLICT` 입니다.
- 접수 전 거절은 `ApickApiError`(`serviceCode`: `INVALID_INPUT`·`INSUFFICIENT_POINTS`·`PAYMENT_REQUIRED`·`PRICE_EXCEEDS_LIMIT`·`RATE_LIMITED` 등, `details` 에 부가 정보)로, 접수 뒤 실패는 `status` 와 `failure_code`(`EXECUTION_FAILED`·`OUTPUT_INVALID`·`TIMED_OUT`·`CANCELLED`·`UPSTREAM_UNAVAILABLE`)로 확인합니다.
- `uses_generative_ai` 가 true 인 Skill 은 생성형 AI 로 결과를 만듭니다. 중요한 판단에 쓰기 전에 확인하세요.

## 오류와 재시도

`ApickApiError`에는 공개 오류 정보인 `code`, `serviceCode`, `status`, `message`가 포함됩니다. SDK는 중복 호출과 중복 과금을 방지하기 위해 자동 재시도를 하지 않습니다. 재시도가 필요하면 작업의 멱등성과 오류 코드를 확인한 뒤 애플리케이션에서 명시적으로 결정하세요.
# TTS 검수와 재개

`getTtsQuality(jobId)`로 발화별 속도·실패 이유와 후보 목록을 조회합니다. 후보는 작업 종료 후 72시간 보존되며 `downloadTtsCandidate(jobId, candidateId)` 호출은 최종 MP3·ASS의 1회 다운로드를 소비하지 않습니다.

`retryTtsJob(jobId, ['u002'], idempotencyKey)`는 해당 발화의 기술적 복구를 같은 작업에서 요청합니다. 응답이 끊겨도 같은 키와 발화 목록을 사용하세요. 기술적 복구는 추가 과금하지 않으며, 재개 회차는 `resume_revision`으로 확인합니다. 필수 검수를 통과하지 못한 작업은 완료되지 않습니다.

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
