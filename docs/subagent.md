# 서브에이전트 / Subagent

`apick-agent`는 설치형 상품이며 `quoteSkill`·`runSkill` 대신 전용 API를 사용합니다. 성공 작업의 확인된 원가에 40%를 가산하며 승인된 동일 결과 캐시는 무료입니다. 충전 잔액 외 상품 사용량 한도는 없습니다.

`apick-agent` is an installed-agent product. Use the dedicated API rather than `quoteSkill` or `runSkill`. Successful work is billed at confirmed model cost plus 40%; approved identical-result cache reuse is free. There are no product usage quotas beyond prepaid balance.

```js
import { ApickClient } from 'apick-api';
import { createHash } from 'node:crypto';
const api = new ApickClient({ apiKey: process.env.APICK_API_KEY });
const bytes = Buffer.from('검토할 공개 문서입니다.');
const file = await api.createSubagentFile({
  path: 'docs/sample.txt', bytes: bytes.length,
  sha256: createHash('sha256').update(bytes).digest('hex'), retention: 'seven_days'
});
if (file.data.state !== 'ready') {
  for (let offset = 0; offset < bytes.length; offset += file.data.part_bytes) {
    await api.uploadSubagentPart(file.data.file_id, offset / file.data.part_bytes,
      bytes.subarray(offset, offset + file.data.part_bytes).toString('base64'));
  }
  await api.completeSubagentFile(file.data.file_id);
}
const job = await api.dispatchSubagent({kind:'summarize', goal:'핵심 내용과 근거를 정리하세요',
  file_ids:[file.data.file_id]}, {idempotencyKey:'sample-summary-20261004-001'});
const result = await api.collectSubagent(job.data.job_id);
// 완료 후 evidence_ids를 조회하여 인용·해시를 직접 검토하세요.
// Once complete, fetch evidence_ids and independently review quotes and hashes.
console.log(result.data.state);
```

접수 응답은 작업 ID를 신속히 반환합니다. 같은 멱등 키와 같은 내용은 기존 작업을 반환하며 내용이 다르면 409입니다. 연결 종료는 취소가 아닙니다. `cancelSubagent`로 명시적으로 취소하세요. `retention:'none'`은 검수 완료 후 삭제하고 임시 보관은 최대 1시간입니다.

Submission returns a job ID promptly. Replay the same idempotency key and payload after response loss; a changed payload conflicts with HTTP 409. Disconnecting does not cancel work; use `cancelSubagent`. `retention:'none'` deletes after review, with temporary retention capped at one hour.

`subagentUsage`는 호출·토큰·예약·청구·해제·캐시·전송 지표를 반환합니다. 캐시 예상 회피 비용은 동일 작업의 최초 계산 비용 기준이며 주 모델의 실제 청구 절감액이 아닙니다.

`subagentUsage` returns calls, tokens, reservations, charges, releases, cache and transfer metrics. Estimated avoided cache cost uses the original job's calculated cost and is not a measured reduction in the main model's bill.

[전체 REST·MCP 가이드 / Full guide](https://apick.app/dev_guide/subagent)
