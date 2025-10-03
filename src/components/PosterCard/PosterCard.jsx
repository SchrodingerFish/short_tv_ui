import React from 'react';
import './PosterCard.css';

const PosterCard = ({ drama, onClick }) => {
  return (
    <div className="poster-card" onClick={onClick}>
      <div className="poster-image-wrapper">
        <img
          src={drama.cover}
          alt={drama.name}
          className="poster-image"
          loading="lazy"
        />
        <div className="poster-overlay">
          <div className="play-icon">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="24" r="24" fill="rgba(0, 204, 116, 0.9)" />
              <path
                d="M20 16l12 8-12 8V16z"
                fill="#000"
              />
            </svg>
          </div>
        </div>
      </div>

      <div className="poster-info">
        <h3 className="poster-title">{drama.name}</h3>
        <div className="poster-meta">
          <span className="poster-score">⭐ {drama.score}</span>
          <span className="poster-time">{drama.update_time}</span>
        </div>
      </div>
    </div>
  );
};

export default PosterCard;
