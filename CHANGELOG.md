## 6.1.0 (2026-10-28)

한 번의 간편인증으로 여러 조회를 처리하는 묶음 상품을 추가했습니다(서비스 목록 107개).
- `requestNpsBundle` / `getNpsBundle` — 국민연금 3종(가입내역·소득공제용 납부확인서·경력이력)을 한 번에 조회합니다. `NPS_BUNDLE_PRODUCTS`.
- `requestHometaxBundle` / `getHometaxBundle` — 개인 국세 9종 중 `products` 로 고른 조회만 실행합니다. `HOMETAX_BUNDLE_PRODUCTS`.
- `requestHometaxBizBundle` / `getHometaxBizBundle` — 사업자 국세 15종을 고른 만큼 실행합니다. 대표자 본인 확인이 필요해 `bind_id` 또는 `agreed: true` 를 함께 보냅니다. `HOMETAX_BIZ_BUNDLE_PRODUCTS`.
- `GOV24_BUNDLE_PRODUCTS` 를 13개에서 17개로 늘렸습니다(`military_service_cert`·`vehicle_register_doc`·`driver_career_cert`·`local_tax_clearance_cert`).
- 고른 상품만 실행하고, 과금은 고른 상품 단가의 합(또는 묶음 단가)으로 정해집니다. 모두 실패하면 과금되지 않습니다.

Bundles that run several lookups under one approval are now available (107 services). `requestNpsBundle`/`getNpsBundle` covers three pension lookups, `requestHometaxBundle`/`getHometaxBundle` runs the selected personal tax products, and `requestHometaxBizBundle`/`getHometaxBizBundle` runs the selected business tax products (requires `bind_id` or `agreed: true`). `GOV24_BUNDLE_PRODUCTS` now lists 17 keys. Billing is the sum of the selected products (or the fixed bundle price); an all-failure run is not charged.

## 6.0.1 (2026-10-26)

- 부동산·법인 등기 PDF 발급 결과에 응답 헤더의 작업 ID를 `ApickBinaryResult.jobId`로 제공합니다. 재다운로드용 ID 저장 예제를 추가했습니다. 다른 바이너리 결과 형식은 그대로입니다.
- Registry PDF issue results now expose the response header's job ID as `ApickBinaryResult.jobId`. The README shows how to save it for a later download. Other binary result shapes are unchanged.

## 6.0.0 (2026-10-25)

스킬 판매·실행은 [리퀘오 REQEO](https://reqeo.com/dev_guide/skills)로 이전했습니다. 계정·포인트·인증키는 별개입니다. 이 SDK의 기존 스킬 메서드는 요청을 보내지 않고 `SKILLS_MOVED`(410)를 반환합니다. 에이픽 인증키를 리퀘오에 보내지 마세요. 일반 API·TTS·설치형 에이전트는 계속 지원합니다.

Skill sales and execution have moved to [REQEO](https://reqeo.com/dev_guide/skills). Accounts, points and API keys are separate. Legacy Skill methods reject locally with `SKILLS_MOVED` (410) without making a request. Do not send your APICK key to REQEO. General APIs, TTS and the installed agent remain supported.

# 5.0.0

- 등기 열람·발급을 서버 계약에 맞췄습니다. `createRegistryRealestateJob`·`createRegistryCorporateJob`은 접수·결제·PDF 확보를 한 요청에서 끝내고 `ApickBinaryResult`(PDF, 건당 850P)를 돌려줍니다. 서버에서 사라진 상태 조회·다운로드 엔드포인트를 쓰던 `getRegistryJob`·`downloadRegistryPdf`와 `RegistryJob` 타입을 제거했습니다(파괴적 변경). PDF가 아직 준비되지 않았으면 `serviceCode` `REGISTRY_PDF_PREPARING`(0P)로 실패하며, 같은 `idempotencyKey`로 다시 보내면 추가 과금 없이 PDF를 받습니다.

- Registry view and issue now follow the server contract: `createRegistryRealestateJob` and `createRegistryCorporateJob` submit, pay and return the PDF (`ApickBinaryResult`, 850P per issue) in one request. `getRegistryJob`, `downloadRegistryPdf` and the `RegistryJob` type were removed because the status and download endpoints no longer exist (breaking change). While the PDF is being prepared the call fails with `serviceCode` `REGISTRY_PDF_PREPARING` (no charge); resend with the same `idempotencyKey` to get the PDF without another charge.

# 4.13.2

- 등기 접수 예시를 서버 동작에 맞췄습니다. 열람이 끝나 `completed`가 된 뒤 PDF가 준비되므로 `pdf_state`가 `ready`일 때 `downloadRegistryPdf()`를 부릅니다. 준비 중에 받으면 HTTP 202(`REGISTRY_PDF_PREPARING`, 0P)입니다. 메서드와 엔드포인트는 바뀌지 않습니다.

- The registry example now waits for `pdf_state: ready` after `completed` before calling `downloadRegistryPdf()`; downloading while the PDF is prepared returns HTTP 202 (`REGISTRY_PDF_PREPARING`, no charge). Methods and endpoints are unchanged.

# 4.13.1

- 요금 안내 문구를 서버와 맞췄습니다. `README.md`·`docs/subagent.md`·`docs/tts.md`에서 시행일(2026-11-06)과 소수점 올림 표기를 뺐습니다. 요금과 메서드·타입은 바뀌지 않았습니다.

- Pricing notes now match the server: the effective date (2026-11-06) and the rounding note were removed from `README.md`, `docs/subagent.md` and `docs/tts.md`. Prices, methods and types are unchanged.

# 4.13.0

- 신규 API 메서드 26개를 추가했습니다(서비스 목록 104개).
  - 공간정보 13종: `geoStandardize`·`geoBatchGeocode`·`geoReverse`·`geoAddressSearch`·`geoPlaceSearch`·`geoAdminCode`·`geoCompareAddress`·`geoMeasure`·`geoGeojsonAnalyze`·`geoAddressQuality`·`geoAddressAutocomplete`·`geoDistrictBoundary`·`geoNeighborhood`. JSON 본문으로 보내 주소 목록·좌표 배열·GeoJSON 객체를 그대로 넘깁니다.
  - 차량: `vehicleEmission(certNo)`, `vehicleRecall({ carNo | vin })`(리콜 대상이 아니면 0P), `hipassUnpaid(carNo)`(미납이 없으면 0P), `vehicleTaxCalc(cc, { carAgeYears, year })`.
  - 기업·부동산: `corpFinance(crno, options)`, `buildingRegister(options)`, `appReviews(appId, options)`.
  - 등기: `registryRealestateSearch(query)`, `registryCorporateSearch({ corpRegNo | bizNo })`, `createRegistryRealestateJob(options)`, `createRegistryCorporateJob(options)`, `getRegistryJob(jobId)`, `downloadRegistryPdf(jobId)`.
- `rtmsRent(lawdCd, dealYmd, { includeTrade: false })`로 같은 단지 매매가 비교(전세가율) 없이 임대 분석만 받을 수 있습니다.
- 서버 변경: 위 API와 입찰·부동산 분석의 입력 오류는 HTTP 400, 공간정보에서 위치·주소·장소를 찾지 못한 경우는 404로 응답합니다. 본문의 `data.error`와 과금(0P)은 그대로입니다.
- 문서의 상품 이름을 서버 공개 명칭에 맞췄습니다(`민원서류 통합 조회`, `세무 민원증명`). 메서드 이름과 엔드포인트는 바뀌지 않습니다.

- Added 26 methods (104 listed services): 13 geo methods sent as JSON bodies, vehicle emission/recall/unpaid-toll/tax methods (recall and unpaid-toll checks are free when nothing is found), `corpFinance`, `buildingRegister`, `appReviews`, and registry search, job, status and PDF download methods.
- `rtmsRent(..., { includeTrade: false })` skips the same-complex sale comparison.
- Server change: input errors for these APIs and the bid/real-estate analytics now return HTTP 400, and geo lookups that find no location, address or place return 404. `data.error` and the 0P charge are unchanged.
- Product names in the docs now match the server (`민원서류 통합 조회`, `세무 민원증명`). Method names and endpoints are unchanged.

# 4.12.1

- 요금 안내 문구를 정리했습니다. 모델별 판매 단가, 실제 사용량 기준, 기본요금·소수점 올림, 견적 API처럼 청구되는 결과만 적습니다. 에이전트 상품 응답 타입에서 더 이상 내려오지 않는 요금 필드 하나를 뺐습니다. 요금과 동작은 바뀌지 않습니다.

- Billing notes now describe only what you are charged: per-model rates, actual usage, base fees, rounding and the quote API. Removed one billing field from the agent product type that the server no longer returns. Prices and behaviour are unchanged.

# 4.12.0

- 입찰·부동산 분석 4종을 SDK에 추가했습니다. `bidNotice(options)`·`bidAward(options)` 는 공공기관 입찰공고의 예산구간·발주기관·업종 분포와 마감 임박도, 낙찰률 분포·업체 집중도를 분석합니다. `rtmsTrade(lawdCd, dealYmd, options)` 는 매매 실거래의 ㎡당 중위가·면적/가격/층 분포·시세 이탈 거래를, `rtmsRent(lawdCd, dealYmd, options)` 는 전세 비중·보증금/월세 분포·매매 대비 전세가율을 계산합니다. 응답은 `summary`·`distribution`·`insights` 중심이며 원본 목록(`items`·`totalCount`)은 제공하지 않습니다.

- Added four bid and real-estate analytics methods. `bidNotice(options)` and `bidAward(options)` analyse public-sector bid notices (budget, agency and industry distributions, closing urgency) and award results (success-rate bands, winner concentration). `rtmsTrade(lawdCd, dealYmd, options)` covers median price per square metre, area/price/floor bands and price outliers, while `rtmsRent(lawdCd, dealYmd, options)` computes jeonse share, deposit and monthly-rent bands and the jeonse ratio against sale prices. Responses centre on `summary`, `distribution` and `insights`; raw lists (`items`, `totalCount`) are not returned.

# 4.11.0

- 증빙서류 통합발급 묶음 2종을 추가했습니다. `requestIncomeCertBundle()`·`getIncomeCertBundle()`은 소득금액증명과 연금보험료등 소득세액 공제확인서를, `requestBusinessCertBundle()`·`getBusinessCertBundle()`은 사업자등록증명·부가가치세 과세표준증명·표준재무제표증명을 휴대폰 승인 한 번으로 함께 발급합니다. 접수 20P, 최초 결과는 84P·126P입니다. 사업자 묶음은 `business_no`와 대표자 본인 확인(`agreed: true` 또는 `bind_id`)이 없으면 서버를 부르기 전에 `TypeError`를 던집니다.
- Added two certificate bundles: `requestIncomeCertBundle()`/`getIncomeCertBundle()` (income amount and pension credit certificates) and `requestBusinessCertBundle()`/`getBusinessCertBundle()` (business registration, VAT tax base and standard financial statement certificates), issued after a single phone approval. 20P on acceptance, 84P/126P on the first result. The business bundle throws a `TypeError` before calling the server when `business_no` or representative consent (`agreed: true` or `bind_id`) is missing.
- Added `registryDocVerify(issueNo, options)` for `POST /rest/registry_doc_verify`. Pass the 12-character verification number printed on an issued Korean registration certificate (hyphens and spaces are accepted) and optionally `kind` (`realestate` default, `corporate`, `movable`). Returns `verified`, `status`, `message`, `document`, `issued_date` and `registry_office` at 60P per lookup. The certificate contents and any PDF are not returned, and verification is limited to certificates issued within the last three months.
- 등기·증명서 발급확인 `registryDocVerify(issueNo, options)` 를 추가했습니다. 증명서에 인쇄된 발급확인번호 12자리(하이픈·공백 허용)와 문서 종류 `kind`(`realestate` 기본·`corporate`·`movable`)를 넘기면 발급 사실 여부(`verified`)·상태(`status`)·증명서 종류·발급일·등기소를 건당 60P로 돌려줍니다. 증명서 원문(PDF)과 기재 내용은 제공하지 않으며, 발급일로부터 3개월 이내 발급분만 확인됩니다.
- Added `courtAuction(caseNo, court)` for `POST /rest/court_auction`. A case number is managed per court, so the court (name such as `서울중앙지방법원` or code such as `B000210`) is required. Returns case details (receipt date, claim amount, judge department, status), sale items (address, appraised price, minimum price, failed count, sale date/time, deposit rate), the sale schedule, the dividend claim deadline and related cases at 60P per lookup. Bidding assistance and bid form preparation are not provided.
- 법원 경매사건 조회 `courtAuction(caseNo, court)` 를 추가했습니다. 사건번호는 법원별로 관리되므로 법원(이름 `서울중앙지방법원` 또는 코드 `B000210`)이 함께 필요합니다. 사건 기본정보(접수일·청구금액·재판부·진행상태), 매각물건(소재지·감정가·최저매각가·유찰 횟수·매각기일·입찰보증금 비율), 매각기일 묶음, 배당요구종기, 관련 사건을 건당 60P로 돌려줍니다. 입찰대행·입찰서 작성은 제공하지 않습니다.
- Added `requestBusinessRegistrationCert(input)` / `getBusinessRegistrationCert(transactionId)`, `requestVatTaxBaseCert()` / `getVatTaxBaseCert()`, `requestFinancialStatementCert()` / `getFinancialStatementCert()` and `requestClosureCert()` / `getClosureCert()` for `POST /rest/req_*` and `POST /rest/get_*`. All four target a registered business, so `business_no` (10 digits) is required in addition to `year`, `use_purpose`, `submit_to` and `delivery` where applicable, and each issuance is a flat 60P. `period` (`1`, `2` or `all`) selects the VAT period for `requestVatTaxBaseCert()`.
- 사업자 단위 증명 4종을 추가했습니다. 사업자등록증명 `requestBusinessRegistrationCert()`·`getBusinessRegistrationCert()`, 부가가치세 과세표준증명 `requestVatTaxBaseCert()`·`getVatTaxBaseCert()`, 표준재무제표증명 `requestFinancialStatementCert()`·`getFinancialStatementCert()`, 폐업사실증명 `requestClosureCert()`·`getClosureCert()` 이며 모두 등록된 사업자를 대상으로 하므로 `business_no`(10자리)가 필수입니다. 발급 1건은 60P 정액이고 과세표준증명의 과세기간은 `period`(`1`·`2`·`all`)로 고릅니다.

# 2026-10-19 서버 동작 안내 / Server behavior notes

- 차량정보는 공백·대소문자가 다른 동일 등급을 우선해 찾으며 연식·사양이 다른 차량은 구분합니다. 기존 `안내`에서 연식·사양 대체, 사양 충돌, 국내 출시 여부 확인 보류, 일부 제원의 추가 검증 상태를 확인할 수 있습니다. 국내 미출시가 확인된 차량은 해외 자료 기준이며 100% 정확성을 보장하지 않는다는 안내가 추가됩니다. 반환된 연식·등급과 안내를 확인하세요. 입력·응답 구조와 과금 방식은 유지됩니다.
- Vehicle information prioritizes the same trim across spacing and case variations while distinguishing model years and specifications. The existing `안내` notice can describe year/specification substitutions, conflicting specifications, unverified Korean-market availability, or specifications still under review. Confirmed non-Korean-market vehicles receive an additional notice that overseas data does not guarantee 100% accuracy. Check the returned year, trim and notices. Request/response shapes and billing behavior remain unchanged.
- 유효한 특장차 전고와 전기차 CO₂ 배출량 0을 보존합니다. 누락값은 0으로 대체하지 않습니다.
- Valid special-body vehicle heights and zero CO₂ emissions for electric vehicles are preserved. Missing values are not replaced with zero.

# 4.8.2

- 차명에 등급·연식·좌석을 함께 넣을 수 있습니다(`파나메라 gts 4인승 19년식`, `PANAMERA GTS 19년`). 입력한 연식·등급을 우선하며 좌석 수는 실제 제원과 일치해야 합니다. 근접 연식을 선택하면 반환 연식과 안내를 확인하세요. 지정 등급을 찾지 못하거나 확신이 낮으면 제원 없이 무료 후보만 반환하며, 유사 차량이 전혀 없으면 없음 오류로 응답하고 과금하지 않습니다. 별도 연식·등급과 문장 조건이 충돌하면 입력 오류입니다.
- Put the model, trim, year and seat count in model (for example, PANAMERA GTS 19년). Matching prioritizes the supplied year and trim, and the seat count must match the specification. Check the returned year and notice when a nearby year is selected. Unmatched trims and low-confidence matches return suggestions without specifications or charges; no similar vehicle returns a no-result error without charging. Conflicting explicit and free-text constraints are rejected.

# 4.9.1

- Added `requestIncomeAmountCert(input)` / `getIncomeAmountCert(transactionId)`, `requestPensionCreditCert()` / `getPensionCreditCert()`, `requestFactCert()` / `getFactCert()` and `requestTaxClearanceCert()` / `getTaxClearanceCert()` for `POST /rest/req_*` and `POST /rest/get_*`. All four issue a Hometax certificate for the authenticated person at a flat 60P per issuance and require `year`, `use_purpose`, `submit_to` and `delivery`. `format` (`pdf`, `json` or `both`; default `both`) selects the response; with `json`/`both` the issued PDF is parsed into `PDF데이터.필드`. The structured values in the result body are authoritative and parsed fields may be empty depending on the table layout. Certificates that need a registered business (business registration, VAT tax base, financial statements) are not part of this release.
- 세무 민원증명 4종을 추가했습니다. 소득금액증명 `requestIncomeAmountCert()`·`getIncomeAmountCert()`, 연금보험료등 소득세액 공제확인서 `requestPensionCreditCert()`·`getPensionCreditCert()`, 납부내역증명 `requestFactCert()`·`getFactCert()`, 납세증명서 `requestTaxClearanceCert()`·`getTaxClearanceCert()` 이며 `POST /rest/req_*`·`POST /rest/get_*` 를 씁니다. 모두 신청인 본인명의 발급이고 발급 1건은 60P 정액이며 `year`·`use_purpose`·`submit_to`·`delivery` 가 필수입니다. `format`(`pdf`·`json`·`both`, 기본 `both`)으로 응답을 고르고 `json`·`both` 이면 발급된 PDF를 파싱한 `PDF데이터.필드` 가 함께 옵니다. 구조화 값은 결과 본문이 정본이고 표 구조에 따라 파싱 필드가 비어 있을 수 있습니다. 사업자 세적이 필요한 사업자등록증명·부가가치세 과세표준증명·표준재무제표증명은 이번 배포에 포함하지 않았습니다.

# 4.9.0

- Added `requestResidentRegistration(input)` / `getResidentRegistration(transactionId)` for `POST /rest/req_resident_registration` and `POST /rest/get_resident_registration`, and `requestResidentRegistrationCho(input)` / `getResidentRegistrationCho(transactionId)` for the 초본 variant. Both require the registered address (`sido`, `sigungu`) and optionally take `purposeCd`, `submitTarget`, `includeAddressHistory` and `includeHousehold` (`Y`/`N`). Each issued copy costs 80P and the result includes the original PDF as base64 (`발급문서`) with its filename, SHA-256 (`문서해시`) and byte size (`문서크기`).
- Added `requestGov24Bundle(input)` / `getGov24Bundle(transactionId)` for `POST /rest/req_gov24_bundle` and `POST /rest/get_gov24_bundle` — one simple-auth approval for the selectable Government24 products. `products` picks any subset of the 13 keys exported as `GOV24_BUNDLE_PRODUCTS`; the bill is the sum of the selected products (resident registration 80P each) and unselected products are never verified or collected. `sido`/`sigungu` are required only when a resident registration certificate is selected. Result sections use camelCase keys (`residentRegistration`, `residentRegistrationCho`, …).
- `requestResidentRegistration()`·`getResidentRegistration()`(`POST /rest/req_resident_registration`·`POST /rest/get_resident_registration`)와 초본용 `requestResidentRegistrationCho()`·`getResidentRegistrationCho()`를 추가했습니다. 주민등록 주소지 `sido`·`sigungu`가 필수이고 `purposeCd`·`submitTarget`·`includeAddressHistory`·`includeHousehold`(`Y`/`N`)를 선택으로 받습니다. 발급 1건은 80P이며 결과에는 PDF 원본 base64(`발급문서`)와 파일명·SHA-256(`문서해시`)·바이트 크기(`문서크기`)가 함께 옵니다.
- 민원서류 통합 조회 `requestGov24Bundle()`·`getGov24Bundle()`(`POST /rest/req_gov24_bundle`·`POST /rest/get_gov24_bundle`)를 추가했습니다. 간편인증 1회로 `products`에 고른 상품만 조회하며, 선택 가능한 13개 키는 `GOV24_BUNDLE_PRODUCTS`로 제공합니다. 과금은 고른 상품 단가의 합(등본·초본 각 80P)이고 고르지 않은 상품은 인증·조회하지 않습니다. `sido`·`sigungu`는 등본·초본을 고를 때만 필요합니다. 결과 섹션 키는 camelCase(`residentRegistration`, `residentRegistrationCho` 등)입니다.

# 4.8.1

- `vehicleModelInfo(options)` also covers motorcycles and scooters alongside passenger cars; the `차체형상` value adds 스쿠터, 언더본, 네이키드, 스포츠바이크, 투어링바이크, 크루저, 어드벤처, 오프로드 and 클래식바이크. Request and response shapes are unchanged.
- `vehicleModelInfo(options)` 가 승용차에 더해 오토바이·스쿠터 같은 이륜차도 조회합니다. `차체형상` 값에 스쿠터·언더본·네이키드·스포츠바이크·투어링바이크·크루저·어드벤처·오프로드·클래식바이크가 추가됩니다. 요청·응답 형식은 바뀌지 않았습니다.

# 4.8.0

- `vehicleModelInfo(options)` now finds the closest model when the brand, model name or trim is written differently (`아반테`/`아반떼`, `K5 하이브리드`/`K5`, `520i`/`5시리즈`). A high-confidence match returns the specification plus `추천` (`자동선택: true`, `대안`); a low-confidence match returns `추천.대안` only and is not billed. When the requested trim has no specification, the response keeps the same model's base specification and adds `제원.등급후보` and `안내` instead of silently returning a different trim.
- 브랜드·차명·등급 표기가 달라도(`아반테`/`아반떼`, `K5 하이브리드`/`K5`, `520i`/`5시리즈`) `vehicleModelInfo(options)` 가 가장 비슷한 차종을 찾습니다. 확신이 높으면 제원과 함께 `추천`(`자동선택: true`, `대안`)을 주고, 낮으면 `추천.대안` 만 주며 과금하지 않습니다. 지정한 등급의 제원이 없으면 다른 등급을 조용히 돌려주지 않고 같은 차명의 기본 제원과 `제원.등급후보`, `안내` 를 함께 줍니다.

- Added `requestNpsDeductionCert(input)` / `getNpsDeductionCert(transactionId)` for `POST /rest/req_nps_deduction_cert` and `POST /rest/get_nps_deduction_cert` — the National Pension payment certificate used for income deduction. Takes an optional `years` (1-5, default 1) and returns per-year paid amounts (`연도별내역`) for workplace subscribers, regional subscribers, retroactive payments, additional payments and unemployment credit, plus the certificate holder name and birth date.
- Added `requestNpsCareerHistory(input)` / `getNpsCareerHistory(transactionId)` for `POST /rest/req_nps_career_history` and `POST /rest/get_nps_career_history` — employment career history derived from the join history. Takes optional `from`/`to` (`YYYY-MM`) and returns workplace careers (`경력`) with the workplace name, period, last standard monthly income, paid and unpaid months and paid amount, a per-workplace summary (`합계`), and periods without a workplace such as regional subscribers (`사업장외가입`). Both share one phone approval with `requestNpsJoinHistory` and are billed the same way (acceptance is billed, the first result is billed, re-reads are free).
- 국민연금 소득공제용 납부확인서 조회 메서드 `requestNpsDeductionCert()` / `getNpsDeductionCert()` 를 추가했습니다(`POST /rest/req_nps_deduction_cert`·`POST /rest/get_nps_deduction_cert`). 선택 입력 `years`(1~5, 기본 1)를 받고 발급연도별 납부금액(`연도별내역`: 사업장가입자 고지·지역가입자 등 납부·소급·추납·실업크레딧·총합계)과 증명서의 이름·생년월일을 돌려줍니다.
- 국민연금 경력 이력 조회 메서드 `requestNpsCareerHistory()` / `getNpsCareerHistory()` 를 추가했습니다(`POST /rest/req_nps_career_history`·`POST /rest/get_nps_career_history`). 가입내역에서 사업장 단위 경력을 파생하며 선택 입력 `from`/`to`(`YYYY-MM`)를 받습니다. 사업장명·기간·기준소득월액·납부개월·미납개월·납부금액(`경력`), 사업장 기준 합계(`합계`), 지역가입 등 사업장이 없는 구간(`사업장외가입`)을 돌려줍니다. 두 상품 모두 `requestNpsJoinHistory` 와 승인 1회를 공유하고 과금 방식도 같습니다(접수 과금, 최초 결과 과금, 재조회 무료).

# 4.7.0

- Added `vehicleModelInfo(options)` for `POST /rest/vehicle_model_info` — look up Korean-market vehicle model specifications (dimensions, engine, efficiency, tires, trim candidates) by brand, model name, model year and trim. Every input field is optional: with no `model` the response is the brand or model list and the call is free, and an unknown model or a model without specifications fails without being charged. Specification values come back in fixed standard notation (`연료` gasoline·diesel·LPG·electric·hydrogen·hybrid, `구동방식` front·rear·2WD·AWD, `변속기` `자동 8단`·`DCT 7단`·`CVT`, `에너지효율등급` `1등급`~`5등급`), with multiple values joined by `+`.
- 차종별 차량정보 조회 메서드 `vehicleModelInfo(options)` 를 추가했습니다(`POST /rest/vehicle_model_info`). 브랜드·차명·연식·등급으로 배기량·연비·치수·타이어·등급 후보 같은 제원을 조회합니다. 입력은 모두 선택이며 `model` 을 비우면 브랜드·차종 목록을 무료로 돌려주고, 없는 차종이나 제원이 아직 없는 차종은 과금 없이 실패합니다. 제원 값은 고정된 표준 표기로만 내려갑니다(연료·구동방식·변속기·차체형상·에너지효율등급, 여러 값은 `+` 연결).

# 4.6.0

- Removed the collection-job methods `createInstagramPostsJob()`, `createInstagramCommentsJob()`, `createTiktokSearchJob()`, `createTiktokVideoJob()`, `createTiktokCommentsJob()`, `createAmazonReviewsJob()`, `createGoogleMapsPlaceJob()`, `getScrapeJob()` and `waitForScrapeJob()` and their types (`ScrapeJobProduct`, `ScrapeJobOptions`, `ScrapeJob<T>`) — every request is now a single synchronous call. The synchronous methods (`amazonProduct()`, `xProfile()`, `xPost()`, `googleMapsSearch()`, `youtubeComments()`, …) are unchanged.
- Results of retired job submissions already accepted are still settled by the server; `apick-mcp` 4.6.0 matches this release.
- 결과 건수 과금 수집 작업 메서드 `createInstagramPostsJob()`·`createInstagramCommentsJob()`·`createTiktokSearchJob()`·`createTiktokVideoJob()`·`createTiktokCommentsJob()`·`createAmazonReviewsJob()`·`createGoogleMapsPlaceJob()`·`getScrapeJob()`·`waitForScrapeJob()` 과 타입(`ScrapeJobProduct`, `ScrapeJobOptions`, `ScrapeJob<T>`)을 제거했습니다. 모든 요청은 단발 동기 호출만 사용합니다. 동기 메서드(`amazonProduct()`, `xProfile()`, `xPost()`, `googleMapsSearch()`, `youtubeComments()` 등)는 그대로입니다.
- 이미 접수된 작업의 정산은 서버가 계속 처리합니다. `apick-mcp` 4.6.0 과 같은 계약입니다.

# 4.5.0

- Added `coupangProduct(urlOrProductId)`, `naverShoppingProduct(url)`, `linkedinProfile(url)`, `linkedinCompany(url)` and `linkedinJob(url)` with the matching result types (`CoupangProduct`, `NaverShoppingProduct`, `LinkedinProfile`, `LinkedinCompany`, `LinkedinJob`). Coupang takes a product number or `/vp/products/{id}` URL, Naver takes a brand store product URL (`brand.naver.com/{store}/products/{id}`), and LinkedIn takes profile (`/in/`), company (`/company/`) or job posting (`/jobs/view/`) URLs. Each call is synchronous; failed calls are not charged.
- 쿠팡 상품·네이버 브랜드스토어 상품·링크드인 프로필/회사/채용공고 조회 메서드 `coupangProduct()`·`naverShoppingProduct()`·`linkedinProfile()`·`linkedinCompany()`·`linkedinJob()` 과 결과 타입(`CoupangProduct`, `NaverShoppingProduct`, `LinkedinProfile`, `LinkedinCompany`, `LinkedinJob`)을 추가했습니다. 쿠팡은 상품 번호나 `/vp/products/{번호}` 주소, 네이버는 브랜드스토어 상품 주소(`brand.naver.com/{스토어}/products/{번호}`), 링크드인은 프로필(`/in/`)·회사(`/company/`)·채용공고(`/jobs/view/`) 주소를 받습니다. 모두 동기 응답이며 실패한 호출은 과금되지 않습니다.

# 4.4.0

- Removed the YouTube download methods `youtubeFormats()`, `downloadYoutubeVideo()` and `downloadYoutubeAudio()` and their result types (`YoutubeFormats`, `YoutubeVideoFormat`, `YoutubeAudioFormat`, `YoutubeDownloadLink`, `YoutubeVideoDownloadOptions`, `YoutubeAudioDownloadOptions`) — the matching endpoints are gone. `youtubeMetadata()`, `youtubeThumbnail()`, `youtubeSubtitleList()`, `youtubeSubtitle()`, `youtubeSearch()`, `youtubeChannel()`, `youtubePlaylist()`, `youtubeHashtag()` and `youtubeComments()` are unchanged.
- 유튜브 다운로드 메서드 `youtubeFormats()`·`downloadYoutubeVideo()`·`downloadYoutubeAudio()` 와 결과 타입(`YoutubeFormats`, `YoutubeVideoFormat`, `YoutubeAudioFormat`, `YoutubeDownloadLink`, `YoutubeVideoDownloadOptions`, `YoutubeAudioDownloadOptions`)을 제거했습니다(해당 엔드포인트 종료). `youtubeMetadata()`·`youtubeThumbnail()`·`youtubeSubtitleList()`·`youtubeSubtitle()`·`youtubeSearch()`·`youtubeChannel()`·`youtubePlaylist()`·`youtubeHashtag()`·`youtubeComments()` 는 그대로입니다.

# 4.3.1

- Pricing notes (Terms art. 9 amended, effective 2026-11-06): TTS synthesis has a 5-point base fee per job and result-billed collection jobs have a 10-point base fee per job with results (Instagram comments 50). Fractional points are rounded up (0.1 → 1) and every billed use is at least 1 point. No method or type changes.
- 요금 안내 갱신(이용약관 제9조 개정, 2026-11-06 시행): TTS 합성 작업당 기본요금 5P, 결과 건수 과금 수집 작업은 결과가 있을 때 작업당 10P(인스타그램 댓글 50P)입니다. 포인트 계산의 소수점은 올림하며(0.1P → 1P) 과금되는 이용 1건은 최소 1P입니다. 메서드·타입 변경은 없습니다.
- 에이픽 에이전트(`apick-agent`) 안내: AI 사용 작업 기본 5P(2026-11-06부터), 캐시 재사용 1P로 표기를 실제 요금에 맞췄습니다. / `apick-agent` notes now match billing: 5-point base fee for AI jobs from 2026-11-06, cache reuse 1 point.

# 4.3.0

- Add `createGoogleMapsPlaceJob(placeIdOrUrl)` with the `GoogleMapsPlace` result type: rating, reviews count, 1-5 star distribution, top reviews (up to 10), opening hours, busy hours, similar places and photos. 20 points per place, refunded if not found; text is returned in English.
- 구글 지도 장소 상세·별점 분포·대표 리뷰(최대 10건) 조회 접수 메서드 `createGoogleMapsPlaceJob` 과 결과 타입 `GoogleMapsPlace` 를 추가했습니다. 건당 20포인트, 장소를 찾지 못하면 환불됩니다.

# 4.2.1

- `youtubeSubtitle()` fails with guidance to use an original-language track when an auto-translated caption (`translated: true`) is refused; such calls are not charged. Examples now pick a manual or original-language track. YouTube requests interrupted by a server restart are retried automatically.
- 자동 번역 자막(`translated: true`)을 받지 못하면 원어 자막을 쓰라는 안내와 함께 실패로 응답합니다(과금 없음). 예제는 수동·원어 자막을 고르도록 바꿨습니다. 서버 재시작으로 끊긴 유튜브 요청은 서버가 자동으로 다시 시도합니다.

# 4.2.0

- Add `amazonProduct`, `xProfile` and `xPost`, and collection jobs `createInstagramPostsJob`, `createInstagramCommentsJob`, `createTiktokSearchJob`, `createTiktokVideoJob`, `createTiktokCommentsJob`, `createAmazonReviewsJob` with `getScrapeJob` and `waitForScrapeJob`, all with typed results.
- Collection jobs reserve `maxResults` × unit price and charge only the results actually returned; failures are fully refunded and results are kept for 72 hours.
- 아마존 상품, X 프로필·게시물 조회와 인스타그램 게시물 목록·댓글, 틱톡 키워드 검색·영상·댓글, 아마존 리뷰 수집 작업 메서드, 작업 조회·대기 메서드와 결과 타입을 추가했습니다.
- 수집 작업은 `maxResults` × 단가를 예약하고 실제 결과 건수만 차감합니다. 실패는 전액 환불, 결과는 72시간 보관합니다.

# 4.1.0

- Add YouTube methods: `youtubeSearch`, `youtubeChannel`, `youtubePlaylist`, `youtubeHashtag`, `youtubeFormats`, `youtubeComments`, `downloadYoutubeVideo` and `downloadYoutubeAudio`. Downloads return a download link valid for 1 hour and are billed as a base fee plus 2 points per 10MB.
- 유튜브 검색·채널·재생목록·해시태그·다운로드 화질·댓글 조회와 영상(MP4)·오디오(MP3·M4A·Opus) 다운로드 메서드를 추가했습니다. 다운로드는 1시간 유효한 링크를 돌려주며 기본요금에 파일 10MB당 2포인트가 더해집니다.
- Add `googleNewsSearch`, `googleShoppingSearch`, `googleMapsSearch`, `googleRankCheck`, `instagramProfile`, `instagramPost` and `tiktokProfile` with typed results. Failed calls are not charged.
- `googleRankCheck` returns `complete`, `checked_pages` and `unchecked_ranks`; when some rank ranges could not be checked, only the checked share is charged.
- `googleSearch` returns up to 10 results per page; `googleImageSearch` pages are 1-5 (20 per page). Search timeouts are 50 seconds.
- 구글 뉴스·쇼핑·지도 장소 검색, 검색 순위 확인(1~100위), 인스타그램 프로필·게시물/릴스, 틱톡 프로필 메서드와 결과 타입을 추가했습니다. 실패한 호출은 과금되지 않습니다.
- `googleSearch` 는 페이지당 최대 10건, `googleImageSearch` 의 page 는 1~5(페이지당 20건)입니다.

# 4.0.1 — 2026-10-06

- 이미지 생성·편집에 `quality` 옵션을 추가했습니다: `basic`(기본) 40P · `advanced` 350P · `premium` 1,400P(장당 고정가, 크기 무관).
- 같은 요청도 매번 새로 생성·과금하므로 이미지 `idempotencyKey` 는 더 이상 보내지 않습니다(호환을 위해 받기만 하며 폐기 예정입니다).
- Add the image `quality` option: `basic` (default) 40 points, `advanced` 350 points, `premium` 1,400 points per image regardless of size.
- Image `idempotencyKey` is deprecated and no longer sent; every image request is generated and charged as a new request.

# 4.0.0

- Breaking migration: `createTtsJob` now defaults to Gemini `Kore`; retired APICK voices and fallback options are rejected. Use engine-specific voice catalogs instead of legacy `TTS_VOICE_IDS`.
- Add ChatGPT TTS submission, voice and option queries, shared expressive options and multi-speaker types. Preserve MP3/ASS and billing responses. Normalized/raw string limits are 2,000/8,000 characters.
- 기본 접수는 Gemini로 전환됐습니다. 기존 APICK 목소리·자동 전환은 종료됐으며, 품질·재개·후보 음원 경로는 409를 반환합니다. ChatGPT와 공통 확장 옵션을 추가했습니다.

# 3.11.0

- TTS voice metadata includes documented preset age evidence; case aliases remain supported without duplicate catalog entries. Reservation reductions are included in `billing.released`.
- 목소리 목록에 공식 설정 연령 근거를 추가하고 대소문자 별칭 호환을 유지합니다. 예약 감액은 `billing.released`에 누적됩니다.

- TTS: Gemini direct synthesis, queue fallback, default-on paid normalization, unified MP3/ASS and billing.
- TTS: Gemini 직접 합성, 대기 상태별 전환, 기본 on 유료 정규화, 공통 MP3·ASS와 정산 내역.
- 이미지 생성·편집: 사용량 미확정 시 202와 작업 ID를 반환하는 정산 보류 응답 타입을 추가했습니다.
- Image generation/editing: added the HTTP 202 settlement-pending response type for unconfirmed usage.

# 3.10.0 — 2026-10-04

서브에이전트 전용 REST 메서드와 타입을 추가했습니다. 설치형 스킬의 사용량 과금 정보를 제공합니다.

Adds the Subagent integration and usage-based installed-agent contract. Existing API contracts remain supported.

# Changelog

## 3.9.0 — 2026-10-04

- `getSkillPerformance()`와 공개 성능표 타입을 추가했습니다. 시험 방식·표본 수·평가일·성공률 구간·미검증 상태를 확인할 수 있습니다.
- Add `getSkillPerformance()` and report types for methods, sample sizes, evaluation dates, success-rate intervals and untested states.

## 3.8.1 — 2026-10-03

- 상품별 조회 안내와 공통 인증 가이드 링크를 보강했습니다. API 계약 변경은 없습니다.
- Document product-specific data guides and shared authentication; API contracts are unchanged.

## 3.8.0 — 2026-10-03

- 스킬 결과 파일 인증 다운로드와 예상 가격·시간·도구 호출 수 타입 추가.
- Add authenticated Skill artifact downloads and execution estimate types.

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
