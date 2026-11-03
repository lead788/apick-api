import { ApickClient } from 'apick-api';
import { randomUUID } from 'node:crypto';
const client = new ApickClient({ apiKey: process.env.APICK_API_KEY });
const { data: document } = await client.documentCreate({
  title: '주간 업무 보고', request_id: randomUUID(),
  content: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: '이번 주 진행한 업무를 정리합니다.' }] }] }
});
const { data: quote } = await client.documentQuote({ document_id: document.document_id, version: document.version });
console.log({ document_id: document.document_id, price: quote.price, expires_at: quote.expires_at });
// 다운로드는 quote.price만큼 차감됩니다. 실행 전에 가격을 확인하세요.
// const file = await client.documentDownload({ ...quote, request_id: randomUUID() });
