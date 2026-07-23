'use strict'

const test = require('node:test')
const assert = require('node:assert/strict')
const { findI18nCallAtOffset, parseLanguageFile } = require('../src/i18n')

test('finds prop key when cursor is inside a single-quoted string', () => {
    const text = "const title = $.i18n.prop('stock.uploadPhoto')"
    const offset = text.indexOf('upload')

    assert.deepEqual(findI18nCallAtOffset(text, offset), {
        key: 'stock.uploadPhoto',
        method: 'prop',
        start: text.indexOf('stock.uploadPhoto'),
        end: text.indexOf('stock.uploadPhoto') + 'stock.uploadPhoto'.length
    })
})

test('supports prop_origin with whitespace and a double-quoted string', () => {
    const text = 'const html = $.i18n.prop_origin(  "markUploadSubmitSuccess"  )'

    assert.equal(findI18nCallAtOffset(text, text.indexOf('Upload')).method, 'prop_origin')
    assert.equal(findI18nCallAtOffset(text, text.indexOf('Upload')).key, 'markUploadSubmitSuccess')
})

test('supports a static template string', () => {
    const text = 'const value = $.i18n.prop(`login`)'

    assert.equal(findI18nCallAtOffset(text, text.indexOf('login') + 2).key, 'login')
})

test('does not match outside the key or a dynamic template string', () => {
    const staticCall = "$.i18n.prop('login')"
    const dynamicCall = '$.i18n.prop(`login.${type}`)'

    assert.equal(findI18nCallAtOffset(staticCall, 0), null)
    assert.equal(findI18nCallAtOffset(staticCall, staticCall.indexOf('prop')), null)
    assert.equal(findI18nCallAtOffset(dynamicCall, dynamicCall.indexOf('login')), null)
})

test('parses comments, blank lines and values containing equals signs', () => {
    const entries = parseLanguageFile([
        '# release block',
        '',
        'login=登录',
        'formula=a=b=c',
        'empty=',
        'invalid line'
    ].join('\n'))

    assert.deepEqual(entries.get('login'), { value: '登录', line: 3 })
    assert.deepEqual(entries.get('formula'), { value: 'a=b=c', line: 4 })
    assert.deepEqual(entries.get('empty'), { value: '', line: 5 })
    assert.equal(entries.has('invalid line'), false)
})

test('uses the last occurrence when a key is duplicated', () => {
    const entries = parseLanguageFile('login=登录\nlogin=重新登录')

    assert.deepEqual(entries.get('login'), { value: '重新登录', line: 2 })
})

test('handles CRLF and ignores whitespace-only keys', () => {
    const entries = parseLanguageFile('welcome=欢迎\r\n   =ignored\r\nnext=下一项\r\n')

    assert.deepEqual(entries.get('next'), { value: '下一项', line: 3 })
    assert.equal(entries.has(''), false)
})
