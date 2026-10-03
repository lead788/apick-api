'use strict';
const test = require('node:test'), assert = require('node:assert/strict');
const { ApickClient, ApickBinaryResult } = require('../src/index.cjs');
const file = 'art_' + 'a'.repeat(24);
test('artifact download authenticates a scoped URL and preserves JSON files as bytes', async () => {
    let request;
    const client = new ApickClient({ apiKey: 'test-key', baseUrl: 'https://example.test', fetch: async (url, options) => {
        request = { url, options }; return new Response('{"hello":1}', { headers: { 'content-type': 'application/json', 'content-disposition': 'attachment; filename="result.json"' } });
    } });
    const result = await client.getSkillArtifact('run_test', file);
    assert.ok(result instanceof ApickBinaryResult); assert.equal(result.filename, 'result.json');
    assert.equal(new TextDecoder().decode(result.bytes), '{"hello":1}');
    assert.equal(request.url, 'https://example.test/rest/skills/runs/run_test/files/' + file + '?download=1');
    assert.equal(request.options.headers.Authorization, 'Bearer test-key'); assert.equal(request.options.redirect, 'error');
});
test('artifact IDs cannot inject a URL and errors retain the public service code', async () => {
    let calls = 0;
    const client = new ApickClient({ apiKey: 'test-key', fetch: async () => { calls++; return new Response(JSON.stringify({ error: { code: 'RESULT_EXPIRED' } }), { status: 410 }); } });
    await assert.rejects(client.getSkillArtifact('run_test', '../elsewhere')); assert.equal(calls, 0);
    await assert.rejects(client.getSkillArtifact('run_test', file), { serviceCode: 'RESULT_EXPIRED', status: 410 });
});
test('artifact size limit applies before reading declared oversize responses', async () => {
    const client = new ApickClient({ apiKey: 'test-key', fetch: async () => new Response('', { headers: { 'content-length': String(201 * 1024 * 1024) } }) });
    await assert.rejects(client.getSkillArtifact('run_test', file), { code: 'APICK_INVALID_RESPONSE' });
});
