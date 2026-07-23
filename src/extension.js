'use strict'

const vscode = require('vscode')
const { findI18nCallAtOffset, parseLanguageFile } = require('./i18n')

const cache = new Map()

function activate(context) {
    const selector = [
        'javascript',
        'javascriptreact',
        'typescript',
        'typescriptreact',
        'vue',
        'html'
    ]

    context.subscriptions.push(
        vscode.languages.registerHoverProvider(selector, {
            provideHover: createHover
        }),
        vscode.commands.registerCommand('wukongI18nHover.refresh', () => {
            cache.clear()
            vscode.window.showInformationMessage('Wukong i18n Hover：语言包缓存已刷新')
        }),
        vscode.workspace.onDidChangeConfiguration(event => {
            if (event.affectsConfiguration('wukongI18nHover.languageFiles')) cache.clear()
        })
    )

    const watcher = vscode.workspace.createFileSystemWatcher('**/*.{txt,properties}')
    const clearFileCache = uri => cache.delete(uri.toString())
    watcher.onDidCreate(clearFileCache, null, context.subscriptions)
    watcher.onDidChange(clearFileCache, null, context.subscriptions)
    watcher.onDidDelete(clearFileCache, null, context.subscriptions)
    context.subscriptions.push(watcher)
}

async function createHover(document, position) {
    const line = document.lineAt(position.line)
    const call = findI18nCallAtOffset(line.text, position.character)
    if (!call) return null

    const workspaceFolder = vscode.workspace.getWorkspaceFolder(document.uri)
    if (!workspaceFolder) return null

    const configuration = vscode.workspace.getConfiguration('wukongI18nHover', document.uri)
    const languageFiles = configuration.get('languageFiles', [])
    const results = await Promise.all(languageFiles.map(file => findTranslation(workspaceFolder, file, call.key)))
    const markdown = buildHoverMarkdown(call.key, results, languageFiles)
    const range = new vscode.Range(
        position.line,
        call.start,
        position.line,
        call.end
    )

    return new vscode.Hover(markdown, range)
}

async function findTranslation(workspaceFolder, configuredPath, key) {
    const uri = vscode.Uri.joinPath(workspaceFolder.uri, ...configuredPath.split(/[\\/]+/).filter(Boolean))
    const languageFile = await readLanguageFile(uri)

    return {
        configuredPath,
        uri,
        entry: languageFile.entries.get(key),
        error: languageFile.error
    }
}

async function readLanguageFile(uri) {
    const cacheKey = uri.toString()
    if (cache.has(cacheKey)) return cache.get(cacheKey)

    // 【AI注释】缓存 Promise 可合并同一时刻的多次悬停读取，文件监听会在内容变化时定向失效。
    const loading = vscode.workspace.fs.readFile(uri)
        .then(content => ({
            entries: parseLanguageFile(new TextDecoder('utf-8').decode(content)),
            error: null
        }))
        .catch(error => ({
            entries: new Map(),
            error: error && error.message ? error.message : String(error)
        }))

    cache.set(cacheKey, loading)
    return loading
}

function buildHoverMarkdown(key, results, configuredFiles) {
    const markdown = new vscode.MarkdownString()
    markdown.isTrusted = false
    markdown.appendMarkdown(`**${escapeMarkdown(key)}**\n\n`)

    const matches = results.filter(result => result.entry)
    if (!matches.length) {
        markdown.appendMarkdown('$(warning) 未在已配置语言包中找到。\n\n')
        if (configuredFiles.length) {
            markdown.appendMarkdown(`配置：${configuredFiles.map(file => `\`${escapeCode(file)}\``).join('、')}`)
        } else {
            markdown.appendMarkdown('尚未配置 `wukongI18nHover.languageFiles`。')
        }
        return markdown
    }

    matches.forEach((result, index) => {
        if (index) markdown.appendMarkdown('\n\n---\n\n')
        markdown.appendMarkdown(`${escapeMarkdown(result.entry.value) || '*(空字符串)*'}\n\n`)
        markdown.appendMarkdown(`\`${escapeCode(result.configuredPath)}:${result.entry.line}\``)
    })

    const readErrors = results.filter(result => result.error)
    if (readErrors.length) {
        markdown.appendMarkdown('\n\n---\n\n')
        markdown.appendMarkdown(`$(warning) 无法读取：${readErrors.map(result => `\`${escapeCode(result.configuredPath)}\``).join('、')}`)
    }

    return markdown
}

function escapeMarkdown(value) {
    return String(value).replace(/[\\`*_{}[\]()#+\-.!|>]/g, '\\$&').replace(/\r?\n/g, '  \n')
}

function escapeCode(value) {
    return String(value).replace(/`/g, '\\`')
}

function deactivate() {
    cache.clear()
}

module.exports = {
    activate,
    deactivate
}
