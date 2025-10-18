# Cloudflare Pages 部署配置更改说明

## 概述

本次更改为项目添加了完整的 Cloudflare Pages 部署支持，无需 nginx 或其他 Web 服务器。

## 新增文件

### 核心配置文件

1. **`public/_redirects`**
   - Cloudflare Pages SPA 路由配置
   - 替代 nginx 的 `try_files` 指令
   - 处理客户端路由，确保刷新不会 404

2. **`public/_headers`**
   - HTTP 响应头配置
   - 替代 nginx 的 `add_header` 指令
   - 配置缓存策略、安全头部等

3. **`wrangler.toml`**
   - Wrangler CLI 配置文件
   - 用于命令行部署到 Cloudflare Pages

### 文档文件

4. **`CLOUDFLARE_PAGES_DEPLOYMENT.md`**
   - 详细的英文部署指南
   - 包含配置说明、验证步骤、常见问题

5. **`CLOUDFLARE_PAGES_部署指南.md`**
   - 详细的中文部署指南
   - 三种部署方式的详细步骤
   - 常见问题和解决方案

6. **`.cloudflare-pages-quickstart.md`**
   - 快速部署参考
   - 简洁的步骤说明

### CI/CD 配置

7. **`.github/workflows/deploy-cloudflare-pages.yml`**
   - GitHub Actions 自动部署工作流
   - 支持主分支自动部署
   - 支持 PR 预览部署

## 修改文件

### `README.md`
- 添加了 "部署" 章节
- 包含 Cloudflare Pages 部署说明
- 添加了 Docker 部署说明（原有方式）

### `package.json`
- 添加了 `deploy:cf` 脚本：构建并部署到 Cloudflare Pages
- 添加了 `dev:cf` 脚本：本地测试 Cloudflare Pages 环境

## 工作原理

### SPA 路由处理

**传统 nginx 方式**:
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

**Cloudflare Pages 方式**:
```
# _redirects 文件
/*  /index.html  200
```

### 缓存策略

**传统 nginx 方式**:
```nginx
location /assets/ {
    add_header Cache-Control "public, max-age=31536000, immutable";
}
```

**Cloudflare Pages 方式**:
```
# _headers 文件
/assets/*.js
  Cache-Control: public, max-age=31536000, immutable
```

## 部署方式

### 方式 1: Cloudflare Dashboard（推荐新手）
1. 连接 Git 仓库
2. 配置构建设置
3. 自动部署

### 方式 2: Wrangler CLI（推荐开发者）
```bash
npm run deploy:cf
```

### 方式 3: GitHub Actions（推荐团队）
- 推送到 main 分支自动部署
- PR 自动创建预览部署

## 验证部署

构建后，`dist` 目录会包含：
- `_redirects` - 从 `public/_redirects` 复制
- `_headers` - 从 `public/_headers` 复制
- 其他静态资源

可以使用以下命令验证：
```bash
npm run build
ls dist/_redirects dist/_headers
```

## 与原部署方式的区别

| 特性 | Docker + serve/nginx | Cloudflare Pages |
|------|---------------------|------------------|
| 服务器 | 需要自己管理 | 全托管，无需管理 |
| 配置 | nginx.conf 或 CLI 参数 | _redirects + _headers |
| SSL | 需要自己配置 | 自动提供 |
| CDN | 需要额外配置 | 内置全球 CDN |
| 成本 | 服务器费用 | 免费（有配额限制） |
| 扩展 | 手动扩展 | 自动扩展 |

## 兼容性

- 保留了原有的 `Dockerfile`，仍然可以使用 Docker 部署
- 新增的配置不影响本地开发（`npm run dev`）
- 构建命令保持不变（`npm run build`）

## 下一步

1. 选择一种部署方式
2. 参考对应的文档进行部署
3. 验证部署成功

详细说明请查看：
- 中文指南：`CLOUDFLARE_PAGES_部署指南.md`
- 英文指南：`CLOUDFLARE_PAGES_DEPLOYMENT.md`
- 快速参考：`.cloudflare-pages-quickstart.md`
