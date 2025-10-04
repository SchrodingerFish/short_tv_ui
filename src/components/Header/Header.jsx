import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import './Header.css';

const Header = ({ onSearch, onRandomClick }) => {
  const [searchValue, setSearchValue] = React.useState('');
  const navigate = useNavigate();
  const { favorites, downloads, history } = useAppStore();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchValue.trim()) {
      onSearch(searchValue.trim());
    }
  };

  const handleLogoClick = () => {
    navigate('/');
  };

  const handleFavoritesClick = () => {
    navigate('/favorites');
  };

  const handleDownloadsClick = () => {
    navigate('/downloads');
  };

  const handleHistoryClick = () => {
    navigate('/history');
  };

  // 计算正在下载的任务数
  const downloadingCount = downloads.filter(d => d.status === 'downloading' || d.status === 'pending').length;

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <div className="logo" onClick={handleLogoClick}>
            <span className="logo-icon">▶</span>
            <span className="logo-text">福利短剧</span>
          </div>

          <form className="search-box" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="搜索短剧..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="search-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </form>

          <button className="favorites-link" onClick={handleFavoritesClick}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
            <span>收藏</span>
            {favorites.length > 0 && (
              <span className="favorites-badge">{favorites.length}</span>
            )}
          </button>

          <button className="downloads-link" onClick={handleDownloadsClick}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>下载</span>
            {downloadingCount > 0 && (
              <span className="downloads-badge downloading">{downloadingCount}</span>
            )}
          </button>

          <button className="history-link" onClick={handleHistoryClick}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>历史</span>
          </button>

          <button className="random-btn" onClick={onRandomClick}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M2 4h2.5L7 1m6 0l2.5 3H18M2 16h2.5L7 19m6 0l2.5-3H18M2 10h16"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>随机推荐</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
