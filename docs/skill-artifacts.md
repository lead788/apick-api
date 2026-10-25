# 리퀘오 이전 / Move to REQEO

스킬 판매·실행은 [리퀘오 REQEO](https://reqeo.com/dev_guide/skills)로 이전했습니다. 계정·포인트·인증키는 별개입니다. 이 SDK의 기존 스킬 메서드는 요청을 보내지 않고 `SKILLS_MOVED`(410)를 반환합니다. 에이픽 인증키를 리퀘오에 보내지 마세요. 일반 API·TTS·설치형 에이전트는 계속 지원합니다.

Skill sales and execution have moved to [REQEO](https://reqeo.com/dev_guide/skills). Accounts, points and API keys are separate. Legacy Skill methods reject locally with `SKILLS_MOVED` (410) without making a request. Do not send your APICK key to REQEO. General APIs, TTS and the installed agent remain supported.
