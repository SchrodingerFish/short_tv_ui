import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import VideoPlayer from '../../components/VideoPlayer/VideoPlayer';
import { dramaAPI } from '../../services/api';
import { useAppStore } from '../../store/useAppStore';
import { Drama, EpisodeInfo, ParseResponse } from '../../types';
import './PlayerPage.css';

const PlayerPage: React.FC = () => {
  const { dramaId } = useParams<{ dramaId: string }>();
  const id = Number(dramaId);
  const { 
    addHistory, 
    updateHistoryProgress, 
    getHistoryByDrama,
    favorites,
    toggleFavorite,
    isFavorite,
    addBatchDownloads
  } = useAppStore();

  const [currentEpisode, setCurrentEpisode] = useState(0); // 0-indexed
  const [videoUrl, setVideoUrl] = useState('');
  const [dramaMetadata, setDramaMetadata] = useState<ParseResponse | null>(null);
  const [episodeList, setEpisodeList] = useState<EpisodeInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialTime, setInitialTime] = useState(0);
  const [showFinishTip, setShowFinishTip] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [selectedEpisodes, setSelectedEpisodes] = useState<number[]>([]);

  // 加载剧集元数据（通过解析第一集获取）
  const loadMetadataAndPlay = useCallback(async (epIndex: number, seekTime: number = 0) => {
    try {
      setIsLoading(true);
      setError(null);
      const { data } = await dramaAPI.parseEpisode(id, epIndex + 1);
      
      if (!data) throw new Error('未获取到剧集数据');

      setDramaMetadata(data);
      setVideoUrl(data.episode.parsedUrl);
      setInitialTime(seekTime);
      setCurrentEpisode(epIndex);

      // 生成集数列表
      const list: EpisodeInfo[] = [];
      const total = Number(data.totalEpisodes) || 0;
      for (let i = 1; i <= total; i++) {
        list.push({ index: i - 1, label: `第${i}集` });
      }
      setEpisodeList(list);

      // 保存到历史记录
      addHistory({
        id: id,
        name: data.videoName,
        pic: data.cover,
        episode: epIndex,
        progress: seekTime
      });

    } catch (err: any) {
      console.error('加载视频失败:', err);
      setError(err.message || '加载视频失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  }, [id, addHistory]);

  // 初始化进入
  useEffect(() => {
    const hist = getHistoryByDrama(id);
    const savedEpisode = hist?.episode ?? 0;
    const savedProgress = hist?.progress ?? 0;
    loadMetadataAndPlay(savedEpisode, savedProgress);
  }, [id, getHistoryByDrama, loadMetadataAndPlay]);

  // 切换集数
  const handleEpisodeClick = (index: number) => {
    if (index === currentEpisode) return;
    setShowFinishTip(false);
    loadMetadataAndPlay(index, 0);
  };

  const handleProgress = (current: number, duration: number) => {
    updateHistoryProgress(id, currentEpisode, current, duration);
  };

  const handleEnded = () => {
    if (currentEpisode < episodeList.length - 1) {
      handleEpisodeClick(currentEpisode + 1);
    } else {
      setShowFinishTip(true);
    }
  };

  const handleDownloadClick = () => {
    setSelectedEpisodes([]);
    setShowDownloadModal(true);
  };

  const toggleEpisodeSelection = (index: number) => {
    setSelectedEpisodes(prev => 
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  const handleConfirmDownload = async () => {
    if (selectedEpisodes.length === 0) return;
    
    setIsDownloading(true);
    try {
      const drama: Drama = {
        id,
        name: dramaMetadata?.videoName || '',
        cover: dramaMetadata?.cover || '',
        update_time: '',
        score: 0
      };

      // 真正解析所有选中的集数
      const downloadsWithDetails = await Promise.all(selectedEpisodes.map(async (idx) => {
         if (idx === currentEpisode && videoUrl) {
           return { index: idx, url: videoUrl };
         }
         try {
           const { data } = await dramaAPI.parseEpisode(id, idx + 1);
           return { index: idx, url: data.episode.parsedUrl };
         } catch (e) {
           console.error(`解析第 ${idx + 1} 集失败:`, e);
           return { index: idx, url: '' };
         }
      }));

      const successfulDownloads = downloadsWithDetails.filter(d => d.url !== '');
      
      if (successfulDownloads.length > 0) {
        addBatchDownloads(drama, successfulDownloads);
        setShowDownloadModal(false);
        if (successfulDownloads.length < selectedEpisodes.length) {
          alert(`成功加入 ${successfulDownloads.length} 集，部分集数解析失败。`);
        } else {
          alert(`已成功将 ${successfulDownloads.length} 个剧集加入下载队列`);
        }
      } else {
        alert('解析剧集链接失败，请重试');
      }
    } catch (err) {
      alert('下载任务发起失败');
    } finally {
      setIsDownloading(false);
    }
  };

  const isFavorited = isFavorite(id);

  if (isLoading && !dramaMetadata) {
    return (
      <div className="player-loading">
        <div className="loader"></div>
        <p>正在解析剧集信息，请稍候...</p>
      </div>
    );
  }

  if (error && !dramaMetadata) {
    return (
      <div className="player-error">
        <div className="error-icon">⚠️</div>
        <h3>数据加载失败</h3>
        <p>{error}</p>
        <button className="retry-btn" onClick={() => window.location.reload()}>重试</button>
      </div>
    );
  }

  return (
    <div className="player-page container fade-in">
      <div className="player-layout">
        <div className="player-main">
          <div className="video-section">
            <VideoPlayer
              videoUrl={videoUrl}
              onProgressUpdate={handleProgress}
              onEnded={handleEnded}
              initialTime={initialTime}
              isLoading={isLoading}
            />
          </div>

          <div className="drama-info-section">
            <div className="drama-header">
              <h1 className="drama-title">{dramaMetadata?.videoName}</h1>
              <div className="drama-actions">
                <button 
                   className="download-btn-v2"
                   onClick={handleDownloadClick}
                >
                  批量下载
                </button>
                <button 
                  className={`fav-btn-v2 ${isFavorited ? 'active' : ''}`}
                  onClick={() => {
                    if (dramaMetadata) {
                      toggleFavorite({
                        id: id,
                        name: dramaMetadata.videoName,
                        cover: dramaMetadata.cover,
                        update_time: '',
                        score: 0
                      });
                    }
                  }}
                  title={isFavorited ? '取消收藏' : '收藏'}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill={isFavorited ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="drama-desc">
              <p>{dramaMetadata?.description}</p>
            </div>
          </div>

          <div className="episode-selector">
            <div className="selector-header">
              <h2>剧集列表</h2>
              <span className="count">全 {dramaMetadata?.totalEpisodes} 集</span>
            </div>
            <div className="episode-grid">
              {episodeList.map((ep) => (
                <button
                  key={ep.index}
                  className={`episode-item ${currentEpisode === ep.index ? 'active' : ''}`}
                  onClick={() => handleEpisodeClick(ep.index)}
                >
                  {ep.index + 1}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showDownloadModal && (
        <div className="download-modal-overlay">
          <div className="download-modal-content">
            <div className="download-modal-header">
              <h2>选择下载剧集</h2>
              <button className="close-btn" onClick={() => setShowDownloadModal(false)}>×</button>
            </div>
            <div className="download-modal-actions">
              <button 
                className="select-all-btn"
                onClick={() => {
                  if (selectedEpisodes.length === episodeList.length) {
                    setSelectedEpisodes([]);
                  } else {
                    setSelectedEpisodes(episodeList.map(e => e.index));
                  }
                }}
              >
                {selectedEpisodes.length === episodeList.length ? '取消全选' : '全选'}
              </button>
              <span className="selected-count">已选 {selectedEpisodes.length} 集</span>
            </div>
            <div className="episode-select-grid">
              {episodeList.map((ep) => (
                <div 
                  key={ep.index} 
                  className={`episode-select-item ${selectedEpisodes.includes(ep.index) ? 'selected' : ''}`}
                  onClick={() => toggleEpisodeSelection(ep.index)}
                >
                  {ep.index + 1}
                </div>
              ))}
            </div>
            <div className="download-modal-footer">
              <button className="cancel-btn" disabled={isDownloading} onClick={() => setShowDownloadModal(false)}>取消</button>
              <button 
                className="confirm-btn" 
                disabled={selectedEpisodes.length === 0 || isDownloading}
                onClick={handleConfirmDownload}
              >
                {isDownloading ? '正在解析...' : '立即下载'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showFinishTip && (
        <div className="finish-overlay">
          <div className="finish-content">
            <h3>本次阅读已完成</h3>
            <p>感谢观看 {dramaMetadata?.videoName}</p>
            <button onClick={() => setShowFinishTip(false)}>重新观看</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayerPage;
