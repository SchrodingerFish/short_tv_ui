import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import './HistoryPage.css';

const HistoryPage = () => {
  const navigate = useNavigate();
  const { history, removeHistory, clearHistory } = useAppStore();

  const handleDramaClick = (dramaId, episode) => {
    // 传递集数参数到播放页面
    navigate(`/player/${dramaId}?episode=${episode}`);
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;

    // 小于1分钟
    if (diff < 60000) {
      return '刚刚';
    }
    // 小于1小时
    if (diff < 3600000) {
      return `${Math.floor(diff / 60000)}分钟前`;
    }
    // 小于24小时
    if (diff < 86400000) {
      return `${Math.floor(diff / 3600000)}小时前`;
    }
    // 小于7天
    if (diff < 604800000) {
      return `${Math.floor(diff / 86400000)}天前`;
    }

    // 超过7天显示具体日期
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const formatDuration = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);

    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const getProgress = (currentTime, duration) => {
    if (!duration || duration === 0) return 0;
    return Math.floor((currentTime / duration) * 100);
  };

  const handleClearHistory = () => {
    if (window.confirm('确定要清空所有观看历史吗？')) {
      clearHistory();
    }
  };

  return (
    <div className="history-page">
      <div className="container">
        <div className="history-header">
          <h1 className="history-title">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            观看历史
          </h1>
          <div className="history-actions">
            <span className="history-count">共 {history.length} 条记录</span>
            {history.length > 0 && (
              <button className="clear-btn" onClick={handleClearHistory}>
                清空历史
              </button>
            )}
          </div>
        </div>

        {history.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <svg width="120" height="120" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h2 className="empty-title">暂无观看历史</h2>
            <p className="empty-desc">快去观看你喜欢的短剧吧</p>
            <button className="empty-btn" onClick={() => navigate('/')}>
              去首页逛逛
            </button>
          </div>
        ) : (
          <div className="history-list">
            {history.map((item) => (
              <div key={item.id} className="history-item">
                <img
                  src={item.cover}
                  alt={item.dramaName}
                  className="history-cover"
                  onClick={() => handleDramaClick(item.dramaId, item.episode)}
                />
                <div className="history-info" onClick={() => handleDramaClick(item.dramaId, item.episode)}>
                  <h3 className="history-name">{item.dramaName}</h3>
                  <p className="history-episode">观看到：{item.episodeLabel}</p>
                  {item.duration > 0 && (
                    <div className="history-progress-wrapper">
                      <div className="history-progress-bar">
                        <div
                          className="history-progress-fill"
                          style={{ width: `${getProgress(item.currentTime, item.duration)}%` }}
                        ></div>
                      </div>
                      <span className="history-progress-text">
                        {formatDuration(item.currentTime)} / {formatDuration(item.duration)}
                      </span>
                    </div>
                  )}
                  <p className="history-time">{formatTime(item.watchedAt)}</p>
                </div>
                <button
                  className="continue-btn"
                  onClick={() => handleDramaClick(item.dramaId, item.episode)}
                >
                  继续观看
                </button>
                <button
                  className="remove-btn"
                  onClick={() => removeHistory(item.id)}
                  title="删除记录"
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;
