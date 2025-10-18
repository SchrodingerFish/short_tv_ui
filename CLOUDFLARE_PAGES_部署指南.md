# Cloudflare Pages 部署指南（中文版）

## 🎯 概述

本项目已经配置好可以直接部署到 Cloudflare Pages，**无需 nginx 或任何其他 Web 服务器**。

所有必要的配置文件都已准备好：
- ✅ `public/_redirects` - SPA 路由配置
- ✅ `public/_headers` - HTTP 头部和缓存策略
- ✅ `wrangler.toml` - Wrangler CLI 配置
- ✅ `.github/workflows/deploy-cloudflare-pages.yml` - GitHub Actions 自动部署

## 🚀 三种部署方式

### 方式 1: Cloudflare Dashboard（推荐，最简单）

**适合**: 初次部署、不熟悉命令行的用户

**步骤**:

1. **登录 Cloudflare**
   - 访问 https://dash.cloudflare.com/
   - 如果没有账号，先注册一个（免费）

2. **创建 Pages 项目**
   - 点击左侧菜单 **Pages**
   - 点击 **创建项目**
   - 选择 **连接到 Git**

3. **连接 Git 仓库**
   - 选择 GitHub 或 GitLab
   - 授权 Cloudflare 访问您的仓库
   - 选择这个项目的仓库

4. **配置构建设置**
   ```
   项目名称: short-tv-ui （或您喜欢的名字）
   生产分支: main （或 master）
   框架预设: Vite
   构建命令: npm run build
   构建输出目录: dist
   根目录: /
   ```

5. **设置环境变量**（可选但推荐）
   - 点击 **环境变量**
   - 添加变量：
     - 变量名: `NODE_VERSION`
     - 值: `20`

6. **开始部署**
   - 点击 **保存并部署**
   - 等待 1-3 分钟，首次部署完成
   - 系统会给您一个 `xxx.pages.dev` 的域名

7. **绑定自定义域名**（可选）
   - 部署成功后，进入项目设置
   - 选择 **自定义域**
   - 添加您的域名

### 方式 2: Wrangler CLI（适合开发者）

**适合**: 熟悉命令行、需要频繁手动部署的用户

**步骤**:

1. **安装 Wrangler CLI**
   ```bash
   npm install -g wrangler
   ```

2. **登录 Cloudflare**
   ```bash
   wrangler login
   ```
   - 会打开浏览器进行授权

3. **部署项目**
   ```bash
   # 使用快捷命令
   npm run deploy:cf
   
   # 或者手动执行
   npm run build
   wrangler pages deploy dist --project-name=short-tv-ui
   ```
   
   - 首次部署会提示创建项目
   - 后续部署会自动更新

4. **本地测试 Cloudflare Pages 环境**
   ```bash
   npm run dev:cf
   ```
   - 这会在本地启动一个模拟 Cloudflare Pages 的环境
   - 可以测试 `_redirects` 和 `_headers` 规则

### 方式 3: GitHub Actions 自动部署（最专业）

**适合**: 团队协作、需要 CI/CD 流程的项目

**步骤**:

1. **获取 Cloudflare API Token**
   - 登录 Cloudflare Dashboard
   - 点击右上角头像 → **My Profile**
   - 左侧菜单 → **API Tokens**
   - 点击 **创建令牌**
   - 选择 **Cloudflare Pages - Edit** 模板
   - 或者自定义权限：Account - Cloudflare Pages - Edit
   - 点击 **继续**，复制生成的 Token（只显示一次！）

2. **获取 Cloudflare Account ID**
   - 返回 Cloudflare Dashboard 主页
   - 在右侧边栏可以看到 **Account ID**
   - 复制它

3. **配置 GitHub Secrets**
   - 进入 GitHub 仓库
   - 点击 **Settings** → **Secrets and variables** → **Actions**
   - 点击 **New repository secret**
   - 添加两个 Secrets：
     - 名称: `CLOUDFLARE_API_TOKEN`，值: 步骤 1 的 Token
     - 名称: `CLOUDFLARE_ACCOUNT_ID`，值: 步骤 2 的 Account ID

4. **触发自动部署**
   - 推送代码到 `main` 或 `master` 分支
   - GitHub Actions 会自动构建和部署
   - 可以在 **Actions** 标签页查看部署进度

5. **PR 预览部署**
   - 创建 Pull Request 时会自动创建预览部署
   - 每个 PR 都有独立的预览 URL
   - 合并后会自动部署到生产环境

## ✅ 验证部署

部署成功后，请测试以下功能：

### 1. 基本访问
- [ ] 访问首页正常显示
- [ ] 可以浏览短剧列表

### 2. 路由功能
- [ ] 点击短剧可以进入播放页面
- [ ] 直接访问 `https://your-domain/player` 不会 404
- [ ] 在任意页面刷新不会出现 404 错误
- [ ] 浏览器前进/后退按钮正常工作

### 3. PWA 功能
- [ ] 打开浏览器开发者工具（F12）
- [ ] 进入 **Application** → **Service Workers**
- [ ] 应该看到 Service Worker 已注册
- [ ] 可以添加到主屏幕（移动端）

### 4. 性能检查
- [ ] 打开开发者工具 → **Network** 面板
- [ ] 刷新页面
- [ ] 检查 JS/CSS 文件的响应头：
  - 应该有 `Cache-Control: public, max-age=31536000, immutable`
- [ ] 检查 HTML 文件的响应头：
  - 应该有 `Cache-Control: no-cache, no-store, must-revalidate`

## 🔧 配置文件说明

### `public/_redirects`

控制 URL 路由行为：

```
# 静态资源直接返回
/assets/*  200
/manifest.json  200
/sw.js  200

# 所有其他路由返回 index.html（SPA 路由）
/*  /index.html  200
```

**作用**: 替代 nginx 的 `try_files $uri /index.html` 配置

### `public/_headers`

控制 HTTP 响应头：

```
# Service Worker - 不缓存
/sw.js
  Cache-Control: no-cache, no-store, must-revalidate

# 静态资源 - 长期缓存
/assets/*.js
  Cache-Control: public, max-age=31536000, immutable
```

**作用**: 替代 nginx 的 `add_header` 指令

### `wrangler.toml`

Wrangler CLI 的配置文件，定义项目名称和构建输出目录。

### `.github/workflows/deploy-cloudflare-pages.yml`

GitHub Actions 工作流，自动化构建和部署流程。

## 🐛 常见问题

### 问题 1: 刷新页面出现 404

**原因**: `_redirects` 文件没有生效

**解决方案**:
```bash
# 1. 确认文件存在
ls public/_redirects

# 2. 重新构建
npm run build

# 3. 检查是否复制到输出目录
ls dist/_redirects

# 4. 如果存在，重新部署
npm run deploy:cf
```

### 问题 2: Service Worker 不工作

**原因**: 浏览器缓存或 HTTPS 问题

**解决方案**:
- Service Worker 只在 HTTPS 或 localhost 下工作
- Cloudflare Pages 自动提供 HTTPS，无需配置
- 清除浏览器缓存重试
- 检查控制台是否有错误信息

### 问题 3: 静态资源 404

**原因**: Vite 配置问题

**检查**:
```javascript
// vite.config.js
export default defineConfig({
  base: '/',  // 确保是根路径
  publicDir: 'public',  // 确保公共目录正确
  build: {
    outDir: 'dist',  // 确保输出目录正确
  }
})
```

### 问题 4: 部署后页面是空白

**可能原因**:
1. API 地址配置错误
2. 控制台有 JavaScript 错误

**解决方案**:
- 打开浏览器控制台（F12）查看错误信息
- 检查 Network 面板，看 API 请求是否成功
- 检查 `src/services/api.js` 中的 API 地址配置

### 问题 5: GitHub Actions 部署失败

**检查清单**:
- [ ] `CLOUDFLARE_API_TOKEN` 是否正确设置
- [ ] `CLOUDFLARE_ACCOUNT_ID` 是否正确设置
- [ ] API Token 的权限是否包含 Cloudflare Pages Edit
- [ ] 项目名称（projectName）是否与实际一致

## 🌟 与 nginx 部署的对比

| 特性 | nginx 部署 | Cloudflare Pages |
|------|-----------|------------------|
| **服务器管理** | 需要自己管理服务器 | 无需管理，全托管 |
| **配置文件** | `nginx.conf` | `_redirects` + `_headers` |
| **SSL 证书** | 需要自己申请和配置 | 自动提供，自动续期 |
| **CDN** | 需要额外配置 | 内置全球 CDN |
| **扩展性** | 需要手动扩展服务器 | 自动扩展，无限流量 |
| **成本** | 服务器费用 + 运维成本 | 免费（有配额限制） |
| **部署速度** | 需要手动部署或配置 CI/CD | Git push 自动部署 |
| **回滚** | 需要手动回滚 | 一键回滚到任何版本 |

## 📊 Cloudflare Pages 免费配额

- ✅ 无限请求数
- ✅ 无限带宽
- ✅ 500 次构建/月
- ✅ 1 次并发构建
- ✅ 自定义域名
- ✅ 自动 HTTPS
- ✅ 预览部署
- ✅ 全球 CDN

**对于大多数个人项目和小型团队项目，免费配额完全够用！**

## 🎓 进阶技巧

### 1. 配置多个环境

在 Cloudflare Pages 项目设置中，可以为不同分支配置不同的环境变量：

- 生产环境（production）: `main` 分支
- 预览环境（preview）: 其他分支和 PR

### 2. 自定义构建命令

如果需要在构建时执行额外的命令，可以修改 `package.json`:

```json
{
  "scripts": {
    "build": "vite build",
    "build:prod": "NODE_ENV=production vite build"
  }
}
```

### 3. 配置函数（Functions）

Cloudflare Pages 支持 Serverless Functions。在项目根目录创建 `functions` 目录：

```
functions/
  api/
    hello.js  → 对应 /api/hello 路由
```

### 4. 分析和监控

在 Cloudflare Dashboard 的 Pages 项目中，可以查看：
- 部署历史和日志
- 实时访问分析
- 性能指标
- 错误日志

## 🔗 相关资源

- [Cloudflare Pages 官方文档](https://developers.cloudflare.com/pages/)
- [Redirects 配置文档](https://developers.cloudflare.com/pages/platform/redirects/)
- [Headers 配置文档](https://developers.cloudflare.com/pages/platform/headers/)
- [Wrangler CLI 文档](https://developers.cloudflare.com/workers/wrangler/)
- [GitHub Actions 配置示例](https://github.com/cloudflare/pages-action)

## 💡 提示

1. **首次部署**建议使用 Dashboard 方式，简单直观
2. **开发阶段**使用 Wrangler CLI，方便快速迭代
3. **团队协作**使用 GitHub Actions，自动化部署流程
4. 遇到问题先查看 Cloudflare Pages 的**构建日志**
5. 善用**预览部署**功能，在合并前测试更改

## 🎉 开始部署

选择上面的任一方式开始部署吧！推荐从最简单的 Dashboard 方式开始。

有问题欢迎查看 [详细部署文档](./CLOUDFLARE_PAGES_DEPLOYMENT.md) 或 [快速开始](./.cloudflare-pages-quickstart.md)。
