'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {ApickClient}=require('../src/index.cjs');
test('폐지된 결과물 다운로드는 사용자 지정 주소에도 인증키를 보내지 않는다',async()=>{
 let calls=0;const client=new ApickClient({apiKey:'private-test-key',baseUrl:'https://reqeo.com',fetch:async()=>{calls++;}});
 await assert.rejects(client.getSkillArtifact('run_test','art_'+'a'.repeat(24)),e=>e.serviceCode==='SKILLS_MOVED');assert.equal(calls,0);
});
