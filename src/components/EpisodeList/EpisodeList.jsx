import React from 'react';
import './EpisodeList.css';

const EpisodeList = ({ episodes, currentEpisode, onEpisodeClick, cachedEpisodes }) => {
  return (
    <div className="episode-list">
      <h3 className="episode-title">选集</h3>
      <div className="episode-grid">
        {episodes.map((ep, index) => (
          <button
            key={index}
            className={`episode-btn ${currentEpisode === index ? 'active' : ''} ${
              cachedEpisodes?.has(index) ? 'cached' : ''
            }`}
            onClick={() => onEpisodeClick(index)}
          >
            {ep.label || `第${index + 1}集`}
          </button>
        ))}
      </div>
    </div>
  );
};

export default EpisodeList;
