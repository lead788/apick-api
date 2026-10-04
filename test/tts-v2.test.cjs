'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {ApickClient}=require('../src/index.cjs');
test('TTS 옵션·Gemini·견적·목소리 목록은 공통 응답을 보존하고 JSON 불리언 전달',async()=>{
  const requests=[];const client=new ApickClient({apiKey:'test-key',fetch:async(url,request)=>{requests.push({url,request});return new Response(JSON.stringify({data:{job_id:'a'.repeat(32),status:'waiting',billing:{reserved:100,total:0}},api:{success:true,cost:0}}),{status:202,headers:{'Content-Type':'application/json'}});}});
  const result=await client.createTtsJob('본문',{fallbackPolicy:'busy',normalizeText:false,fallbackOptions:{voice_id:'Charon',style:'차분하게'},idempotencyKey:'tts-1'});
  assert.equal(result.data.billing.total,0);assert.equal(requests[0].request.headers['X-Idempotency-Key'],'tts-1');
  assert.equal(JSON.parse(requests[0].request.body).normalize_text,false);assert.equal(JSON.parse(requests[0].request.body).fallback_policy,'busy');
  await client.createGeminiTtsJob({text:'본문',voice_id:'Kore'},{idempotencyKey:'tts-2'});assert.ok(requests[1].url.endsWith('/rest/tts/gemini/jobs'));
  await client.listGeminiTtsVoices();assert.equal(requests[2].request.method,'GET');
  await client.quoteTts({engine:'gemini',text:'본문'});assert.ok(requests[3].url.endsWith('/rest/tts/quote'));
  assert.throws(()=>client.createTtsJob('본문',{fallbackPolicy:'unknown'}));
  assert.throws(()=>client.createTtsJob('본문',{normalizeText:'false'}));
});
