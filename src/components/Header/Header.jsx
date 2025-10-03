import React from 'react';
import './Header.css';

const Header = ({ onSearch, onRandomClick }) => {
  const [searchValue, setSearchValue] = React.useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchValue.trim()) {
      onSearch(searchValue.trim());
    }
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <div className="logo">
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
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16zM19 19l-4.35-4.35"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </form>

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
