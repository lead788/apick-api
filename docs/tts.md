# Gemini·ChatGPT TTS

기존 APICK 목소리와 자동 전환은 종료되었습니다. `createTtsJob`은 Gemini 기본 목소리 `Kore`를 사용합니다. `getTtsQuality`, `retryTtsJob`, `downloadTtsCandidate`의 기존 경로는 HTTP 409를 반환합니다.

Legacy APICK voices and automatic fallback have retired. `createTtsJob` now defaults to Gemini voice `Kore`. The legacy quality, retry and candidate endpoints return HTTP 409.

```js
const job = await client.createTtsJob('기온은 오 도입니다.', { voiceId: 'Kore', normalizeText: false, idempotencyKey: 'tts-001' });
const dialogue = await client.createOpenAiTtsJob({
  utterances: [{ speaker: '진행', text: '반갑습니다.' }, { speaker: '손님', text: '안녕하세요.' }],
  speakers: { 진행: { voice_id: 'alloy' }, 손님: { voice_id: 'nova', emotion: 'calm' } },
  multi_speaker: true, normalize_text: false
}, { idempotencyKey: 'tts-002' });
const voices = await client.listGeminiTtsVoices();
const otherVoices = await client.listOpenAiTtsVoices();
const options = await client.getTtsOptions();
const quote = await client.quoteTts({ engine: 'gemini', text: '본문', voice_id: 'Kore' });
```

`style`, `emotion`, `tone`, `accent`, `pace`(0.5–2), `pitch`(-12–12), `volume_gain_db`(-12–12)는 최상위·화자·발화에 지정할 수 있습니다. `speakers`는 화자 이름별 설정이고 `multi_speaker: true`는 Gemini 최대 2명, ChatGPT 최대 8명입니다. 엔진에 따라 표현 효과가 달라지며 정확한 속도 배율·반음·dB 적용을 보장하지 않습니다. 특히 ChatGPT는 수치의 방향을 낭독 지시로 전달합니다.

Style, emotion, tone, accent, pace, pitch and volume options can be set per request, speaker or utterance. Gemini supports up to two native speakers; ChatGPT supports up to eight speakers across utterances. Numeric acoustic adjustments are not guaranteed: ChatGPT receives directional instructions rather than precise rate, semitone or decibel controls.

정규화는 기본 켜짐이며 추가 스킬 요금이 합산됩니다. `normalize_text: false`(SDK 문자열 호출은 `normalizeText: false`)로 끌 수 있습니다. 정규화 입력은 발화 사이 줄바꿈을 포함해 최대 2,000자, 정규화 없이 최대 8,000자입니다. 견적은 `quoteTts`, 현재 목소리는 엔진별 목록, 옵션은 `getTtsOptions`로 조회합니다.

Normalization is enabled by default and costs extra. Disable it with `normalize_text: false` (`normalizeText: false` for the string SDK helper). Input limits are 2,000 characters including utterance separators with normalization, or 8,000 without it. Query a quote, engine-specific voices and supported options before submitting.

실제 AI 원가 × 고정된 환율 × 1.4에 정규화 요금을 더해 정산합니다. Gemini 프로모션 입력/출력 단가는 2026-12-31까지 백만 토큰당 $0.50/$6.00이며 2027-01-01 00:00 UTC부터 $1.00/$12.00입니다. 약 $0.54/시간은 참고값이며 시간 단위 청구가 아닙니다. 엔진별 요금이 다릅니다.

AI usage is charged at verified cost × the pinned exchange rate × 1.4, plus normalization. Gemini promotional input/output rates are $0.50/$6.00 per million tokens through 2026-12-31, then $1.00/$12.00 from 2027-01-01 00:00 UTC. The approximate hourly figure is informational; billing uses actual usage and differs by engine.

두 엔진은 같은 작업 조회·취소·MP3·원문 ASS 계약을 사용합니다. `billing`의 예약·해제·확정·환불을 확인하세요. MP3는 24kHz 모노 48kbps, 결과는 완료 후 24시간 보관합니다. MP3와 ASS는 각각 완료된 다운로드 1회만 허용하며 전송 중단은 재시도할 수 있습니다. 접수 응답 유실 시 같은 입력과 멱등 키를 재사용하세요. 서버·공급자 최종 실패는 정규화까지 환불하며, 연결 종료는 작업 취소가 아닙니다. 취소 시 이미 수행된 작업분을 정산합니다.

Both engines share job status, cancellation, MP3 and original-text ASS downloads. Check reserved, released, captured and refunded amounts in `billing`. MP3 is 24 kHz mono at 48 kbps. Files are kept for 24 hours; each permits one completed download, and interrupted transfers can be retried. Reuse the same input and idempotency key after a lost response. Final server/provider failures refund synthesis and normalization; disconnecting does not cancel work. Explicit cancellation settles work already performed.
