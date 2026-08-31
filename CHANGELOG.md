# Changelog

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
