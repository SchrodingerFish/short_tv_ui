import React from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import VideoPlayer from '../../components/VideoPlayer/VideoPlayer';
import EpisodeList from '../../components/EpisodeList/EpisodeList';
import { useAppStore } from '../../store/useAppStore';
import { dramaAPI } from '../../services/api';
import './PlayerPage.css';

const PlayerPage = () => {
  const { dramaId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {
    currentDrama,
    currentEpisode,
    episodes,
    setCurrentDrama,
    setCurrentEpisode,
    setEpisodes,
    addDownload,
    addHistory,
    updateHistoryProgress,
    getHistoryByDrama,
  } = useAppStore();

  const [videoUrl, setVideoUrl] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [dramaInfo, setDramaInfo] = React.useState(null);
  const [showFinishTip, setShowFinishTip] = React.useState(false);
  const [showDownloadModal, setShowDownloadModal] = React.useState(false);
  const [selectedEpisodes, setSelectedEpisodes] = React.useState([]);
  const [initialTime, setInitialTime] = React.useState(0);

  const loadEpisode = async (episodeIndex) => {
    try {
      setIsLoading(true);
      setVideoUrl(''); // 先清空URL避免显示旧视频

      // API 参数从 1 开始，而不是 0
      const { data } = await dramaAPI.parseEpisode(dramaId, episodeIndex + 1);

      if (data.episode?.parsedUrl) {
        setVideoUrl(data.episode.parsedUrl);
        setDramaInfo({
          title: data.videoName,
          description: data.description,
          cover: data.cover,
          totalEpisodes: data.totalEpisodes || 20,
        });
      } else {
        throw new Error('未获取到视频地址');
      }
    } catch (error) {
      console.error('加载剧集失败:', error);
      const errorMsg = error.response?.data?.message || error.message || '未知错误';
      alert(`加载失败: ${errorMsg}\n请尝试切换其他剧集或稍后重试`);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    if (!dramaId) {
      navigate('/');
      return;
    }

    const initPlayer = async () => {
      try {
        setIsLoading(true);
        console.log('正在初始化播放器, dramaId:', dramaId);

        // 获取 URL 参数中的集数（从历史记录跳转过来）
        const episodeFromUrl = searchParams.get('episode');
        const targetEpisode = episodeFromUrl ? parseInt(episodeFromUrl) : 1;
        const targetEpisodeIndex = targetEpisode - 1; // 转换为索引（0-based）

        console.log('目标集数:', targetEpisode, '索引:', targetEpisodeIndex);

        // API 参数从 1 开始（第1集）
        const response = await dramaAPI.parseEpisode(dramaId, targetEpisode);
        console.log('API 响应:', response);

        const { data } = response;
        console.log('解析数据:', data);

        if (data.episode?.parsedUrl) {
          console.log('获取到视频地址:', data.episode.parsedUrl);
          setVideoUrl(data.episode.parsedUrl);

          const totalEps = data.totalEpisodes || 20;
          const episodeList = Array.from({ length: totalEps }, (_, i) => ({
            index: i,
            label: `第${i + 1}集`,
          }));

          setEpisodes(episodeList);
          setCurrentDrama({ id: dramaId, name: data.videoName });
          setCurrentEpisode(targetEpisodeIndex);
          setDramaInfo({
            title: data.videoName,
            description: data.description,
            cover: data.cover,
            totalEpisodes: totalEps,
          });

          // 记录初始观看历史
          addHistory({
            dramaId: dramaId,
            dramaName: data.videoName,
            episode: targetEpisode,
            episodeLabel: `第${targetEpisode}集`,
            cover: data.cover || ''
          });

          // 检查是否有历史记录，恢复播放进度
          const historyRecord = getHistoryByDrama(dramaId);
          if (historyRecord && historyRecord.episode === targetEpisode && historyRecord.currentTime > 0) {
            setInitialTime(historyRecord.currentTime);
            console.log('从历史记录恢复播放进度:', historyRecord.currentTime);
          } else {
            setInitialTime(0);
          }
        } else {
          console.error('API 响应中没有 parsedUrl:', data);
          alert('未能获取视频地址，请稍后重试');
        }
      } catch (error) {
        console.error('初始化播放器失败:', error);
        console.error('错误详情:', error.response?.data || error.message);
        alert(`加载播放器失败: ${error.response?.data?.message || error.message || '未知错误'}`);
      } finally {
        setIsLoading(false);
      }
    };

    initPlayer();
  }, [dramaId, navigate, searchParams]);

  const handleEpisodeClick = (index) => {
    if (index !== currentEpisode) {
      setCurrentEpisode(index);
      loadEpisode(index);
      setShowFinishTip(false); // 切换剧集时隐藏提示

      // 记录观看历史
      if (dramaInfo) {
        addHistory({
          dramaId: dramaId,
          dramaName: dramaInfo.title || currentDrama?.name || '未知剧集',
          episode: index + 1,
          episodeLabel: `第${index + 1}集`,
          cover: dramaInfo.cover || ''
        });
      }

      // 检查是否有该集的历史记录，恢复播放进度
      const historyRecord = getHistoryByDrama(dramaId);
      if (historyRecord && historyRecord.episode === index + 1 && historyRecord.currentTime > 0) {
        setInitialTime(historyRecord.currentTime);
      } else {
        setInitialTime(0);
      }
    }
  };

  // 处理播放进度更新
  const handleProgressUpdate = (currentTime, duration) => {
    if (dramaInfo && currentEpisode !== null) {
      updateHistoryProgress(dramaId, currentEpisode + 1, currentTime, duration);
    }
  };

  const handleVideoEnded = () => {
    if (currentEpisode < episodes.length - 1) {
      // 还有下一集，自动播放
      handleEpisodeClick(currentEpisode + 1);
    } else {
      // 已是最后一集，显示播放完毕提示
      setShowFinishTip(true);
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  const handleShowDownloadModal = () => {
    setShowDownloadModal(true);
    setSelectedEpisodes([]);
  };

  const handleToggleEpisode = (index) => {
    setSelectedEpisodes(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const handleSelectAll = () => {
    if (selectedEpisodes.length === episodes.length) {
      setSelectedEpisodes([]);
    } else {
      setSelectedEpisodes(episodes.map(ep => ep.index));
    }
  };

  const handleStartDownload = async () => {
    if (selectedEpisodes.length === 0) {
      alert('请选择要下载的剧集');
      return;
    }

    for (const episodeIndex of selectedEpisodes) {
      try {
        // 获取视频URL
        const { data } = await dramaAPI.parseEpisode(dramaId, episodeIndex + 1);

        if (data.episode?.parsedUrl) {
          addDownload({
            dramaId: dramaId,
            dramaName: dramaInfo?.title || currentDrama?.name || '未知剧集',
            episode: episodeIndex + 1,
            episodeLabel: `第${episodeIndex + 1}集`,
            videoUrl: data.episode.parsedUrl,
            cover: dramaInfo?.cover || ''
          });
        }
      } catch (error) {
        console.error(`获取第${episodeIndex + 1}集视频地址失败:`, error);
      }
    }

    setShowDownloadModal(false);
    alert(`已添加 ${selectedEpisodes.length} 集到下载列表`);
  };

  return (
    <div className="player-page">
      <div className="container">
        <div className="player-header">
          <button className="back-btn" onClick={handleBack}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M15 10H5M5 10l5 5M5 10l5-5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>返回</span>
          </button>

          <button className="download-btn" onClick={handleShowDownloadModal}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>批量下载</span>
          </button>
        </div>

        <VideoPlayer
          videoUrl={videoUrl}
          onEnded={handleVideoEnded}
          isLoading={isLoading}
          onProgressUpdate={handleProgressUpdate}
          initialTime={initialTime}
        />

        {dramaInfo && (
          <div className="drama-info">
            <img src={dramaInfo.cover} alt={dramaInfo.title} className="drama-cover" />
            <div className="drama-details">
              <h1 className="drama-title">{dramaInfo.title}</h1>
              <p className="drama-desc">{dramaInfo.description || '暂无简介'}</p>
            </div>
          </div>
        )}

        <EpisodeList
          episodes={episodes}
          currentEpisode={currentEpisode}
          onEpisodeClick={handleEpisodeClick}
        />

        {showFinishTip && (
          <div className="finish-tip-overlay" onClick={() => setShowFinishTip(false)}>
            <div className="finish-tip-content" onClick={(e) => e.stopPropagation()}>
              <div className="finish-icon">✓</div>
              <h2>播放完毕</h2>
              <p>全部剧集已播放完成</p>
              <div className="finish-actions">
                <button className="finish-btn" onClick={() => setShowFinishTip(false)}>
                  知道了
                </button>
                <button className="finish-btn primary" onClick={() => handleEpisodeClick(0)}>
                  重新观看
                </button>
              </div>
            </div>
          </div>
        )}

        {showDownloadModal && (
          <div className="download-modal-overlay" onClick={() => setShowDownloadModal(false)}>
            <div className="download-modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="download-modal-header">
                <h2>选择要下载的剧集</h2>
                <button className="close-btn" onClick={() => setShowDownloadModal(false)}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
              </div>

              <div className="download-modal-actions">
                <button className="select-all-btn" onClick={handleSelectAll}>
                  {selectedEpisodes.length === episodes.length ? '取消全选' : '全选'}
                </button>
                <span className="selected-count">已选 {selectedEpisodes.length} / {episodes.length} 集</span>
              </div>

              <div className="episode-select-grid">
                {episodes.map((ep) => (
                  <button
                    key={ep.index}
                    className={`episode-select-item ${selectedEpisodes.includes(ep.index) ? 'selected' : ''}`}
                    onClick={() => handleToggleEpisode(ep.index)}
                  >
                    <span>{ep.label}</span>
                    {selectedEpisodes.includes(ep.index) && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>

              <div className="download-modal-footer">
                <button className="cancel-btn" onClick={() => setShowDownloadModal(false)}>
                  取消
                </button>
                <button className="confirm-btn" onClick={handleStartDownload}>
                  开始下载
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlayerPage;
