import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import './DownloadsPage.css';

const DownloadsPage: React.FC = () => {
  const navigate = useNavigate();
  const { downloads, removeDownload, clearCompletedDownloads, updateDownloadProgress } = useAppStore();

  useEffect(() => {
    const interval = setInterval(() => {
      downloads.forEach(d => {
        if (d.status === 'pending') {
          updateDownloadProgress(d.id, 0, 'downloading');
        } else if (d.status === 'downloading' && d.progress < 100) {
          const next = Math.min(d.progress + Math.random() * 30, 100);
          updateDownloadProgress(d.id, Math.floor(next), next >= 100 ? 'completed' : 'downloading');
        }
      });
    }, 1500);
    return () => clearInterval(interval);
  }, [downloads, updateDownloadProgress]);

  // 按剧集分组
  const groups = downloads.reduce((acc, d) => {
    const dramaId = d.dramaId;
    if (!acc[dramaId]) {
      acc[dramaId] = {
        name: d.dramaName,
        cover: d.dramaCover,
        items: []
      };
    }
    acc[dramaId].items.push(d);
    return acc;
  }, {} as Record<number, { name: string; cover: string; items: typeof downloads }>);

  const handleDownloadFile = (url: string, name: string) => {
    if (!url) {
        alert('下载链接无效，请尝试重新解析');
        return;
    }
    // 强制触发浏览器下载
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="downloads-page fade-in">
      <div className="container">
        <div className="downloads-header">
          <div className="downloads-title-wrapper">
             <h1 className="downloads-title">下载管理</h1>
             <span className="downloads-count">共 {downloads.length} 个任务</span>
          </div>
          <button className="clear-btn" onClick={clearCompletedDownloads}>清除已完成</button>
        </div>

        {downloads.length === 0 ? (
          <div className="empty-state">
            <h2 className="empty-title">暂无下载内容</h2>
            <p className="empty-desc">赶紧去发现好剧吧</p>
            <button className="empty-btn" onClick={() => navigate('/')}>去首页看看</button>
          </div>
        ) : (
          <div className="downloads-list">
            {Object.entries(groups).map(([dramaId, group]) => (
              <div key={dramaId} className="download-group">
                <div className="group-header">
                  <img src={group.cover} alt={group.name} className="group-cover" />
                  <div className="group-info">
                    <h3 className="group-name">{group.name}</h3>
                    <p className="group-count">已添加 {group.items.length} 个剧集</p>
                  </div>
                </div>
                <div className="group-episodes">
                  {group.items.sort((a,b) => a.episode - b.episode).map((d) => (
                    <div key={d.id} className="download-item">
                      <div className="download-info">
                        <span className="episode-label">第 {d.episode} 集</span>
                        <span className={`download-status status-${d.status}`}>
                          {d.status === 'completed' ? '已完成' : d.status === 'downloading' ? '正在下载' : '等待中'}
                        </span>
                      </div>
                      <div className="download-progress-wrapper">
                        <div className="download-progress-bar">
                          <div className="download-progress-fill" style={{ width: `${d.progress}%` }}></div>
                        </div>
                        <span className="download-progress-text">{Math.floor(d.progress)}%</span>
                      </div>
                      <div className="download-actions">
                         {d.status === 'completed' && (
                           <button 
                             className="download-file-btn" 
                             title="导出文件"
                             onClick={() => handleDownloadFile(d.videoUrl, `${d.dramaName}_第${d.episode}集.mp4`)}
                           >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                           </button>
                         )}
                         <button className="remove-btn" title="删除任务" onClick={() => removeDownload(d.id)}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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
