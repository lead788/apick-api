'use strict';
const test = require('node:test'), assert = require('node:assert/strict');
const { ApickClient } = require('../src/index.cjs');
function setup() {
    const calls = [];
    const client = new ApickClient({ apiKey: 'test-only', fetch: async (url, init) => {
        calls.push({url,init});
        if (url.endsWith('/result')) return new Response(new Uint8Array([0,1,2]), {headers:{'content-type':'video/mp4'}});
        return new Response(JSON.stringify({data:{job_id:'a'.repeat(32),model:'kling',version:'1.6',status:'waiting'},api:{success:true,cost:1100}}), {headers:{'content-type':'application/json'}});
    } });
    return {calls,client};
}
test('video JSON forwards version, tier, audio and idempotency key', async () => {
    const {calls,client}=setup();
    const result=await client.createVideoJob('kling','a boat',{version:'1.6',tier:'std',duration:5,audio:false,idempotencyKey:'version-test-1'});
    assert.equal(calls[0].url,'https://apick.app/rest/kling/jobs');
    assert.deepEqual(JSON.parse(calls[0].init.body),{prompt:'a boat',version:'1.6',tier:'std',duration:5,audio:false,idempotency_key:'version-test-1'});
    assert.equal(result.data.version,'1.6');
    await client.createVideoJob('veo','a boat');
    assert.ok(!Object.hasOwn(JSON.parse(calls[1].init.body),'version'));
});
test('video image input is multipart and preserves the requested version', async () => {
    const {calls,client}=setup();
    const image=new Blob([new Uint8Array([1,2,3])],{type:'image/png'});
    await client.createVideoJob('seedance','a boat',{version:'1.0',tier:'pro',mode:'image',image,lastImage:image});
    assert.equal(calls[0].init.body.get('version'),'1.0');
    assert.ok(calls[0].init.body.get('image'));
    assert.ok(calls[0].init.body.get('last_image'));
    assert.equal(calls[0].init.headers['Content-Type'],undefined);
});
test('Seedance reference audio is sent as multipart without changing the public field', async () => {
    const {calls,client}=setup();
    const image=new Blob([new Uint8Array([1,2,3])],{type:'image/png'});
    const audio=new Blob([new Uint8Array([73,68,51])],{type:'audio/mpeg'});
    await client.createVideoJob('seedance','beat matched motion',{version:'2.0',tier:'mini',mode:'reference',referenceImages:[image],referenceAudios:[audio]});
    assert.ok(calls[0].init.body.get('reference_image'));
    assert.equal(calls[0].init.body.get('reference_audio').type,'audio/mpeg');
});
test('Seedance 2.0 Fast and Mini tiers pass through unchanged', async () => {
    const {calls,client}=setup();
    await client.createVideoJob('seedance','a fast car',{version:'2.0',tier:'fast',duration:4,resolution:'480p'});
    await client.createVideoJob('seedance','a fast car',{version:'2.0',tier:'mini',duration:4,resolution:'720p'});
    assert.deepEqual(calls.map(({init})=>{const body=JSON.parse(init.body);return {version:body.version,tier:body.tier,duration:body.duration,resolution:body.resolution};}),[
        {version:'2.0',tier:'fast',duration:4,resolution:'480p'},
        {version:'2.0',tier:'mini',duration:4,resolution:'720p'},
    ]);
});
test('video status/result paths and invalid routing', async () => {
    const {calls,client}=setup(), id='a'.repeat(32);
    await client.getVideoJob('kling',id);
    assert.equal(calls[0].init.method,'GET');
    const result=await client.downloadVideoResult('kling',id);
    assert.equal(result.contentType,'video/mp4');
    await assert.rejects(client.createVideoJob('../private','test'),RangeError);
    assert.throws(()=>client.getVideoJob('kling','../private'),RangeError);
    assert.equal(calls.length,2);
});
