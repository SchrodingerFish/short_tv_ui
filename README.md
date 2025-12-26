# 福利短剧 - Vite + React + TypeScript 版本

这是一个基于 Vite + React 开发的现代化短剧播放平台。

## 项目特点

### 🎨 现代化设计
- 深色主题设计，视觉体验优秀
- 流畅的动画效果和交互反馈
- 响应式布局,完美适配移动端和桌面端
- 精美的卡片式海报墙设计

### 🛠️ 技术架构

- **前端框架**: React 18
- **构建工具**: Vite
- **编程语言**: TypeScript
- **状态管理**: Zustand
- **路由管理**: React Router 6
- **视频播放**: ArtPlayer + HLS.js
- **HTTP客户端**: Axios
- **样式方案**: CSS Modules

### 📦 项目结构
```
src/
├── components/          # 组件目录
│   ├── Header/         # 头部组件(搜索、logo、随机推荐、导航)
│   ├── CategoryMenu/   # 分类菜单
│   ├── PosterCard/     # 海报卡片
│   └── VideoPlayer/    # 视频播放器(基于 ArtPlayer)
├── pages/              # 页面目录
│   ├── HomePage/       # 首页(海报墙、分类切换)
│   ├── PlayerPage/     # 播放页(视频播放、剧集列表)
│   ├── HistoryPage/    # 历史记录
│   ├── FavoritesPage/  # 我的收藏
│   └── DownloadsPage/  # 下载管理
├── services/           # 服务层
│   └── api.ts         # API接口封装
├── store/             # 状态管理
│   └── useAppStore.ts # Zustand store
├── styles/            # 全局样式
│   └── global.css
├── types/             # 类型定义
├── App.tsx            # 根组件
└── main.tsx          # 入口文件
```

### ✨ 核心功能

- ✅ 分类浏览 - 多个分类快速切换
- ✅ 搜索功能 - 快速查找短剧
- ✅ 随机推荐 - 一键获取随机短剧
- ✅ 视频播放 - 支持自动播放下一集、长按倍速
- ✅ 剧集切换 - 便捷的剧集选择
- ✅ 收藏功能 - 随时收藏心仪短剧
- ✅ 播放历史 - 自动记录观看进度
- ✅ 下载管理 - 方便管理已下载内容
- ✅ PWA支持 - 可添加到主屏幕，离线体验优化

### 🚀 快速开始

1. 安装依赖
```bash
npm install
```

2. 启动开发服务器
```bash
npm run dev
```

3. 构建生产版本
```bash
npm run build
```

4. 运行生产环境 (使用 serve)
```bash
npm start
```

5. 预览生产版本 (使用 vite preview)
```bash
npm run preview
```

### 📱 响应式设计
- 桌面端: 网格布局,悬停效果
- 平板端: 自适应网格
- 移动端: 优化的触摸交互,简化布局

### 🎯 API接口

项目使用以下API接口:
- `/vod/categories` - 获取分类列表
- `/vod/list` - 获取剧集列表
- `/vod/search` - 搜索剧集
- `/vod/recommend` - 随机推荐
- `/vod/parse/single` - 解析视频地址


#### 架构优势
- **组件化**: 采用React组件化开发,代码复用性高
- **状态管理**: 使用Zustand统一管理全局状态
- **类型安全**: 更好的代码组织和维护性
- **构建优化**: Vite提供极速的开发体验

#### UI/UX提升
- **更现代的设计**: 采用深色主题和渐变效果
- **更流畅的动画**: 优化的过渡动画和加载状态
- **更好的交互**: 悬停效果、点击反馈等细节优化
- **更清晰的结构**: 组件化的布局更易维护

#### 性能优化
- **按需加载**: 组件懒加载
- **状态优化**: 高效的状态更新机制
- **构建优化**: Vite的快速冷启动和热更新

### 📄 许可证
MIT License
