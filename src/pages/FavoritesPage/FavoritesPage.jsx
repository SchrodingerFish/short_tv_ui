import React from 'react';
import { useNavigate } from 'react-router-dom';
import PosterCard from '../../components/PosterCard/PosterCard';
import { useAppStore } from '../../store/useAppStore';
import './FavoritesPage.css';

const FavoritesPage = () => {
  const navigate = useNavigate();
  const { favorites } = useAppStore();

  const handleDramaClick = (dramaId) => {
    navigate(`/player/${dramaId}`);
  };

  return (
    <div className="favorites-page">
      <div className="container">
        <div className="favorites-header">
          <h1 className="favorites-title">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
            我的收藏
          </h1>
          <p className="favorites-count">共 {favorites.length} 部短剧</p>
        </div>

        {favorites.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <svg width="120" height="120" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
            </div>
            <h2 className="empty-title">暂无收藏</h2>
            <p className="empty-desc">快去收藏你喜欢的短剧吧</p>
            <button className="empty-btn" onClick={() => navigate('/')}>
              去首页逛逛
            </button>
          </div>
        ) : (
          <div className="poster-grid">
            {favorites.map((drama) => (
              <PosterCard
                key={drama.id}
                drama={drama}
                onClick={() => handleDramaClick(drama.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FavoritesPage;
