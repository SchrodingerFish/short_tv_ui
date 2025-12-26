// 分类信息
export interface Category {
  type_id: string;   // 分类ID
  type_name: string; // 分类名称
}

// 剧集基本信息
export interface Drama {
  id: number;
  name: string;
  cover: string;
  update_time?: string;
  score: number;
}

export interface CategoryResponse {
  categories: Category[];
  total: number;
}

export interface APIResponse<T> {
  total: number;
  totalPages: number;
  currentPage: number;
  list: T[];
}

export interface RecommendedDrama {
  vod_id: number;
  vod_name: string;
  vod_pic: string;
  vod_remarks: string;
  vod_score: number;
  vod_year: number;
  vod_area: string;
}

// 推荐接口返回结果
export interface RecommendedResponse {
  mode: string;
  categoryId: number;
  categoryName: string | null;
  total: number;
  items: RecommendedDrama[];
}

// 视频解析接口返回结果
export interface ParseResponse {
  videoId: string;
  videoName: string;
  episode: {
    index: number;
    label: string;
    parsedUrl: string;
    parseInfo: {
      headers: Record<string, string>;
      type: string;
    };
  };
  totalEpisodes: number;
  cover: string;
  description: string;
}

export interface EpisodeInfo {
  index: number;
  label: string;
}

export interface HistoryItem {
  id: number;
  name: string;
  pic: string;
  episode: number;
  progress?: number;
  time: number;
}

export interface FavoriteItem {
  id: number;
  name: string;
  pic: string;
  time: number;
}

export interface DownloadItem {
  id: string;
  dramaId: number;
  dramaName: string;
  episode: number;
  status: 'pending' | 'downloading' | 'completed' | 'failed';
  progress: number;
  addedAt: number;
}
