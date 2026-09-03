# apick-api English guide

`apick-api` is the official zero-dependency Node.js SDK for a focused set of popular APICK REST APIs. It supports ESM, CommonJS, and TypeScript.

## Install and authenticate

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

Pass the API key only to the constructor. The SDK does not keep it in enumerable client properties and never prints it in logs or error messages.

Leave the allowed-IP list blank for unrestricted access. To restrict access, register the public IPv4 address seen by APICK as an exact address or CIDR such as `/32`. Changes apply immediately with no separate synchronization.

## Business, validation, and addresses

```js
const business = await client.businessDetails('439-87-00761');
const venture = await client.ventureBusiness('4398700761');
const email = await client.validateEmail('sample@example.com');
const phone = await client.validatePhone('01012341234');
const holidays = await client.holidays(2026, 10);
const addresses = await client.searchAddress('가산디지털로', { page: 1 });
```

Hyphens are removed from business numbers automatically. Invalid required values fail locally with `TypeError` or `RangeError` before an API request is sent.

## Parcel tracking

Use carrier-specific tracking when you know the carrier:

```js
const parcel = await client.trackParcel('cj', '123456789012');
```

Use automatic carrier detection when you only have the tracking number:

```js
const parcel = await client.trackParcelAuto('123456789012');
```

## Domain and search tools

```js
const dns = await client.dnsLookup('apick.app');
const location = await client.geolocate('apick.app');
const registration = await client.whois('apick.app');
const web = await client.googleSearch('APICK API', { page: 1 });
const images = await client.googleImageSearch('Seoul skyline', { page: 1 });
```

## OCR

OCR accepts PNG and JPEG files up to 50MB.

```js
const ocr = await client.ocr('./receipt.jpg');
console.log(ocr.data.result.full_text);
```

For in-memory input, supply a filename and MIME type when needed:

```js
await client.ocr(bytes, {
  filename: 'scan.png',
  contentType: 'image/png'
});
```

## Generated files

TTS supports 17 neutral narration `voice_id` values: five original narrators and twelve new voices. Import `TTS_VOICE_IDS` for the exact list.

Voice labels: `narrator_m_01` 태준, `narrator_m_02` 민석, `narrator_m_03` 도현, `narrator_m_04` 강우, `narrator_m_05` 성훈, `narrator_f_10s_01` 서아, `narrator_f_10s_02` 하린, `narrator_f_10s_03` 예린, `narrator_m_20s_01` 도윤, `narrator_f_20s_01` 지안, `narrator_f_20s_02` 서윤, `narrator_f_20s_03` 소연, `narrator_f_20s_04` 유나, `narrator_m_30s_01` 현우, `narrator_m_30s_02` 준혁, `narrator_m_40s_01` 정우, `narrator_m_80s_01` 영수.

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
  await result.save(`./${jobId}.mp3`); // audio/mpeg; downloadable once
  const subtitles = await client.downloadTtsSubtitles(jobId);
  await subtitles.save(`./${jobId}.ass`); // ASS subtitles; separately downloadable once
}

// Cancellation is available while waiting or processing and does not refund the accepted charge.
// MP3 and ASS downloads each consume their server copy immediately and cannot be repeated.

const pdf = await client.htmlToPdf('<h1>Report</h1>', { pagination: true });
await pdf.save('./report.pdf');

const excel = await client.jsonToExcel([{ item: 'A', count: 3 }], {
  sheetName: 'Inventory'
});
await excel.save('./inventory.xlsx');
```

Binary results expose `bytes`, `size`, `filename`, `contentType`, and `meta`. `save()` writes a file in Node.js, while `toBlob()` creates a standard `Blob`.

## Text AI

```js
const summary = await client.summarize(longText);
const polished = await client.polish(draftText);
```

Text input is limited to 100,000 characters.

## Response shape

JSON methods resolve to:

```ts
{
  data: unknown;
  meta: {
    cost: number | null;
    durationMs: number | null;
  };
}
```

`meta.cost` is the point charge reported by the API response. See the APICK documentation for current rates.

## Identity masking

```js
const png = await client.maskResidentNumber('./id-card.jpg', { type: 3 });
await png.save('./masked.png');

const result = await client.maskDriverLicense('./license.jpg');
console.log(result.data.result.fields);
```

The document-specific methods are `maskResidenceCard`, `maskPassport`, `maskIdCard`, and `maskDriverLicense`. Identity errors are exposed as `IDENTITY_TEXT_UNREADABLE`, `IDENTITY_DOCUMENT_MISMATCH`, or `IDENTITY_PROCESSING_FAILED` through `ApickApiError.serviceCode`.

`maskResidenceCard` accepts one front-side image of a residence card, permanent resident card, or overseas Korean resident card. Permanent and overseas Korean card support is limited to PII masking and does not expand the alien registration card authenticity-check scope.

## Errors and retries

`ApickApiError` includes public error information: `code`, optional `serviceCode`, `status`, and `message`. The SDK does not retry automatically because a retry could duplicate an API call and its charge. If your application needs retries, decide explicitly after checking the error code and whether the operation is safe to repeat.
