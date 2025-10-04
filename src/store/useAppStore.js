import { create } from 'zustand';

// 从 localStorage 加载收藏列表
const loadFavorites = () => {
  try {
    const stored = localStorage.getItem('drama_favorites');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('加载收藏列表失败:', error);
    return [];
  }
};

// 保存收藏列表到 localStorage
const saveFavorites = (favorites) => {
  try {
    localStorage.setItem('drama_favorites', JSON.stringify(favorites));
  } catch (error) {
    console.error('保存收藏列表失败:', error);
  }
};

// 从 localStorage 加载下载列表
const loadDownloads = () => {
  try {
    const stored = localStorage.getItem('drama_downloads');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('加载下载列表失败:', error);
    return [];
  }
};

// 保存下载列表到 localStorage
const saveDownloads = (downloads) => {
  try {
    localStorage.setItem('drama_downloads', JSON.stringify(downloads));
  } catch (error) {
    console.error('保存下载列表失败:', error);
  }
};

// 从 localStorage 加载观看历史
const loadHistory = () => {
  try {
    const stored = localStorage.getItem('drama_history');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('加载观看历史失败:', error);
    return [];
  }
};

// 保存观看历史到 localStorage
const saveHistory = (history) => {
  try {
    localStorage.setItem('drama_history', JSON.stringify(history));
  } catch (error) {
    console.error('保存观看历史失败:', error);
  }
};

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

  // 收藏功能
  favorites: loadFavorites(),

  addFavorite: (drama) => {
    const { favorites } = get();
    const exists = favorites.some(fav => fav.id === drama.id);
    if (!exists) {
      const newFavorites = [...favorites, {
        id: drama.id,
        name: drama.name,
        cover: drama.cover,
        score: drama.score,
        update_time: drama.update_time,
        addedAt: Date.now()
      }];
      saveFavorites(newFavorites);
      set({ favorites: newFavorites });
    }
  },

  removeFavorite: (dramaId) => {
    const { favorites } = get();
    const newFavorites = favorites.filter(fav => fav.id !== dramaId);
    saveFavorites(newFavorites);
    set({ favorites: newFavorites });
  },

  toggleFavorite: (drama) => {
    const { favorites, addFavorite, removeFavorite } = get();
    const exists = favorites.some(fav => fav.id === drama.id);
    if (exists) {
      removeFavorite(drama.id);
    } else {
      addFavorite(drama);
    }
  },

  isFavorite: (dramaId) => {
    const { favorites } = get();
    return favorites.some(fav => fav.id === dramaId);
  },

  // 下载管理
  downloads: loadDownloads(),

  addDownload: (download) => {
    const { downloads } = get();
    const exists = downloads.find(d => d.dramaId === download.dramaId && d.episode === download.episode);
    if (!exists) {
      const newDownloads = [...downloads, {
        ...download,
        id: `${download.dramaId}_${download.episode}`,
        status: 'pending', // pending, downloading, completed, failed
        progress: 0,
        addedAt: Date.now()
      }];
      saveDownloads(newDownloads);
      set({ downloads: newDownloads });
    }
  },

  updateDownloadProgress: (id, progress, status) => {
    const { downloads } = get();
    const newDownloads = downloads.map(d =>
      d.id === id ? { ...d, progress, status } : d
    );
    saveDownloads(newDownloads);
    set({ downloads: newDownloads });
  },

  removeDownload: (id) => {
    const { downloads } = get();
    const newDownloads = downloads.filter(d => d.id !== id);
    saveDownloads(newDownloads);
    set({ downloads: newDownloads });
  },

  clearCompletedDownloads: () => {
    const { downloads } = get();
    const newDownloads = downloads.filter(d => d.status !== 'completed');
    saveDownloads(newDownloads);
    set({ downloads: newDownloads });
  },

  getDownloadsByDrama: (dramaId) => {
    const { downloads } = get();
    return downloads.filter(d => d.dramaId === dramaId);
  },

  // 观看历史
  history: loadHistory(),

  addHistory: (historyItem) => {
    const { history } = get();
    // 检查是否已存在该剧集的记录（不管是第几集）
    const existingIndex = history.findIndex(
      h => h.dramaId === historyItem.dramaId
    );

    let newHistory;
    if (existingIndex !== -1) {
      // 如果存在该剧集的记录，更新观看集数、进度和时间，并移到最前面
      const existing = history[existingIndex];
      newHistory = [
        {
          ...existing,
          episode: historyItem.episode,
          episodeLabel: historyItem.episodeLabel,
          currentTime: historyItem.currentTime || 0, // 播放进度（秒）
          duration: historyItem.duration || 0, // 视频总时长（秒）
          watchedAt: Date.now()
        },
        ...history.filter((_, i) => i !== existingIndex)
      ];
    } else {
      // 如果不存在该剧集，添加新记录
      newHistory = [
        {
          ...historyItem,
          id: historyItem.dramaId, // 使用 dramaId 作为唯一标识
          currentTime: historyItem.currentTime || 0,
          duration: historyItem.duration || 0,
          watchedAt: Date.now()
        },
        ...history
      ];
    }

    // 只保留最近 100 条记录
    if (newHistory.length > 100) {
      newHistory = newHistory.slice(0, 100);
    }

    saveHistory(newHistory);
    set({ history: newHistory });
  },

  updateHistoryProgress: (dramaId, episode, currentTime, duration) => {
    const { history } = get();
    const existingIndex = history.findIndex(h => h.dramaId === dramaId);

    if (existingIndex !== -1) {
      const existing = history[existingIndex];
      const newHistory = [
        {
          ...existing,
          episode: episode,
          currentTime: currentTime,
          duration: duration,
          watchedAt: Date.now()
        },
        ...history.filter((_, i) => i !== existingIndex)
      ];
      saveHistory(newHistory);
      set({ history: newHistory });
    }
  },

  getHistoryByDrama: (dramaId) => {
    const { history } = get();
    return history.find(h => h.dramaId === dramaId);
  },

  removeHistory: (id) => {
    const { history } = get();
    const newHistory = history.filter(h => h.id !== id);
    saveHistory(newHistory);
    set({ history: newHistory });
  },

  clearHistory: () => {
    saveHistory([]);
    set({ history: [] });
  },

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
