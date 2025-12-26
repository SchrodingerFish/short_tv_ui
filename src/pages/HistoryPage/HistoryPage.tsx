import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import './HistoryPage.css';

const HistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { history, removeHistory, clearHistory } = useAppStore();

  const formatTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    if (diff < 60000) return '刚刚';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`;
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <div className="history-page fade-in">
      <div className="container">
        <div className="history-header">
          <h1 className="history-title">观看历史</h1>
          <div className="history-actions">
            <span className="history-count">共 {history.length} 条记录</span>
            {history.length > 0 && (
              <button className="clear-btn" onClick={() => window.confirm('清空历史？') && clearHistory()}>
                清空历史
              </button>
            )}
          </div>
        </div>

        {history.length === 0 ? (
          <div className="empty-state">
            <h2 className="empty-title">暂无历史</h2>
            <button className="empty-btn" onClick={() => navigate('/')}>去首页</button>
          </div>
        ) : (
          <div className="history-list">
            {history.map((item) => (
              <div key={item.id} className="history-item">
                <img 
                  src={item.pic} 
                  alt={item.name} 
                  className="history-cover" 
                  onClick={() => navigate(`/player/${item.id}`)} 
                />
                <div className="history-info">
                  <h3 
                    className="history-name" 
                    onClick={() => navigate(`/player/${item.id}`)}
                  >
                    {item.name}
                  </h3>
                  <p className="history-episode">上次观看到：第 {item.episode + 1} 集</p>
                  <p className="history-time">{formatTime(item.time)}</p>
                </div>
                <div className="history-actions">
                  <button 
                    className="continue-btn" 
                    onClick={() => navigate(`/player/${item.id}`)}
                  >
                    继续观看
                  </button>
                  <button 
                    className="remove-btn" 
                    onClick={() => removeHistory(item.id)}
                  >
                    删除
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;
