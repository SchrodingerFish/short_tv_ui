import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Drama } from '../../types';
import './PosterCard.css';

interface PosterCardProps {
  drama: Drama;
  onClick: () => void;
}

const PosterCard: React.FC<PosterCardProps> = ({ drama, onClick }) => {
  const { isFavorite, toggleFavorite } = useAppStore();
  const favorited = isFavorite(drama.id);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(drama);
  };

  return (
    <div className="poster-card fade-in" onClick={onClick}>
      <div className="poster-image-wrapper">
        <img
          src={drama.cover}
          alt={drama.name}
          className="poster-image"
          loading="lazy"
        />
        <button
          className={`favorite-btn ${favorited ? 'favorited' : ''}`}
          onClick={handleFavoriteClick}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill={favorited ? 'currentColor' : 'none'}>
            <path
              d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
              stroke={favorited ? 'none' : 'currentColor'}
              strokeWidth="2"
            />
          </svg>
        </button>
        <div className="poster-overlay">
          <div className="play-icon">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="24" r="24" fill="rgba(0, 204, 116, 0.9)" />
              <path d="M20 16l12 8-12 8V16z" fill="#000" />
            </svg>
          </div>
        </div>
      </div>

      <div className="poster-info">
        <h3 className="poster-title">{drama.name}</h3>
        <div className="poster-meta">
          <span className="poster-score">⭐ {drama.score || '8.0'}</span>
        </div>
      </div>
    </div>
  );
};

export default PosterCard;
