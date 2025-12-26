import axios, { AxiosInstance } from 'axios';
import { APIResponse, CategoryResponse, Drama, ParseResponse, RecommendedResponse } from '../types';

const API_BASE = 'https://asteria.r2afosne.dpdns.org';

const api: AxiosInstance = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
});

export const dramaAPI = {
  // 获取分类列表
  getCategories: () => api.get<CategoryResponse>('/vod/categories'),

  // 获取剧集列表
  getDramaList: (categoryId?: string, page: number = 1) => {
    const params = new URLSearchParams();
    if (categoryId) params.append('categoryId', categoryId);
    if (page) params.append('page', page.toString());
    return api.get<APIResponse<Drama>>(`/vod/list?${params.toString()}`);
  },

  // 搜索剧集
  searchDrama: (name: string, page: number = 1) => {
    const params = new URLSearchParams();
    params.append('name', name);
    params.append('page', page.toString());
    return api.get<APIResponse<Drama>>(`/vod/search?${params.toString()}`);
  },

  // 获取随机推荐
  getRandomDrama: () => api.get<RecommendedResponse>('/vod/recommend'),

  // 解析单集视频
  parseEpisode: (id: number, episode: number) =>
    api.get<ParseResponse>(`/vod/parse/single?id=${id}&episode=${episode}`),
};

export default api;
