# Changelog

## 3.7.0 — 2026-10-02

- `searchSkills()` 에 `sort` 를 추가했습니다: `recommended`(추천)·`popular`(인기)·`used`(많이 사용)·`likes`(좋아요순)·`rating`(평점순)·`new`(최신)·`mine`(내 계정이 많이 실행한 Skill)·`liked`(내 계정이 좋아요한 Skill). 생략하면 예전처럼 등록 순서입니다. 지원하지 않는 값은 요청 전에 `RangeError` 가 발생합니다. `SKILL_SORTS` 상수와 `SkillSort` 타입을 공개했습니다.
- Add `sort` to `searchSkills()`: `recommended`, `popular`, `used`, `likes`, `rating`, `new`, `mine` and `liked` (the last two are scoped to the API key's account). Omitting it keeps registration order. Unsupported values throw a `RangeError` before the request is sent. Export `SKILL_SORTS` and the `SkillSort` type.
- 검색·상세 응답 타입(`SkillSummary`·`SkillDetail`)에 `usage_label`(사용 건수 구간: `1,000회 미만`, `1,000+`, `1만+` …)·`like_count`·`review_count`·`rating_average` 를 추가했습니다. 검색어는 Skill 의 이름·요약·설명과 판매자 이름에서 찾습니다.
- Add `usage_label` (a usage tier, not an exact count), `like_count`, `review_count` and `rating_average` to the search and detail response types (`SkillSummary`, `SkillDetail`). The search query now matches a Skill's name, summary, description and seller name.
- 기존 메서드와 요청·응답 형식은 그대로입니다. / Existing methods and request/response formats are unchanged.

## 3.6.2 — 2026-10-02

- `TTS_VOICE_IDS`를 현재 지원하는 14개로 갱신했습니다. 제공이 종료된 `v2_ann_f_30s_01`, `v2_f_teen_01`을 상수·타입·문서에서 제거했으며, 이 값을 `voiceId`로 넘기면 요청 전에 `RangeError`가 발생합니다.
- Update `TTS_VOICE_IDS` to the 14 currently supported voices. The retired `v2_ann_f_30s_01` and `v2_f_teen_01` are removed from the constant, types and docs; passing them as `voiceId` now throws a `RangeError` before the request is sent.
- TTS 요금이 100자당 10포인트에서 "100자까지 30포인트, 이후 100자당 10포인트"로 바뀌었습니다(100자 30P, 101자 40P, 800자 100P). 한국어 읽기 자동 변환이 이 요금에 포함되며, 과금 기준은 계속 보낸 원문의 글자 수입니다.
- TTS pricing changed from 10 points per 100 characters to 30 points for up to 100 characters plus 10 points for each additional 100 characters (100 chars 30P, 101 chars 40P, 800 chars 100P). Automatic Korean reading conversion is included, and billing is still based on the character count of the text you send.
- 모든 TTS 요청에 한국어 읽기 전처리가 자동 적용되어 추가 옵션이나 별도 Skill 호출이 필요하지 않음을 README와 한국어·영어 가이드에 명시했습니다. 원문 기준 요금과 ASS 자막 표기는 유지되며, 정규화에 실패하면 원문으로 합성합니다. 공개 메서드와 요청·응답 형식은 변경하지 않았습니다.
- Clarify in the README and Korean/English guides that every TTS request automatically applies Korean reading normalization, with no extra option or separate Skill call. Billing and ASS subtitle spelling remain based on the original text; failed normalization falls back to synthesis from that text. No public method or request/response format changes.

## 3.6.1 — 2026-10-02

- `createTtsJob()`으로 접수한 문장의 숫자·단위·기호·영문 약어를 문맥에 맞는 한글 읽기로 자동 변환해 합성한다는 안내를 README와 한국어·영어 가이드에 추가했습니다. 과금 글자 수와 요금은 보낸 원문 기준이고 요청·응답 형식은 그대로이며, ASS 자막은 보낸 원문 표기로 제공됩니다. 문서만 바뀌었습니다.
- Document in the README and Korean/English guides that text passed to `createTtsJob()` has its numbers, units, symbols and English abbreviations automatically converted into context-appropriate Korean readings before synthesis. Billing is based on the text you send, request and response formats are unchanged, and ASS subtitles keep the text as you sent it. Documentation only.

## 3.6.0 — 2026-10-02

- Skills 메서드 8종을 추가했습니다: `searchSkills()`, `getSkill()`, `quoteSkill()`, `runSkill()`, `getSkillRun()`, `getSkillRunResult()`, `cancelSkillRun()`, `skillUsage()`. 요청·응답이 JSON 이며 응답은 봉투 없이 `data` 에 담깁니다.
- Add eight Skills methods to search, inspect, quote, run, read, fetch the result of, cancel and list Skill runs. Requests and responses are JSON; responses are returned as-is in `data`.
- `runSkill()` 은 `idempotencyKey` 가 필수이며 `Idempotency-Key` 헤더로 보냅니다. 결과가 약속한 형식으로 반환된 실행만 차감됩니다.
- 생성형 AI 를 쓰는 Skill 은 실행마다 실제 사용량만큼 금액이 달라집니다. `quoteSkill()` 이 예상 금액(`estimated_points`)과 최대 금액(`max_points`)을 돌려주며, `maxCostPoints` 에는 `max_points` 를 넘기세요.
- For Skills that use generative AI the charge varies per run with actual usage. `quoteSkill()` returns `estimated_points` and `max_points`; pass `max_points` as `maxCostPoints`.
- `runSkill()` requires `idempotencyKey`, sent as the `Idempotency-Key` header. Only runs that return a result in the promised format are charged.
- `ApickApiError` 에 선택적 `details` 를 추가했습니다. Skills 오류 코드는 `serviceCode` 로 전달됩니다. `SKILL_CATEGORIES` 상수와 Skills 타입(`SkillSummary`, `SkillDetail`, `SkillQuote`, `SkillRun` 등)을 공개했습니다.
- Add optional `details` to `ApickApiError`; Skills error codes are surfaced through `serviceCode`. Export `SKILL_CATEGORIES` and the Skills types.

## 3.5.0 — 2026-09-30

- 간편인증 조회 상품 2종을 추가했습니다. `requestCashReceiptDeduction()`/`getCashReceiptDeduction()`은 현금영수증 소득공제 내역을 `incomeYears`(1~3)로, `requestTaxReturnHistory()`/`getTaxReturnHistory()`는 국세 신고내역을 `years`(1~10)로 조회합니다.
- Add two simple-auth data products: cash receipt income deductions (`incomeYears` 1-3) and national tax return history (`years` 1-10), each with a `request*()`/`get*()` pair and result payload types.
- 유튜브 공개 영상 API 4종을 추가했습니다: `youtubeMetadata()`, `youtubeThumbnail()`(JPG), `youtubeSubtitleList()`, `youtubeSubtitle()`(VTT·SRT·TXT).
- Add four public YouTube video methods: metadata, thumbnail (JPG), subtitle language list, and subtitle download (VTT/SRT/TXT).

## 3.4.1 — 2026-09-28

- README와 한국어·영어 가이드의 간편인증 5종 예제에 모든 진행 상태와 `resultAvailable` 종료 기준을 적용했습니다. 전체·부분 성공, 인증 거부·만료·실패와 `RESULT_EXPIRED`를 구분합니다.
- Align all five simple-auth polling examples in the README and Korean/English guides with every progress state and the `resultAvailable` completion criterion. Distinguish full/partial success, rejected/expired authentication, failure, and `RESULT_EXPIRED`.
- 순차 폴링 간격을 5→10→20→30초로 늘린 뒤 30초를 유지하며, 인증·전체 대기시간 제한과 자동 재접수 방지를 안내합니다. 문서 코드를 직접 실행하는 회귀 테스트를 추가했습니다.
- Document sequential polling at 5→10→20→30 seconds, capped at 30 seconds, with authentication/overall waiting limits and no automatic resubmission. Add regression tests that execute the documentation examples.

## 3.4.0 — 2026-09-27

- 간편인증 기반 조회 상품 5종(재직·보험료 확인, 금융소득 조회, 국민연금 가입내역, 운전면허 조회, 국가 건강검진 결과)을 추가했습니다. 각 상품은 `request*()`로 본인 간편인증을 접수하고 `get*()`로 상태·결과를 폴링합니다.
- Add five simple-auth-based data lookup products (employment/insurance premium check, financial income, National Pension join history, driver's license, national health checkup). Each product accepts a `request*()` call for identity verification and polls status/result with `get*()`.
- `AUTH_PROVIDERS`(13종 간편인증 수단)와 `AuthProvider`, `DataRequestAcceptedData`, `DataRequestResult<T>` 타입, 상품별 결과 타입(`EmploymentResultPayload` 등)을 공개했습니다.
- Export `AUTH_PROVIDERS` (13 supported simple-auth providers), the `AuthProvider` type, `DataRequestAcceptedData`/`DataRequestResult<T>` envelopes, and per-product result payload types (e.g. `EmploymentResultPayload`).
- 재조회 만료(`RESULT_EXPIRED`)·인증 만료·거절·수집 실패는 `data.errorCode`로 구분됩니다.
- `RESULT_EXPIRED`, `AUTH_EXPIRED`, `AUTH_REJECTED`, and `COLLECT_FAILED` are surfaced through `data.errorCode`.

## 3.3.0 — 2026-09-21

- 모든 REST 요청의 인증 헤더를 `CL_AUTH_KEY` 에서 표준 `Authorization: Bearer <API 키>` 로 전환했습니다. 서버가 전환 기간 동안 두 헤더를 모두 받으므로 기존 호출도 계속 동작합니다.
- Send REST requests with the standard `Authorization: Bearer <API key>` header instead of `CL_AUTH_KEY`. Both headers are accepted during the migration window.
- Mask bearer tokens in error output alongside the legacy header.
- Synchronize all 16 current TTS voice IDs and masking type 4 with the public REST contract.

- Send all REST request bodies as multipart/form-data, including flattened nested arrays and objects. Keep existing method signatures and JSON/file responses.
- REST 요청을 multipart/form-data로 통일하고 중첩 입력·파일·불리언의 호환 테스트를 추가했습니다. 기존 메서드와 응답 타입은 유지합니다.
- Document OpenAPI/Postman downloads and compatibility with older JSON callers.

## 3.2.0 — 2026-09-14

- Seedance 참조 영상 작업에 `referenceAudios`(MP3·WAV) 입력을 추가했습니다.
- Add video generation version selection documentation and compatibility tests.
- 영상 생성 버전 선택, 버전별 옵션·요금 안내와 호환 검증을 추가했습니다.
- Add createVideoJob, getVideoJob, downloadVideoResult and public TypeScript types.
- Document and verify Seedance 2.0 Fast and Mini tier pass-through.

## 3.1.0 - 2026-09-08

- TTS 발화별 검수 이력, 후보 WAV 조회, 멱등 키를 사용하는 같은 작업 재개 메서드를 추가했습니다.
- Added TTS quality history, candidate WAV downloads, and idempotent job recovery methods.

## 3.0.0 - 2026-09-05

- 이미지 프롬프트 허용 길이를 최대 28,000자로 확대했습니다.
- 작업 접수 시 전체 포인트를 먼저 차감하고 실패한 이미지의 포인트를 즉시 환급하는 계약을 반영했습니다.
- 접수된 이미지 작업은 취소할 수 없도록 `cancelImageJob` 메서드와 `cancelled` 상태를 제거했습니다.

## 2.4.0 - 2026-09-05

- 이미지 장수 옵션을 의미가 분명한 `imageCount`로 바꾸고 압축 조정 옵션을 제거했습니다.
- 이미지 크기를 5개 표준 크기 중에서만 선택하도록 타입과 런타임 검증을 강화했습니다.
- 생성 요청에 선택적 `referenceImage`를 더해 참고 이미지와 텍스트를 함께 사용할 수 있습니다.

## 2.3.1 - 2026-09-05

- 이미지 편집 입력에서 마스크 파일을 제거하고 원본 이미지와 프롬프트만 받도록 계약을 단순화했습니다.

## 2.3.0 - 2026-09-05

- 이미지 생성·편집과 최대 50장 비동기 작업 메서드 8종을 추가했습니다.
- 이미지당 25포인트, 성공분 과금, 멱등 키, 24시간 결과 보관 계약을 문서화했습니다.

## 2.2.0 - 2026-09-03

- `maskResidenceCard()`의 개인정보 마스킹 대상을 외국인등록증·영주증·외국국적동포 국내거소신고증으로 확대했습니다.
- 요청·응답 형식과 `document_type: residence_card` 계약은 유지합니다.
- 진위확인 API의 지원 범위는 기존 외국인등록증으로 유지됩니다.

## 2.1.0 - 2026-09-01

- `downloadTtsSubtitles(jobId)`로 발화 타이밍 ASS 자막을 별도 1회 다운로드할 수 있습니다.
- TTS 상태 타입에 `subtitles_available`을 추가했습니다.
- 허용 IP 공란, 단일 IPv4·CIDR 등록, 즉시 반영 규칙을 한영 문서에 추가했습니다.

## 2.0.1 - 2026-08-31

- TTS 작업 취소 범위를 `waiting`과 `processing` 상태로 확장했습니다.
- 실행 중 취소도 접수 시 과금된 금액을 환불하지 않는 계약을 한영 문서에 반영했습니다.
- 17개 TTS `voice_id`의 사용자 표시 이름을 공개 문서에 추가했습니다.

## 2.0.0 - 2026-08-30

- 종료된 동기 `textToSpeech()` 계약을 제거했습니다.
- `createTtsJob()`, `getTtsJob()`, `cancelTtsJob()`, `downloadTtsResult()`로 비동기 한국어 TTS Jobs 계약을 제공합니다.
- 지원 목소리, 최대 800자, 상태 조회, 대기 중 취소, 결과 MP3(`audio/mpeg`) 1회 다운로드를 문서화했습니다.
- 정식 게시 전 지원 목소리를 17개 중립 내레이션 음성으로 확장하고 `TTS_VOICE_IDS`를 추가했습니다.

## 1.1.1 - 2026-08-30

- 공개된 25개 API 계약에 종료 대상 이미지 생성 기능이 포함되지 않았음을 재검증했습니다.
- 기능 및 메서드 호환성 변경 없이 릴리스 메타데이터를 갱신했습니다.

## 1.1.0 - 2026-08-29

- 주민등록번호, 외국인등록증, 여권, 주민등록증, 운전면허증 마스킹 메서드 5종을 추가했습니다.
- 신분증 처리 오류 코드를 `ApickApiError.serviceCode`로 제공합니다.

## 1.0.0

- Initial public release.
- Added 20 focused APICK service methods.
- Added JSON, multipart image upload, and binary file response support.
- Added ESM, CommonJS, and TypeScript declarations.
