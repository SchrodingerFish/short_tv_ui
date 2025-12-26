# Cloudflare Pages 部署指南

本项目已配置为支持 Cloudflare Pages 部署。

## 部署步骤

1.  登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)。
2.  进入 **Workers & Pages** -> **Pages**。
3.  点击 **Connect to Git**。
4.  选择包含本项目的 GitHub 仓库 `short_tv_ui`。
5.  配置构建设置：
    - **Project name**: `short-tv-ui` (或自定义)
    - **Production branch**: `main` (或你的主分支)
    - **Framework preset**: `Vite`
    - **Build command**: `npm run build`
    - **Build output directory**: `dist`
6.  点击 **Save and Deploy**。

## 关键配置说明

- **SPA 路由支持**: 项目包含了 `public/_redirects` 文件，确保刷新页面时能够正确指向 `index.html`，这是 Cloudflare Pages 支持单页应用 (SPA) 路由的标准做法。
- **Base Path**: `vite.config.ts` 中的 `base` 已设置为 `/`，确保资源路径正确。
