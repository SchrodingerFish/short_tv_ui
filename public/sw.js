const CACHE_NAME = 'short-tv-cache-v1';
const VIDEO_CACHE_NAME = 'short-tv-video-cache-v1';

// 预缓存的静态资源
const STATIC_ASSETS = [
  '/',
  '/index_new.html',
  '/manifest.json'
];

// 安装事件
self.addEventListener('install', (event) => {
  console.log('Service Worker 安装中...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('缓存静态资源');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// 激活事件
self.addEventListener('activate', (event) => {
  console.log('Service Worker 激活中...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME && cacheName !== VIDEO_CACHE_NAME) {
            console.log('删除旧缓存:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 拦截请求
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 视频文件缓存策略 - 跳过跨域视频请求，避免 CORS 问题
  if (request.url.includes('.mp4') || request.url.includes('.m3u8')) {
    // 如果是跨域请求，直接放行，不做缓存处理
    if (!request.url.startsWith(self.location.origin)) {
      return;
    }

    event.respondWith(
      caches.open(VIDEO_CACHE_NAME).then(cache => {
        return cache.match(request).then(response => {
          if (response) {
            console.log('从缓存返回视频:', request.url);
            return response;
          }

          return fetch(request, { mode: 'no-cors' }).then(networkResponse => {
            // 只缓存成功的响应
            if (networkResponse && networkResponse.status === 200) {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          }).catch(error => {
            console.error('视频加载失败:', error);
            throw error;
          });
        });
      })
    );
    return;
  }

  // 其他资源使用网络优先策略
  event.respondWith(
    fetch(request)
      .then(response => {
        // 克隆响应
        const responseToCache = response.clone();

        // 缓存成功的响应
        if (response.status === 200) {
          caches.open(CACHE_NAME).then(cache => {
            cache.put(request, responseToCache);
          });
        }

        return response;
      })
      .catch(() => {
        // 网络失败时从缓存返回
        return caches.match(request);
      })
  );
});

// 处理消息
self.addEventListener('message', (event) => {
  console.log('Service Worker 收到消息:', event.data);

  if (event.data && event.data.type === 'CACHE_VIDEO') {
    const videoUrl = event.data.url;

    caches.open(VIDEO_CACHE_NAME).then(cache => {
      fetch(videoUrl)
        .then(response => {
          if (response.status === 200) {
            cache.put(videoUrl, response.clone());
            event.ports[0].postMessage({
              status: 'VIDEO_CACHED',
              url: videoUrl
            });
          } else {
            event.ports[0].postMessage({
              status: 'CACHE_ERROR',
              url: videoUrl,
              error: 'Response status: ' + response.status
            });
          }
        })
        .catch(error => {
          event.ports[0].postMessage({
            status: 'CACHE_ERROR',
            url: videoUrl,
            error: error.message
          });
        });
    });
  }

  if (event.data && event.data.type === 'CHECK_CACHE') {
    const videoUrl = event.data.url;

    caches.open(VIDEO_CACHE_NAME).then(cache => {
      cache.match(videoUrl).then(response => {
        event.ports[0].postMessage({
          status: 'CACHE_CHECK_RESULT',
          url: videoUrl,
          isCached: !!response
        });
      });
    });
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.delete(VIDEO_CACHE_NAME).then(() => {
      event.ports[0].postMessage({
        status: 'CACHE_CLEARED'
      });
    });
  }
});
