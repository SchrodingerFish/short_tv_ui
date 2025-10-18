import axios from 'axios';

// 开发环境使用代理，生产环境使用实际API地址
const API_BASE = import.meta.env.DEV 
  ? '/api' 
  : 'https://asteria.r2afosne.dpdns.org';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 20000, // 增加超时时间到20秒，避免过早超时
  headers: {
    'Content-Type': 'application/json',
  }
});

// 添加请求拦截器，记录请求信息
api.interceptors.request.use(
  (config) => {
    console.log('发起API请求:', config.url);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 优化响应拦截器，减少不必要的重试
api.interceptors.response.use(
  (response) => {
    console.log('API请求成功:', response.config.url);
    return response;
  },
  async (error) => {
    const config = error.config;

    // 如果没有配置重试次数，初始化为0
    if (!config.__retryCount) {
      config.__retryCount = 0;
    }

    // 只对网络错误或超时错误重试，不对4xx/5xx错误重试
    const shouldRetry = !error.response || error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK';
    
    // 最多重试1次（减少重试次数，避免过度重试）
    if (shouldRetry && config.__retryCount < 1) {
      config.__retryCount += 1;
      console.log(`网络请求失败，正在重试 ${config.__retryCount}/1...`);

      // 等待1.5秒后重试
      await new Promise(resolve => setTimeout(resolve, 1500));

      return api(config);
    }

    console.error('API请求失败:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const dramaAPI = {
  // 获取分类列表
  getCategories: () => api.get('/vod/categories'),

  // 获取剧集列表
  getDramaList: (categoryId, page = 1) =>
    api.get(`/vod/list?categoryId=${categoryId}&page=${page}`),

  // 搜索剧集
  searchDrama: (name, page = 1) =>
    api.get(`/vod/search?name=${encodeURIComponent(name)}&page=${page}`),

  // 获取随机推荐
  getRandomDrama: () => api.get('/vod/recommend'),

  // 解析单集视频
  parseEpisode: (id, episode) =>
    api.get(`/vod/parse/single?id=${id}&episode=${episode}`),
};

export default api;
