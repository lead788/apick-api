# 스킬 결과 파일 · Skill artifacts

스킬 상세와 견적의 `execution_info`는 예상 가격 범위, 처리 시간 범위, 도구별 보통·최대 호출 수를 제공합니다. 실측 표본에 따른 예상이며 입력에 따라 달라집니다. 실행 전 견적의 `max_points`를 확인하세요.

`execution_info` on Skill details and quotes describes estimated price and duration ranges and typical/maximum tool calls. These are estimates, not guarantees. Check `max_points` before running a Skill.

```js
const quote = await apick.quoteSkill(skillId, input);
console.log(quote.data.execution_info);
const run = await apick.runSkill(skillId, input, {
  idempotencyKey: 'my-unique-request',
  quoteId: quote.data.quote_id,
  maxCostPoints: quote.data.max_points
});
// Poll getSkillRun until status is succeeded, then:
const result = await apick.getSkillRunResult(run.data.run_id);
const file = result.data.result.artifacts[0];
const downloaded = await apick.getSkillArtifact(run.data.run_id, file.id);
await downloaded.save('./result.png');
```

파일의 `name`, `mime_type`, `bytes`, `sha256`을 확인하고 실제 형식에 맞는 확장자로 저장하세요. 인증키 소유자의 실행 파일만 내려받을 수 있고, 실행 결과가 만료되면 파일도 만료됩니다. 실패·취소·시간 초과는 예약액을 반환하며, 가변 요금 상품은 성공 시 실제 사용료를 정산합니다. 공급자 청구서와 대조한 확정 원가를 뜻하지 않습니다.

Use `name`, `mime_type`, `bytes`, and `sha256` to identify and verify each file; choose a matching extension. Downloads require the run owner's API key and expire with the result. Failed, cancelled, and timed-out runs release the reservation. Variable-price Skills settle recorded tool usage on success; calculated vendor costs are not invoice-reconciled amounts.
