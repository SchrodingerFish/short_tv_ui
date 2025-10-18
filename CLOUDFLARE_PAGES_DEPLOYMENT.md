# Cloudflare Pages 部署指南

本项目已配置为支持 Cloudflare Pages 部署，无需 nginx 或其他 Web 服务器。

## 快速开始

### 1. 通过 Cloudflare Dashboard 部署

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 **Pages** 部分
3. 点击 **创建项目** → **连接到 Git**
4. 选择您的 GitHub/GitLab 仓库
5. 配置构建设置：
   - **框架预设**: `Vite`
   - **构建命令**: `npm run build`
   - **构建输出目录**: `dist`
   - **Node.js 版本**: `20` （在环境变量中设置）

6. 环境变量（可选）：
   ```
   NODE_VERSION=20
   ```

7. 点击 **保存并部署**

### 2. 通过 Wrangler CLI 部署

```bash
# 安装 Wrangler CLI
npm install -g wrangler

# 登录 Cloudflare
wrangler login

# 构建项目
npm run build

# 部署到 Cloudflare Pages
wrangler pages deploy dist --project-name=your-project-name
```

## 配置说明

### `_redirects` 文件

位于 `public/_redirects`，用于配置 SPA 路由规则：

- 静态资源（如 `/assets/*`、`/manifest.json`、`/sw.js` 等）直接返回
- 所有其他路由重定向到 `index.html`，由 React Router 处理客户端路由

这替代了传统的 nginx `try_files` 指令。

### `_headers` 文件

位于 `public/_headers`，配置 HTTP 响应头：

- **Service Worker** (`/sw.js`)：禁用缓存，确保始终获取最新版本
- **HTML 文件**：禁用缓存，包含安全头部
- **静态资源** (`/assets/*`)：长期缓存（1 年），因为 Vite 使用内容哈希命名
- **字体和图片**：长期缓存

这替代了 nginx 的 `add_header` 和 `Cache-Control` 配置。

## 关键特性

### ✅ SPA 路由支持
通过 `_redirects` 文件，所有路由请求都会返回 `index.html`，React Router 会处理客户端路由。

### ✅ PWA 支持
Service Worker (`sw.js`) 已正确配置，支持：
- 离线访问
- 静态资源缓存
- 视频缓存策略

### ✅ 优化的缓存策略
- HTML 不缓存：确保用户始终获取最新内容
- 静态资源长期缓存：带哈希的文件名允许安全的长期缓存
- Service Worker 不缓存：确保 SW 更新及时生效

### ✅ 安全头部
自动添加安全相关的 HTTP 头部：
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`

## 验证部署

部署成功后，访问您的 Cloudflare Pages URL，验证以下功能：

1. **路由**: 直接访问 `/player`、`/favorites` 等路由，应正常加载
2. **刷新**: 在任意页面刷新，应不会出现 404 错误
3. **PWA**: 检查浏览器控制台，Service Worker 应成功注册
4. **缓存**: 查看网络面板，验证静态资源的 `Cache-Control` 头部

## 常见问题

### 刷新页面出现 404

确保 `public/_redirects` 文件存在，并且包含 SPA 回退规则：
```
/*  /index.html  200
```

### Service Worker 不更新

检查 `public/_headers` 文件中 `/sw.js` 的缓存策略：
```
/sw.js
  Cache-Control: no-cache, no-store, must-revalidate
```

### 静态资源加载失败

确保 Vite 配置正确：
- `vite.config.js` 中的 `base` 应为 `/` （默认值）
- `publicDir` 应为 `public` （默认值）

## 与 Docker 部署的区别

| 特性 | Docker (nginx/serve) | Cloudflare Pages |
|------|---------------------|------------------|
| 服务器配置 | nginx.conf 或 serve CLI | `_redirects` + `_headers` |
| SPA 路由 | `try_files` | `/* /index.html 200` |
| 缓存控制 | nginx 指令 | `_headers` 文件 |
| SSL/HTTPS | 需要自行配置 | 自动提供 |
| CDN | 需要额外配置 | 内置全球 CDN |
| 扩展性 | 需要手动管理 | 自动扩展 |

## 本地测试

使用 Wrangler 在本地测试 Cloudflare Pages 环境：

```bash
# 安装 Wrangler
npm install -g wrangler

# 构建项目
npm run build

# 本地运行 Cloudflare Pages 环境
wrangler pages dev dist
```

这将启动一个模拟 Cloudflare Pages 环境的本地服务器，包括 `_redirects` 和 `_headers` 规则。

## 自动部署（CI/CD）

Cloudflare Pages 支持 Git 集成，推送到指定分支会自动触发部署：

- **生产分支**: 默认为 `main` 或 `master`
- **预览分支**: 所有其他分支和 PR 会创建预览部署

也可以使用 GitHub Actions 自定义部署流程：

```yaml
name: Deploy to Cloudflare Pages

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - uses: actions/setup-node@v3
        with:
          node-version: 20
          
      - run: npm ci
      - run: npm run build
      
      - name: Deploy to Cloudflare Pages
        uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: your-project-name
          directory: dist
```

## 更多资源

- [Cloudflare Pages 文档](https://developers.cloudflare.com/pages/)
- [Redirects 配置](https://developers.cloudflare.com/pages/platform/redirects/)
- [Headers 配置](https://developers.cloudflare.com/pages/platform/headers/)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/)
