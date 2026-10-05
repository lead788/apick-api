# TTS · 한국어 안내

apick 직접 제작, apick → Gemini 자동 전환, Gemini 직접 제작은 같은 작업 조회·MP3·ASS 다운로드 API를 사용합니다. 파일 구조와 규격은 같으며 음성은 엔진과 목소리에 따라 다릅니다.

```js
const apick = new ApickClient({ apiKey: process.env.APICK_API_KEY });
const job = await apick.createTtsJob('기온은 5℃입니다.', {
  voiceId: 'v2_ann_m_30s_01',
  normalizeText: true,
  fallbackPolicy: 'busy',
  fallbackOptions: { voice_id: 'Charon', style: '차분하게' },
  idempotencyKey: 'narration-001'
});
const direct = await apick.createGeminiTtsJob({
  voice_id: 'Kore', style: '또렷하게', normalize_text: false,
  utterances: [{ text: '오늘의 이야기입니다.', speaker: '진행자' }]
}, { idempotencyKey: 'gemini-001' });
const voices = await apick.listGeminiTtsVoices();
const quote = await apick.quoteTts({ engine: 'gemini', text: '본문', voice_id: 'Kore' });
const status = await apick.getTtsJob(job.data.job_id);
// completed 이후 기존 downloadTtsResult / downloadTtsSubtitles 사용
```

| 옵션 | 동작 |
| --- | --- |
| `never` | 기본값. apick 대기열 등록, 가득 차면 429 |
| `queue_full` | 대기열에도 빈자리가 없을 때 Gemini 전환 |
| `busy` | 즉시 apick 실행이 불가능하면 Gemini 전환 |
| `fallbackOptions` | 전환할 때만 적용되는 `voice_id`, `style` |
| `normalizeText` / `normalize_text` | 기본 true. false는 정규화 스킬 실행·과금 생략 |

정규화는 숫자·단위·약어의 문맥에 맞는 발음을 다듬으며, **추가 스킬 요금**이 합산됩니다. 정규화 on 입력 합계(발화 사이 줄바꿈 포함)는 2,000자, Gemini off는 8,000자, apick 기존 입력 한도는 800자입니다. 기본·확장 공개 목소리는 `listGeminiTtsVoices()`로 확인합니다. 자동 선택은 같은 성별의 한국어 목소리를 우선하고 공식 설명 또는 별도 검수로 확인한 연령대와 음색을 비교합니다. `age_basis: catalog_description`은 공식 설명에 적힌 설정 연령이며 실제 화자의 나이를 뜻하지 않습니다. 근거가 없는 목소리는 `age_verified: false`입니다. 대소문자 별칭은 목록에 중복 표시하지 않고 기존 입력도 허용합니다.

Gemini 사용 시 목소리와 가격이 달라질 수 있습니다. 실제 AI 원가 × 호출 직전 적용 환율 × 1.4로 판매하고, 스킬은 기본요금(판매자 금액 + 기본 수수료) + AI 사용료입니다. Gemini 100만 토큰당 입력/출력 공급자 가격은 2026-12-31까지 $0.50/$6.00, 2027-01-01 00:00 UTC부터 $1.00/$12.00입니다. $0.54/시간은 출력 참고값이며 과금 단위가 아닙니다.

`api.cost`는 접수 예약금을 확정액으로 표시하지 않습니다. `data.billing`의 `synthesis`, `skill`, `total`, `reserved`, `released`, `refunded`, `status`를 확인하세요. `voice_id`는 원래 요청을 보존하고 실제 엔진·모델·목소리는 `synthesis`에 표시합니다. 서버·공급자의 최종 제작 실패는 정규화까지 전액 환불합니다. 클라이언트 연결 종료는 정상 과금하고, 명시 취소는 이미 수행된 유료 처리분을 정산합니다.

MP3 24kHz·모노·48kbps와 입력 원문 ASS를 완료 후 24시간 제공합니다. 파일별 한 번 다운로드, 중단 시 재시도가 가능합니다. 동일 요청의 접수 재시도에는 같은 `idempotencyKey`를 사용하세요. 이전 방식 작업의 품질·후보·재개 API는 해당 이전 작업에만 적용됩니다.

[개발가이드](https://apick.app/dev_guide/tts) · [정규화 스킬](https://apick.app/skills/korean-text-normalize) · [공식 가격표](https://ai.google.dev/gemini-api/docs/pricing#gemini-3.8-flash-lite-tts)

# TTS · English

`createTtsJob` supports APICK synthesis and optional Gemini fallback. `createGeminiTtsJob` accepts Gemini voices, style, text or per-speaker utterances. All three paths share `getTtsJob`, `downloadTtsResult`, and `downloadTtsSubtitles`. The MP3/ASS format and response structure match; the generated voices differ.

Fallback policies: `never` (default) queues APICK and returns 429 when its queue is full; `queue_full` uses Gemini only when the waiting queue is full; `busy` uses Gemini whenever immediate APICK execution is unavailable. `fallbackOptions.voice_id/style` apply only after fallback. Unsupported explicit voice IDs are rejected. `listGeminiTtsVoices` returns public basic and extended voices without case-alias duplicates, while existing aliases remain accepted. Automatic matching prioritizes Korean voices of the same gender, then the closest supported age band and vocal traits. `age_basis: catalog_description` refers to an age explicitly stated in the official voice description, not a real speaker's biological age. Voices without age evidence remain unverified.

Text normalization is **on by default and costs extra**. Set `normalizeText: false` on SDK APICK options or `normalize_text: false` in a request body to skip both the skill and its charge. Normalization allows 2,000 characters across utterances including separating newlines. Gemini without normalization allows 8,000 characters; APICK retains its 800-character limit. The original spelling appears in ASS subtitles.

External AI charges equal verified provider cost × the pinned USD/KRW exchange rate × 1.4. A skill adds its base fee once, including seller amount and base commission, without a second markup on AI usage. Gemini provider input/output prices per million tokens are $0.50/$6.00 through December 31, 2026, then $1.00/$12.00 from January 1, 2027, 00:00 UTC. The approximate $0.54/hour figure is informational, not a billing unit. Fallback may change the price and voice.

Read the job's `billing` breakdown for reserved, released, captured, and refunded amounts. Submission `api.cost` does not treat a reservation as a final charge. Top-level `voice_id` preserves the APICK request; `synthesis` reports the actual provider/model/voice. Final server/provider failures refund synthesis and normalization. Disconnecting does not cancel background work or billing; explicit cancellation settles work already performed.

Results are MP3 (24 kHz, mono, 48 kbps) and ASS, retained for 24 hours after completion. Each file permits one completed download; interrupted transfers may be retried. Reuse the same `idempotencyKey` and input after a lost submission response. Legacy quality/candidate/retry methods apply only to legacy jobs.
