'use strict';

// Client-only multipart serialization. Each value occupies its own form part.
function createForm(payload, endpoint) {
    const form = new FormData();
    const typed = endpoint === '/rest/json_to_excel';
    const forbidden = new Set(['__proto__', 'prototype', 'constructor']);
    function visit(value, parts) {
        if (parts.some(key => forbidden.has(key) || /[\[\]]/.test(key)) || parts.length > 12) throw new TypeError('Invalid form field path.');
        const name = parts[0] + parts.slice(1).map(key => `[${key}]`).join('');
        const cell = typed && parts[0] === 'data_list';
        if (value === undefined || (value === null && !cell)) return;
        if (value instanceof Blob) { form.append(name, value); return; }
        if (value && typeof value === 'object' && Object.keys(value).length) {
            if (cell) form.append('__apick_type' + parts.map(key => `[${key}]`).join(''), Array.isArray(value) ? 'array' : 'object');
            for (const key of Object.keys(value)) visit(value[key], parts.concat(key));
            return;
        }
        if (cell && typeof value !== 'string') {
            form.append('__apick_type' + parts.map(key => `[${key}]`).join(''), value === null ? 'null' : Array.isArray(value) ? 'array' : typeof value);
        }
        if (!cell && value && typeof value === 'object') return;
        form.append(name, value === null || typeof value === 'object' ? '' : String(value));
    }
    for (const key of Object.keys(payload || {})) visit(payload[key], [key]);
    return form;
}
module.exports = { createForm };
