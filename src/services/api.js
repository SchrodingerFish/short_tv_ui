import axios from 'axios';

const API_BASE = 'https://asteria.r2afosne.dpdns.org';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000, // 减少超时时间到15秒
});

// 添加请求重试拦截器
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;

    // 如果没有配置重试次数，初始化为0
    if (!config.__retryCount) {
      config.__retryCount = 0;
    }

    // 最多重试2次
    if (config.__retryCount < 2) {
      config.__retryCount += 1;
      console.log(`请求失败，正在重试 ${config.__retryCount}/2...`);

      // 等待1秒后重试
      await new Promise(resolve => setTimeout(resolve, 1000));

      return api(config);
    }

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
