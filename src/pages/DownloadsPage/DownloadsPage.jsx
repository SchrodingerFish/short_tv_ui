import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import './DownloadsPage.css';

const DownloadsPage = () => {
  const navigate = useNavigate();
  const { downloads, removeDownload, clearCompletedDownloads, updateDownloadProgress } = useAppStore();

  // 模拟下载进度
  React.useEffect(() => {
    const interval = setInterval(() => {
      downloads.forEach(download => {
        if (download.status === 'pending') {
          // 开始下载
          updateDownloadProgress(download.id, 0, 'downloading');
        } else if (download.status === 'downloading' && download.progress < 100) {
          // 增加进度
          const newProgress = Math.min(download.progress + Math.random() * 15, 100);
          const newStatus = newProgress >= 100 ? 'completed' : 'downloading';
          updateDownloadProgress(download.id, Math.floor(newProgress), newStatus);
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [downloads]);

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return '等待中';
      case 'downloading': return '下载中';
      case 'completed': return '已完成';
      case 'failed': return '失败';
      default: return '未知';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'downloading': return 'var(--primary)';
      case 'completed': return '#34c759';
      case 'failed': return '#ff3b30';
      default: return 'var(--text-secondary)';
    }
  };

  const handleDownloadFile = (download) => {
    // 使用 a 标签触发下载
    const a = document.createElement('a');
    a.href = download.videoUrl;
    a.download = `${download.dramaName}_${download.episodeLabel}.mp4`;
    a.click();
  };

  // 按剧集分组
  const groupedDownloads = downloads.reduce((acc, download) => {
    if (!acc[download.dramaId]) {
      acc[download.dramaId] = {
        dramaId: download.dramaId,
        dramaName: download.dramaName,
        cover: download.cover,
        episodes: []
      };
    }
    acc[download.dramaId].episodes.push(download);
    return acc;
  }, {});

  const dramaGroups = Object.values(groupedDownloads);

  return (
    <div className="downloads-page">
      <div className="container">
        <div className="downloads-header">
          <h1 className="downloads-title">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path
                d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            下载管理
          </h1>
          <div className="downloads-actions">
            <span className="downloads-count">共 {downloads.length} 个任务</span>
            {downloads.some(d => d.status === 'completed') && (
              <button className="clear-btn" onClick={clearCompletedDownloads}>
                清除已完成
              </button>
            )}
          </div>
        </div>

        {downloads.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <svg width="120" height="120" viewBox="0 0 24 24" fill="none">
                <path
                  d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h2 className="empty-title">暂无下载任务</h2>
            <p className="empty-desc">去播放页面添加下载任务吧</p>
            <button className="empty-btn" onClick={() => navigate('/')}>
              去首页逛逛
            </button>
          </div>
        ) : (
          <div className="downloads-list">
            {dramaGroups.map((group) => (
              <div key={group.dramaId} className="download-group">
                <div className="group-header">
                  <img src={group.cover} alt={group.dramaName} className="group-cover" />
                  <div className="group-info">
                    <h3 className="group-name">{group.dramaName}</h3>
                    <p className="group-count">{group.episodes.length} 集</p>
                  </div>
                </div>
                <div className="group-episodes">
                  {group.episodes.map((download) => (
                    <div key={download.id} className="download-item">
                      <div className="download-info">
                        <span className="episode-label">{download.episodeLabel}</span>
                        <span className="download-status" style={{ color: getStatusColor(download.status) }}>
                          {getStatusText(download.status)}
                        </span>
                      </div>
                      <div className="download-progress-wrapper">
                        <div className="download-progress-bar">
                          <div
                            className="download-progress-fill"
                            style={{ width: `${download.progress}%` }}
                          ></div>
                        </div>
                        <span className="download-progress-text">{download.progress}%</span>
                      </div>
                      <div className="download-actions">
                        {download.status === 'completed' && (
                          <button
                            className="download-file-btn"
                            onClick={() => handleDownloadFile(download)}
                            title="下载到本地"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                              <path
                                d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </button>
                        )}
                        <button
                          className="remove-btn"
                          onClick={() => removeDownload(download.id)}
                          title="删除任务"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path
                              d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DownloadsPage;
