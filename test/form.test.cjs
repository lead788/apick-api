'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { createForm } = require('../src/form.cjs');
test('nested values use separate multipart fields and preserve false', () => {
    const form = createForm({ messages: [{ role: 'user', content: '안녕하세요' }], compact: { window_pairs: 2 }, stream: false });
    assert.deepEqual([...form], [['messages[0][role]','user'],['messages[0][content]','안녕하세요'],['compact[window_pairs]','2'],['stream','false']]);
});
test('spreadsheet cells preserve numeric strings, numbers, booleans and null', () => {
    const form = createForm({ data_list: [{ code: '001', count: 3, active: false, blank: null }] }, '/rest/json_to_excel');
    assert.equal(form.get('data_list[0][code]'), '001');
    assert.equal(form.get('__apick_type[data_list][0][code]'), null);
    assert.equal(form.get('__apick_type[data_list][0][count]'), 'number');
    assert.equal(form.get('__apick_type[data_list][0][active]'), 'boolean');
    assert.equal(form.get('__apick_type[data_list][0][blank]'), 'null');
});
test('prototype and ambiguous field names are rejected before sending', () => {
    assert.throws(() => createForm(JSON.parse('{"__proto__":{"polluted":true}}')), /Invalid form field/);
    assert.throws(() => createForm({ 'messages[0]': 'invalid' }), /Invalid form field/);
});
