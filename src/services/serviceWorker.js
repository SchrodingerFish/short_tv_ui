// 注册 Service Worker
export const registerServiceWorker = () => {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then(registration => {
          console.log('Service Worker 注册成功:', registration);
        })
        .catch(error => {
          console.log('Service Worker 注册失败:', error);
        });
    });
  }
};

// 预缓存视频
export const precacheVideo = (videoUrl) => {
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    const messageChannel = new MessageChannel();

    messageChannel.port1.onmessage = (event) => {
      if (event.data?.status === 'VIDEO_CACHED') {
        console.log('视频缓存成功:', event.data.url);
      } else if (event.data?.status === 'CACHE_ERROR') {
        console.error('视频缓存失败:', event.data.error);
      }
    };

    navigator.serviceWorker.controller.postMessage(
      {
        type: 'CACHE_VIDEO',
        url: videoUrl
      },
      [messageChannel.port2]
    );
  }
};

// 检查视频是否已缓存
export const isVideoCached = (videoUrl) => {
  return new Promise((resolve) => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      const messageChannel = new MessageChannel();

      messageChannel.port1.onmessage = (event) => {
        if (event.data?.status === 'CACHE_CHECK_RESULT') {
          resolve(event.data.isCached);
        } else {
          resolve(false);
        }
      };

      navigator.serviceWorker.controller.postMessage(
        {
          type: 'CHECK_CACHE',
          url: videoUrl
        },
        [messageChannel.port2]
      );

      setTimeout(() => resolve(false), 3000);
    } else {
      resolve(false);
    }
  });
};
