<div align="center">

# APICK API for Node.js

**에이픽 주요 API 20개를 API 키 하나로 간편하게 호출하는 공식 Node.js SDK**

**Official zero-dependency Node.js SDK for 20 popular APICK Korean data and AI APIs**

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
| `textToSpeech(text, options)` | 음성 합성 / Text to speech | Binary |
| `htmlToPdf(html, options)` | HTML→PDF | Binary |
| `jsonToExcel(data, options)` | JSON→Excel | Binary |
| `summarize(text)` | 텍스트 요약 / Text summarization | JSON |
| `polish(text)` | 텍스트 다듬기 / Text polishing | JSON |

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

## 신분증 마스킹 / Identity masking

```js
const resident = await apick.maskResidentNumber('./id-card.jpg', { type: 3 });
await resident.save('./masked.png');

const passport = await apick.maskPassport('./passport.jpg');
console.log(passport.data.result.fields);
```

`maskResidenceCard`, `maskPassport`, `maskIdCard`, `maskDriverLicense`는 JSON 결과를 반환합니다. `maskResidentNumber`는 PNG 바이너리를 반환하며 `type`은 `1`, `2`, `3` 중 하나입니다.
The four document-specific methods return JSON. `maskResidentNumber` returns PNG bytes and requires `type` 1, 2, or 3.

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
