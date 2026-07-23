# 发布到 VS Code Marketplace

## 发布前准备

1. 登录 [Visual Studio Marketplace 管理页](https://marketplace.visualstudio.com/manage)。
2. 创建 Publisher，记下唯一的 Publisher ID。
3. 确认 `package.json` 的 `publisher` 与你的 Publisher ID `17715147229` 一致。
4. 确认源码仓库为 `https://github.com/angelWife/wms-i18n-hover.git`。
5. 检查扩展的 `name` 和 `displayName`。Marketplace 要求两者均不能与已有扩展冲突。

## 先本地验证

```bash
npm install
npm test
npm run check
npm run package
code --install-extension wukong-i18n-hover-0.1.0.vsix --force
```

打开一个包含 `$.i18n.prop('key')` 的项目，确认悬停结果、语言包路径和行号正确。

## 推荐：网页手工发布

首次发布最稳妥的方式是：

1. 在 Marketplace 管理页进入你的 Publisher。
2. 选择 **New extension** → **Visual Studio Code**。
3. 上传 `wukong-i18n-hover-0.1.0.vsix`。
4. 检查商店详情、图标和 README，确认后发布。

这种方式不需要把发布凭证写入本地文件或项目。

## 命令行发布

安装官方发布工具：

```bash
npm install --global @vscode/vsce
vsce login <你的 Publisher ID>
vsce publish
```

登录时按提示提供 Azure DevOps Personal Access Token。使用 PAT 时，组织范围选择 **All accessible organizations**，权限选择 **Marketplace (Manage)**。

> Microsoft 已公告全局 Azure DevOps PAT 将于 2026-12-01 停用。长期自动发布应迁移到 Microsoft Entra ID；个人首次发布优先使用网页手工上传即可。

## 发布新版本

先修改 `package.json` 的 SemVer 版本并更新 `CHANGELOG.md`，重新测试和打包，再上传新 `.vsix`。也可以执行：

```bash
vsce publish patch
```

注意：`vsce publish patch` 会自动修改版本；在 Git 仓库内还可能创建版本提交和 tag。未确认 Git 变更前不要直接执行。

## 官方文档

- https://code.visualstudio.com/api/working-with-extensions/publishing-extension
- https://code.visualstudio.com/api/references/extension-manifest
