const test = require('node:test');
const assert = require('node:assert/strict');
const { ApickClient, ApickBinaryResult } = require('../src/index.cjs');

test('quality and candidate requests preserve final downloads and retry identity', async () => {
  const requests = [];
  const job = 'a'.repeat(32), candidate = 'b'.repeat(32);
  const client = new ApickClient({ apiKey: 'key', fetch: async (url, options) => {
    requests.push({ url, options });
    return url.endsWith('/audio') ? new Response(new Uint8Array([1, 2]), { headers: { 'content-type': 'audio/wav' } })
      : new Response(JSON.stringify({ data: { job_id: job, resume_revision: 1 }, api: { success: true, cost: 0 } }),
        { headers: { 'content-type': 'application/json' } });
  } });
  await client.getTtsQuality(job);
  await client.retryTtsJob(job, ['u002', 'u001', 'u002'], 'recovery-key-1');
  assert.equal(requests[0].options.method, 'GET');
  assert.ok(requests[0].url.endsWith('/quality'));
  assert.deepEqual(Object.fromEntries(requests[1].options.body), { 'utterance_ids[0]': 'u001', 'utterance_ids[1]': 'u002', idempotency_key: 'recovery-key-1' });
  assert.ok(await client.downloadTtsCandidate(job, candidate) instanceof ApickBinaryResult);
  assert.ok(requests[2].url.endsWith('/candidates/' + candidate + '/audio'));
  assert.throws(() => client.downloadTtsCandidate(job, '../private'), /candidateId/);
  assert.throws(() => client.retryTtsJob(job, ['../private'], 'recovery-key-1'), /utteranceIds/);
  assert.throws(() => client.retryTtsJob(job, [], 'short'), /idempotencyKey/);
  assert.equal(requests.length, 3);
});
