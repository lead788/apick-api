# apick-api 한국어 가이드

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

TTS는 기존 남성 내레이터 5개와 신규 중립 내레이션 12개를 합쳐 17개 `voice_id`를 지원합니다. 정확한 목록은 `TTS_VOICE_IDS` 상수로 확인할 수 있습니다.

표시 이름: `narrator_m_01` 태준, `narrator_m_02` 민석, `narrator_m_03` 도현, `narrator_m_04` 강우, `narrator_m_05` 성훈, `narrator_f_10s_01` 서아, `narrator_f_10s_02` 하린, `narrator_f_10s_03` 예린, `narrator_m_20s_01` 도윤, `narrator_f_20s_01` 지안, `narrator_f_20s_02` 서윤, `narrator_f_20s_03` 소연, `narrator_f_20s_04` 유나, `narrator_m_30s_01` 현우, `narrator_m_30s_02` 준혁, `narrator_m_40s_01` 정우, `narrator_m_80s_01` 영수.

```js
const screenshot = await client.screenshot('https://example.com');
await screenshot.save('./example.jpeg');

const created = await client.createTtsJob('오늘의 이야기를 시작합니다.', { voiceId: 'narrator_m_03' });
const jobId = created.data.job_id;
let job = await client.getTtsJob(jobId);
while (job.data.status === 'waiting' || job.data.status === 'processing') {
  await new Promise(resolve => setTimeout(resolve, 3000));
  job = await client.getTtsJob(jobId);
}
if (job.data.status === 'completed') {
  const result = await client.downloadTtsResult(jobId);
  await result.save(`./${jobId}.mp3`); // audio/mpeg, 1회만 다운로드 가능
}

// 취소는 waiting 또는 processing 상태에서 가능하며 이미 과금된 금액은 환불되지 않습니다.
// 다운로드가 시작되면 서버 원본이 즉시 폐기되어 재다운로드할 수 없습니다.

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

## 오류와 재시도

`ApickApiError`에는 공개 오류 정보인 `code`, `serviceCode`, `status`, `message`가 포함됩니다. SDK는 중복 호출과 중복 과금을 방지하기 위해 자동 재시도를 하지 않습니다. 재시도가 필요하면 작업의 멱등성과 오류 코드를 확인한 뒤 애플리케이션에서 명시적으로 결정하세요.
