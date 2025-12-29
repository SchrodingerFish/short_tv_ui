import React from 'react';
import { useNavigate } from 'react-router-dom';
import PosterCard from '../../components/PosterCard/PosterCard';
import { useAppStore } from '../../store/useAppStore';
import { Drama } from '../../types';
import './FavoritesPage.css';

const FavoritesPage: React.FC = () => {
  const navigate = useNavigate();
  const { favorites } = useAppStore();

  const handleDramaClick = (dramaId: number) => {
    navigate(`/player/${dramaId}`);
  };

  // 将 FavoriteItem 适配回 Drama 结构传递给 PosterCard
  const adaptToDrama = (fav: any): Drama => ({
    id: fav.id,
    name: fav.name,
    cover: fav.pic,
    score: 8.5
  });

  return (
    <div className="favorites-page fade-in">
      <div className="container">
        <div className="favorites-header">
          <h1 className="favorites-title">
            我的收藏
          </h1>
          <p className="favorites-count">共 {favorites.length} 部短剧</p>
        </div>

        {favorites.length === 0 ? (
          <div className="empty-state">
            <h2 className="empty-title">暂无收藏</h2>
            <p className="empty-desc">快去收藏你喜欢的短剧吧</p>
            <button className="empty-btn" onClick={() => navigate('/')}>去首页逛逛</button>
          </div>
        ) : (
          <div className="poster-grid">
            {favorites.map((fav) => (
              <PosterCard
                key={fav.id}
                drama={adaptToDrama(fav)}
                onClick={() => handleDramaClick(fav.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FavoritesPage;
