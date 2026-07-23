# Wukong i18n Hover

在 VS Code 中悬停查看 `$.i18n.prop()` 和 `$.i18n.prop_origin()` 对应的语言包文案。

## 功能

- 支持 JavaScript、TypeScript、Vue 和 HTML。
- 支持单引号、双引号和不含插值的反引号静态 key。
- 默认读取 `src/language/message_zh_CN.txt`。
- 可同时配置多个语言包，悬停时并列展示。
- 展示语言包相对路径和实际行号。
- 语言包保存后自动刷新缓存。
- 所有数据只在当前 VS Code 工作区内处理，不发送网络请求。

## 使用

安装扩展后，将鼠标停在 key 上：

```js
const title = $.i18n.prop('stock.uploadPhoto')
const html = $.i18n.prop_origin('markUploadSubmitSuccess')
```

默认配置：

```json
{
  "wukongI18nHover.languageFiles": [
    "src/language/message_zh_CN.txt"
  ]
}
```

同时查看多语言：

```json
{
  "wukongI18nHover.languageFiles": [
    "src/language/message_zh_CN.txt",
    "src/language/message_en_US.txt",
    "src/language/message_esp.txt"
  ]
}
```

路径相对于当前代码文件所属的工作区根目录。修改配置或语言包后无需重启；也可以在命令面板执行 `Wukong i18n Hover: 刷新语言包缓存`。

## 本地安装

在扩展目录执行：

```bash
npm install
npm run package
code --install-extension wukong-i18n-hover-0.1.1.vsix
```

也可以在 VS Code 扩展视图右上角选择 **Install from VSIX...**。

## 限制

首版只解析静态字符串。变量、字符串拼接和含 `${...}` 插值的模板字符串不会显示悬停提示。

Marketplace 发布步骤见 [docs/PUBLISHING.zh-CN.md](docs/PUBLISHING.zh-CN.md)。

## License

[MIT](LICENSE)
