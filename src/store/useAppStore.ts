import { create } from 'zustand';
import { Category, Drama, FavoriteItem, HistoryItem } from '../types';

interface DownloadItem {
  id: string;
  dramaId: number;
  dramaName: string;
  dramaCover: string;
  episode: number;
  videoUrl: string; // 存储真实下载地址
  status: 'pending' | 'downloading' | 'completed' | 'failed';
  progress: number;
  addedAt: number;
}

interface AppState {
  // 分类相关
  categories: Category[];
  currentCategory: string | null;
  setCategories: (categories: Category[]) => void;
  setCurrentCategory: (category: string | null) => void;

  // 剧集列表相关
  dramaList: Drama[];
  currentPage: number;
  totalPages: number;
  isLoading: boolean;
  setDramaList: (list: Drama[]) => void;
  setPage: (page: number, total: number) => void;
  setLoading: (loading: boolean) => void;

  // 搜索
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // 当前播放
  currentDrama: Drama | null;
  currentEpisode: number;
  episodes: any[];
  setCurrentDrama: (drama: Drama | null) => void;
  setCurrentEpisode: (index: number) => void;
  setEpisodes: (episodes: any[]) => void;

  // 收藏功能
  favorites: FavoriteItem[];
  addFavorite: (drama: Drama) => void;
  removeFavorite: (dramaId: number) => void;
  toggleFavorite: (drama: Drama) => void;
  isFavorite: (dramaId: number) => boolean;

  // 下载管理
  downloads: DownloadItem[];
  addDownload: (download: Omit<DownloadItem, 'id' | 'status' | 'progress' | 'addedAt'>) => void;
  addBatchDownloads: (drama: Drama, episodes: { index: number; url: string }[]) => void;
  updateDownloadProgress: (id: string, progress: number, status: DownloadItem['status']) => void;
  removeDownload: (id: string) => void;
  clearCompletedDownloads: () => void;
  getDownloadsByDrama: (dramaId: number) => DownloadItem[];

  // 观看历史
  history: HistoryItem[];
  addHistory: (item: Omit<HistoryItem, 'time'>) => void;
  updateHistoryProgress: (dramaId: number, episode: number, currentTime: number, duration: number) => void;
  getHistoryByDrama: (dramaId: number) => HistoryItem | undefined;
  removeHistory: (id: number) => void;
  clearHistory: () => void;
}

const loadFromLS = <T>(key: string, defaultValue: T): T => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) || defaultValue : defaultValue;
  } catch (error) {
    return defaultValue;
  }
};

const saveToLS = <T>(key: string, value: T) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {}
};

export const useAppStore = create<AppState>((set, get) => ({
  categories: [],
  currentCategory: null,
  setCategories: (categories) => set({ categories }),
  setCurrentCategory: (category) => set({ currentCategory: category }),

  dramaList: [],
  currentPage: 1,
  totalPages: 1,
  isLoading: false,
  setDramaList: (list) => set({ dramaList: list }),
  setPage: (page, total) => set({ currentPage: page, totalPages: total }),
  setLoading: (loading) => set({ isLoading: loading }),

  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),

  currentDrama: null,
  currentEpisode: 0,
  episodes: [],
  setCurrentDrama: (drama) => set({ currentDrama: drama }),
  setCurrentEpisode: (index) => set({ currentEpisode: index }),
  setEpisodes: (episodes) => set({ episodes }),

  favorites: loadFromLS('drama_favorites', []),
  addFavorite: (drama) => {
    const { favorites } = get();
    if (!favorites.some(fav => fav.id === drama.id)) {
      const newFav = [...favorites, {
        id: drama.id,
        name: drama.name,
        pic: drama.cover,
        time: Date.now()
      }];
      saveToLS('drama_favorites', newFav);
      set({ favorites: newFav });
    }
  },
  removeFavorite: (dramaId) => {
    const newFav = get().favorites.filter(fav => fav.id !== dramaId);
    saveToLS('drama_favorites', newFav);
    set({ favorites: newFav });
  },
  toggleFavorite: (drama) => {
    const { favorites, addFavorite, removeFavorite } = get();
    if (favorites.some(fav => fav.id === drama.id)) {
      removeFavorite(drama.id);
    } else {
      addFavorite(drama);
    }
  },
  isFavorite: (dramaId) => get().favorites.some(fav => fav.id === dramaId),

  downloads: loadFromLS('drama_downloads', []),
  addDownload: (download) => {
    const { downloads } = get();
    if (!downloads.find(d => d.dramaId === download.dramaId && d.episode === download.episode)) {
      const newD: DownloadItem[] = [...downloads, {
        ...download,
        id: `${download.dramaId}_${download.episode}`,
        status: 'pending',
        progress: 0,
        addedAt: Date.now()
      }];
      saveToLS('drama_downloads', newD);
      set({ downloads: newD });
    }
  },
  addBatchDownloads: (drama, episodes) => {
    const { downloads } = get();
    const newItems: DownloadItem[] = [];
    
    episodes.forEach(ep => {
      const id = `${drama.id}_${ep.index + 1}`;
      if (!downloads.find(d => d.id === id)) {
        newItems.push({
          id,
          dramaId: drama.id,
          dramaName: drama.name,
          dramaCover: drama.cover,
          episode: ep.index + 1,
          videoUrl: ep.url,
          status: 'pending',
          progress: 0,
          addedAt: Date.now()
        });
      }
    });

    if (newItems.length > 0) {
      const updatedDownloads = [...downloads, ...newItems];
      saveToLS('drama_downloads', updatedDownloads);
      set({ downloads: updatedDownloads });
    }
  },
  updateDownloadProgress: (id, progress, status) => {
    const newD = get().downloads.map(d => d.id === id ? { ...d, progress, status } : d);
    saveToLS('drama_downloads', newD);
    set({ downloads: newD });
  },
  removeDownload: (id) => {
    const newD = get().downloads.filter(d => d.id !== id);
    saveToLS('drama_downloads', newD);
    set({ downloads: newD });
  },
  clearCompletedDownloads: () => {
    const newD = get().downloads.filter(d => d.status !== 'completed');
    saveToLS('drama_downloads', newD);
    set({ downloads: newD });
  },
  getDownloadsByDrama: (dramaId) => get().downloads.filter(d => d.dramaId === dramaId),

  history: loadFromLS('drama_history', []),
  addHistory: (item) => {
    const { history } = get();
    const existingIndex = history.findIndex(h => h.id === item.id);
    let newH: HistoryItem[];
    if (existingIndex !== -1) {
      newH = [
        { ...history[existingIndex], ...item, time: Date.now() },
        ...history.filter((_, i) => i !== existingIndex)
      ];
    } else {
      newH = [{ ...item, time: Date.now() } as HistoryItem, ...history];
    }
    newH = newH.slice(0, 100);
    saveToLS('drama_history', newH);
    set({ history: newH });
  },
  updateHistoryProgress: (dramaId, episode, current, _duration) => {
    const { history } = get();
    const idx = history.findIndex(h => h.id === dramaId);
    if (idx !== -1) {
      const updated = { ...history[idx], episode, progress: current, time: Date.now() };
      const newH = [updated, ...history.filter((_, i) => i !== idx)];
      saveToLS('drama_history', newH);
      set({ history: newH });
    }
  },
  getHistoryByDrama: (dramaId) => get().history.find(h => h.id === dramaId),
  removeHistory: (id) => {
    const newH = get().history.filter(h => h.id !== id);
    saveToLS('drama_history', newH);
    set({ history: newH });
  },
  clearHistory: () => {
    saveToLS('drama_history', []);
    set({ history: [] });
  },
}));
