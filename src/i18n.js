'use strict'

function findI18nCallAtOffset(text, offset) {
    const callPattern = /\$\s*\.\s*i18n\s*\.\s*(prop_origin|prop)\s*\(\s*(['"`])([^'"`\r\n]*)\2\s*\)/g
    let match

    while ((match = callPattern.exec(text)) !== null) {
        const key = match[3]
        const keyOffsetInMatch = match[0].indexOf(key, match[0].indexOf(match[2]) + 1)
        const start = match.index + keyOffsetInMatch
        const end = start + key.length

        // 【AI注释】模板字符串含插值时不是稳定 key，避免展示可能错误的语言文案。
        if (match[2] === '`' && key.includes('${')) continue

        if (key && offset >= start && offset < end) {
            return {
                key,
                method: match[1],
                start,
                end
            }
        }
    }

    return null
}

function parseLanguageFile(content) {
    const entries = new Map()

    content.split(/\r?\n/).forEach((rawLine, index) => {
        const line = index === 0 ? rawLine.replace(/^\uFEFF/, '') : rawLine
        const trimmedLine = line.trim()

        if (!trimmedLine || trimmedLine.startsWith('#')) return

        const separatorIndex = line.indexOf('=')
        if (separatorIndex < 0) return

        const key = line.slice(0, separatorIndex).trim()
        if (!key) return

        entries.set(key, {
            value: line.slice(separatorIndex + 1),
            line: index + 1
        })
    })

    return entries
}

module.exports = {
    findI18nCallAtOffset,
    parseLanguageFile
}
