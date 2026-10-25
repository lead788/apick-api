'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {ApickClient,ApickApiError}=require('../src/index.cjs');
test('폐지된 스킬 메서드는 네트워크와 무관하게 이전 오류를 반환한다',async()=>{
 let calls=0;const client=new ApickClient({apiKey:'private-test-key',fetch:async()=>{calls++;throw Error('NO_NETWORK');}});
 for(const name of ['searchSkills','getSkillPerformance','getSkill','quoteSkill','runSkill','getSkillRun','getSkillRunResult','getSkillArtifact','cancelSkillRun','skillUsage']){
  await assert.rejects(client[name](),e=>e instanceof ApickApiError&&e.status===410&&e.serviceCode==='SKILLS_MOVED'&&e.details.url==='https://reqeo.com/dev_guide/skills'&&!e.message.includes('private-test-key'));
 }assert.equal(calls,0);
});
