'use strict';

// 공개 문서·타입에는 청구되는 결과(판매 단가·사용량 기준·기본요금·올림·견적)만 적는다.
// 요금을 만드는 내부 산정 방식이 문서에 다시 들어오지 않게 막는다.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const BLOCKED = /(?<!회|매출)원가(?!입)|×\s?1\.[24](?![\d배])|cost\s?×\s?(the pinned )?exchange|cost plus \d+%|markup|per million tokens|vendor cost/i;

function files() {
	const docs = fs.readdirSync(path.join(root, 'docs')).filter(name => name.endsWith('.md')).map(name => path.join('docs', name));
	return ['README.md', 'CHANGELOG.md', 'src/index.d.ts', 'src/index.cjs'].concat(docs);
}

test('공개 문서와 타입에 요금 산정 방식이 없다', () => {
	const found = [];
	for (const rel of files()) {
		fs.readFileSync(path.join(root, rel), 'utf8').split(/\r?\n/).forEach((line, i) => {
			const m = line.match(BLOCKED);
			if (m) found.push(rel + ':' + (i + 1) + ' ' + line.slice(Math.max(0, m.index - 30), m.index + 50));
		});
	}
	assert.deepEqual(found, []);
});
