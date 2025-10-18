# 部署说明

本文档说明如何部署该项目到生产环境。

## 开发环境

开发环境已配置Vite代理，可以直接运行：

```bash
npm install
npm run dev
```

开发环境下，所有API请求会通过 `/api` 路径代理到第三方服务器 `https://asteria.r2afosne.dpdns.org`，自动解决CORS问题。

## 生产环境部署

### 方案一：使用Nginx反向代理（推荐）

生产环境推荐使用Nginx作为反向代理，解决CORS跨域问题。

#### 步骤：

1. **构建项目**
   ```bash
   npm run build
   ```
   构建后的文件在 `dist` 目录。

2. **配置Nginx**
   
   参考 `nginx.conf.example` 文件配置Nginx：
   
   ```nginx
   # API代理配置
   location /api/ {
       proxy_pass https://asteria.r2afosne.dpdns.org/;
       proxy_set_header Host asteria.r2afosne.dpdns.org;
       # ... 其他配置
   }
   ```

3. **部署静态文件**
   
   将 `dist` 目录的内容部署到Nginx的根目录。

4. **重启Nginx**
   ```bash
   sudo nginx -t  # 测试配置
   sudo systemctl restart nginx
   ```

### 方案二：修改API基础URL

如果第三方API服务器已经配置了CORS头，可以直接使用：

1. 在 `src/services/api.js` 中，API_BASE已经配置为：
   ```javascript
   const API_BASE = import.meta.env.DEV 
     ? '/api' 
     : 'https://asteria.r2afosne.dpdns.org';
   ```

2. 如果第三方API支持CORS，直接构建部署即可：
   ```bash
   npm run build
   ```

### 方案三：使用Docker部署

项目已包含 `Dockerfile`，可以使用Docker部署：

```bash
# 构建镜像
docker build -t short-tv-ui .

# 运行容器
docker run -p 80:80 short-tv-ui
```

## 配置说明

### API配置

在 `src/services/api.js` 中：
- 开发环境：使用 `/api` 代理路径
- 生产环境：使用实际API地址 `https://asteria.r2afosne.dpdns.org`

### CORS配置

1. **开发环境**: Vite代理自动处理CORS
2. **生产环境**: 
   - 使用Nginx代理（推荐）
   - 或确保API服务器配置CORS头

### Service Worker

Service Worker已优化CORS处理：
- 跨域视频请求不会被缓存，避免CORS错误
- API请求不会被缓存，确保数据实时性
- 只缓存同源静态资源

## 性能优化建议

1. **启用Gzip压缩**
   在Nginx配置中启用gzip压缩，减小传输大小。

2. **配置CDN**
   将静态资源部署到CDN，加速访问。

3. **启用HTTP/2**
   在Nginx中启用HTTP/2，提高加载速度。

4. **配置缓存策略**
   - 静态资源（JS/CSS/图片）：长期缓存
   - HTML文件：不缓存或短期缓存
   - API请求：不缓存

## 常见问题

### Q1: 生产环境出现CORS错误怎么办？

**A**: 有以下几种解决方案：

1. 使用Nginx反向代理（推荐）
2. 配置API服务器的CORS头
3. 使用服务端中间层代理API请求

### Q2: 视频无法播放怎么办？

**A**: 检查以下几点：

1. 确认视频URL可访问
2. 检查视频格式是否为浏览器支持的格式（MP4、HLS等）
3. 查看浏览器控制台的错误信息
4. 确认Service Worker未阻止视频请求

### Q3: 如何查看部署后的日志？

**A**: 

- Nginx日志：`/var/log/nginx/error.log`
- 应用日志：浏览器开发者工具Console
- Service Worker日志：浏览器开发者工具 > Application > Service Workers

## 监控建议

1. **错误监控**: 集成Sentry等错误监控服务
2. **性能监控**: 使用Google Analytics或其他分析工具
3. **日志分析**: 定期检查Nginx访问日志和错误日志

## 安全建议

1. **HTTPS**: 生产环境务必使用HTTPS
2. **CSP**: 配置内容安全策略（Content Security Policy）
3. **限流**: 在Nginx中配置请求限流，防止恶意攻击
4. **防盗链**: 配置视频资源的防盗链保护

## 更新部署

更新应用时：

1. 拉取最新代码
2. 重新构建：`npm run build`
3. 替换dist目录
4. 清除浏览器缓存（如果需要）
5. 更新Service Worker版本号（在 `public/sw.js` 中）
