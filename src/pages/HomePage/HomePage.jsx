import React from 'react';
import { useNavigate } from 'react-router-dom';
import PosterCard from '../../components/PosterCard/PosterCard';
import { useAppStore } from '../../store/useAppStore';
import { dramaAPI } from '../../services/api';
import './HomePage.css';

const HomePage = () => {
  const navigate = useNavigate();
  const {
    dramaList,
    currentPage,
    totalPages,
    isLoading,
    currentCategory,
    searchQuery,
    setDramaList,
    setPage,
    setLoading,
  } = useAppStore();

  const loadDramaList = async (categoryId, page = 1) => {
    try {
      setLoading(true);
      const { data } = await dramaAPI.getDramaList(categoryId, page);
      setDramaList(data.list || []);
      setPage(data.currentPage, data.totalPages);
    } catch (error) {
      console.error('加载剧集失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    if (searchQuery) {
      handleSearch(searchQuery, page);
    } else if (currentCategory) {
      loadDramaList(currentCategory, page);
    }
  };

  const handleSearch = async (query, page = 1) => {
    try {
      setLoading(true);
      const { data } = await dramaAPI.searchDrama(query, page);
      setDramaList(data.list || []);
      setPage(data.currentPage, data.totalPages);
    } catch (error) {
      console.error('搜索失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDramaClick = (dramaId) => {
    navigate(`/player/${dramaId}`);
  };

  React.useEffect(() => {
    if (currentCategory && !searchQuery) {
      loadDramaList(currentCategory, currentPage);
    }
  }, [currentCategory]);

  return (
    <div className="home-page">
      <div className="container">
        {isLoading ? (
          <div className="poster-grid">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="poster-skeleton skeleton"></div>
            ))}
          </div>
        ) : (
          <>
            <div className="poster-grid">
              {dramaList.map((drama) => (
                <PosterCard
                  key={drama.id}
                  drama={drama}
                  onClick={() => handleDramaClick(drama.id)}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="pagination">
                <button
                  className="page-btn"
                  disabled={currentPage <= 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                >
                  上一页
                </button>
                <span className="page-info">
                  第 {currentPage} / {totalPages} 页
                </span>
                <button
                  className="page-btn"
                  disabled={currentPage >= totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  下一页
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default HomePage;
