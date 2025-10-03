import axios from 'axios';

const API_BASE = 'https://asteria.r2afosne.dpdns.org';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
});

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
