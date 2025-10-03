import { create } from 'zustand';

export const useAppStore = create((set, get) => ({
  // 分类相关
  categories: [],
  currentCategory: null,
  setCategories: (categories) => set({ categories }),
  setCurrentCategory: (category) => set({ currentCategory: category }),

  // 剧集列表
  dramaList: [],
  currentPage: 1,
  totalPages: 1,
  isLoading: false,
  setDramaList: (list) => set({ dramaList: list }),
  setPage: (page, total) => set({ currentPage: page, totalPages: total }),
  setLoading: (loading) => set({ isLoading: loading }),

  // 搜索
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),

  // 当前播放
  currentDrama: null,
  currentEpisode: 0,
  episodes: [],
  setCurrentDrama: (drama) => set({ currentDrama: drama }),
  setCurrentEpisode: (index) => set({ currentEpisode: index }),
  setEpisodes: (episodes) => set({ episodes }),

  // 视频缓存状态
  cachedVideos: new Set(),
  cachingVideos: new Set(),
  failedVideos: new Set(),
  markAsCached: (url) => {
    const { cachedVideos, cachingVideos } = get();
    cachingVideos.delete(url);
    cachedVideos.add(url);
    set({ cachedVideos: new Set(cachedVideos), cachingVideos: new Set(cachingVideos) });
  },
  markAsCaching: (url) => {
    const { cachingVideos } = get();
    cachingVideos.add(url);
    set({ cachingVideos: new Set(cachingVideos) });
  },
  markAsFailed: (url) => {
    const { failedVideos, cachingVideos } = get();
    cachingVideos.delete(url);
    failedVideos.add(url);
    set({ failedVideos: new Set(failedVideos), cachingVideos: new Set(cachingVideos) });
  },
}));
