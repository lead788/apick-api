# apick-api English guide

## Request and response formats

All SDK requests with a body use `multipart/form-data`. Arrays use separate indexed fields such as `utterance_ids[0]`; let the SDK set the Content-Type boundary. GET requests have no body. The server continues accepting older JSON requests for compatibility.

The SDK preserves original LF/CR characters using UTF-8 Base64 and a `__apick_encoding[field]=base64-utf8` form metadata field. Excel cells also carry type metadata; dates become ISO strings and sparse array cells become null.

Responses remain service-specific JSON or direct files. A failed download may return JSON, which the SDK exposes as `ApickApiError`. Individual REST guides provide OpenAPI and Postman downloads. External MCP connections retain JSON-RPC.

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

TTS supports 16 voice IDs. Use `TTS_VOICE_IDS` and the developer guide for the current list.

`v2_ann_m_30s_01`, `v2_ann_m_30s_02`, `v2_ann_m_30s_04`, `v2_ann_m_30s_05`, `v2_ann_f_30s_01`, `v2_ann_f_30s_02`, `v2_ann_f_30s_03`, `v2_ann_f_30s_04`, `v2_ann_f_30s_05`, `v2_m_teen_01`, `v2_m_young_01`, `v2_m_mid_01`, `v2_m_senior_01`, `v2_f_teen_01`, `v2_f_young_01`, `v2_f_senior_01`

Numbers, units, symbols and English abbreviations in the text passed to `createTtsJob()` are automatically converted into context-appropriate Korean readings before synthesis (for example, `5번 버스` is read as "오 번 버스", `버튼을 5번` as "다섯 번", `-5℃` as "영하 오 도", and `인증번호 105028` digit by digit). The billed character count and price are based on the text you send, and the request and response formats are unchanged. To choose a reading yourself, spell it out in Hangul. ASS subtitles keep the text as you sent it.

```js
const screenshot = await client.screenshot('https://example.com');
await screenshot.save('./example.jpeg');

// Public YouTube videos: a video URL or the 11-character video ID
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

## Image AI

```js
const result = await client.generateImages('A clean product photo on white', {
  imageCount: 4, size: '1024x1024', outputFormat: 'webp',
  idempotencyKey: 'product-draft-001'
});

const referenceResult = await client.generateImages('Keep the product shape and composition, and change the background to a sunny kitchen', {
  referenceImage: './reference.png',
  referenceFilename: 'reference.png',
  referenceContentType: 'image/png'
});

const job = await client.createImageGenerationJob('Landscape article cover concepts', { imageCount: 20, size: '1536x1024' });
const status = await client.getImageJob(job.data.job_id);
```

`imageCount` is the number of images to make and defaults to one. Synchronous generation and editing support 1–4 images; job methods support 1–50. Add `referenceImage` to generation when the prompt should build from an existing composition, palette, or product shape. Editing accepts one PNG, JPEG, or WebP source up to 50 MB plus a prompt; mask files are not supported. Choose one of five sizes: `1024x1024`, `1536x1024`, `1024x1536`, `1152x864`, or `864x1152`; prompts may contain up to 28,000 characters. The full image count × 25 points is deducted when accepted, and 25 points are refunded immediately for every failed image. Accepted jobs cannot be cancelled. Results remain available for 24 hours.

`idempotencyKey` is a safety identifier that prevents duplicate generation and billing if a network problem sends the same request twice. Use 8–128 letters, numbers, underscores, or hyphens. Reuse it only for the exact same request and create a new value when the prompt or options change.

Methods: `generateImages`, `editImages`, `createImageGenerationJob`, `createImageEditJob`, `getImageJob`, `downloadImageJobImage`, and `downloadImageJobArchive`.

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

## Simple-auth data lookups

Employment, income, pension, driver's license, health checkup, cash receipt deduction, and tax return history lookups require the user's own simple-auth verification, so the call is split into acceptance (`request*`) and result polling (`get*`).

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

`AUTH_REQUESTED` and `AUTH_WAITING` wait for the user's approval; `AUTH_COMPLETED`, `COLLECTING`, and `COLLECTED` keep polling until a result is available. Billing fields (`charged`, `success`) do not indicate completion. Apply `expiresAt` only while awaiting approval, then use the overall waiting limit. The example's 10-minute limit is a client policy; configure the SDK's `timeoutMs` separately to bound each in-flight call. `AUTH_WAIT_TIMEOUT`, `CLIENT_POLL_TIMEOUT`, `RESULT_NOT_AVAILABLE`, `INVALID_RESULT`, and `UNKNOWN_STATUS` are local example errors that prevent endless polling on inconsistent responses or unknown states. Transport errors propagate without retries.

<!-- simple-auth-usage:start -->
```js
const accepted = await client.requestDrivingLicense({
  name: 'Hong Gildong',
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
    console.error('Result expired. Ask the user before starting a new authentication request.');
  } else {
    throw error;
  }
}
```
<!-- simple-auth-usage:end -->

Sources: [APICK development guide](https://apick.app/dev_guide/data_health_checkup) · [MCP 3.5.0 status contract](https://github.com/lead788/apick-mcp/blob/a803abcb81d07377c85f49bb0b670baf0c17ed04/TOOLS.md)

`authProvider` is one of the 13 values in `AUTH_PROVIDERS` (kakao, naver, toss, pass, samsung, kb, shinhan, hana, woori, ibk, nh, kakaobank, banksalad). Acceptance is billed at a flat rate; the result is billed only on its first return and free to re-poll afterward. `requestEmployment` takes an optional `insuranceYears` (1-3), `requestPersonalIncome` takes `incomeYears` (1-5), and `requestNpsJoinHistory` takes optional `from`/`to` (`YYYY-MM`). `requestCashReceiptDeduction` takes optional `incomeYears` (1-3) and `requestTaxReturnHistory` takes optional `years` (1-10). The remaining products are `requestDrivingLicense` and `requestHealthCheckup`.

## Skills

Search and run reviewed Skills. Each Skill fixes its input format (`input_schema`), output format (`output_schema`) and base amount (`price_points`). A run is charged only when a result in the promised format is returned.

For Skills that use generative AI (`usage_priced: true`) the actual usage of each run is added to the base amount, so the charge varies per run. `quoteSkill()` returns the estimated amount (`estimated_points`) and the maximum amount (`max_points`). The maximum is reserved when the run is accepted; when it finishes only the actual amount is charged and the rest is returned. Read the actual charge from `run.billing.charged_points`.

```js
import { randomUUID } from 'node:crypto';

const found = await client.searchSkills({ query: 'product name', limit: 5 });
const skillId = found.data.items[0].skill_id;
const detail = await client.getSkill(skillId);
const input = { product_name: 'Sturdy folding umbrella' };

const quote = await client.quoteSkill(skillId, input);   // free, valid for 5 minutes
const idempotencyKey = randomUUID();                      // reuse the same value when retrying
let run = (await client.runSkill(skillId, input, {
  idempotencyKey, quoteId: quote.data.quote_id, maxCostPoints: quote.data.max_points
})).data;
while (!['succeeded', 'failed', 'timed_out', 'cancelled'].includes(run.status)) {
  await new Promise(resolve => setTimeout(resolve, 2000));
  run = (await client.getSkillRun(run.run_id)).data;
}
console.log(run.status, run.billing, run.result);
```

| Method | Description |
| --- | --- |
| `searchSkills({ query, category, cursor, limit })` | Search. `limit` 1-20; `category` is one of `SKILL_CATEGORIES` |
| `getSkill(skillId)` | Input and output formats, price, limits, examples |
| `quoteSkill(skillId, input, { version })` | Validates the input and reports the points to be charged. Does not run |
| `runSkill(skillId, input, { idempotencyKey, quoteId, maxCostPoints, version, waitSeconds })` | Run. `idempotencyKey` is required; `waitSeconds` 0-20 (default 20) |
| `getSkillRun(runId)` / `getSkillRunResult(runId)` | Run status (with the result once succeeded) / result only. Results are kept for 7 days |
| `cancelSkillRun(runId)` | Cancel an unfinished run. Cancelled runs are not charged |
| `skillUsage({ cursor, limit })` | Your runs. `limit` 1-50 |

- Skills responses are returned as-is in `data`. Read the charge from `data.billing.status` (`reserved`, `captured`, `released`, `partially_refunded`, `refunded`); `meta.cost` is not populated.
- If a run does not finish within 20 seconds it comes back as `queued` or `running`; poll `getSkillRun`.
- If a response is lost, call again with the same `idempotencyKey`. Points are charged once. The same key with a different input is rejected with `IDEMPOTENCY_CONFLICT`.
- Rejections before acceptance throw `ApickApiError` (`serviceCode` such as `INVALID_INPUT`, `INSUFFICIENT_POINTS`, `PAYMENT_REQUIRED`, `PRICE_EXCEEDS_LIMIT`, `RATE_LIMITED`; extra information in `details`). Failures after acceptance are reported through `status` and `failure_code` (`EXECUTION_FAILED`, `OUTPUT_INVALID`, `TIMED_OUT`, `CANCELLED`, `UPSTREAM_UNAVAILABLE`).
- Skills with `uses_generative_ai: true` produce results with generative AI. Verify them before relying on them.

## Errors and retries

`ApickApiError` includes public error information: `code`, optional `serviceCode`, `status`, and `message`. The SDK does not retry automatically because a retry could duplicate an API call and its charge. If your application needs retries, decide explicitly after checking the error code and whether the operation is safe to repeat.
# TTS quality and recovery

Use `getTtsQuality(jobId)` to inspect utterance speed, rejection reasons, and candidate history. Candidates remain available for 72 hours after the job terminates. `downloadTtsCandidate(jobId, candidateId)` does not consume the final MP3 or ASS download.

`retryTtsJob(jobId, ['u002'], idempotencyKey)` requests technical recovery within the same job without an additional charge. Reuse the same key and utterance list after a lost response. Check `resume_revision` to identify the current revision. Required quality checks must pass before a job completes.

## Video model versions

Omitting `version` preserves Seedance 2.5, Veo 3.1 and Kling 3.0. Set `version` and `tier` explicitly to select a generation; jobs are never silently switched to another version. Submission and status responses include `version`.

Available generations: Seedance 1.0/1.5/2.0/2.5, including Seedance 2.0 Standard/Fast/Mini; Veo 3.1 (Standard/Fast/Lite); Kling 1.6/2.0/2.1/2.5/2.6/3.0/O1/O3. Veo 3.0 is unavailable. Seedance 2.0 Mini supports 480p/720p and 4–15 seconds. Modes, tiers, resolutions, durations, audio, file limits and prices vary by combination. See the [Seedance](https://apick.app/dev_guide/seedancejobs), [Veo](https://apick.app/dev_guide/veojobs) and [Kling](https://apick.app/dev_guide/klingjobs) version tables. Unsupported combinations are rejected before submission.

Seedance reference mode accepts `referenceImages`, `referenceVideos`, and `referenceAudios` (MP3/WAV) when supported by the selected version.

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
