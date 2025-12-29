import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PosterCard from '../../components/PosterCard/PosterCard';
import { dramaAPI } from '../../services/api';
import { useAppStore } from '../../store/useAppStore';
import './HomePage.css';

const HomePage: React.FC = () => {
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

  const loadDramaList = async (categoryId?: string, page: number = 1) => {
    try {
      setLoading(true);
      const { data } = await dramaAPI.getDramaList(categoryId, page);
      const list = Array.isArray(data?.list) ? data.list : [];
      setDramaList(list);
      if (data.currentPage !== undefined && data.totalPages !== undefined) {
        setPage(data.currentPage, data.totalPages);
      }
    } catch (error) {
      console.error('加载剧集失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    if (searchQuery) {
      handleSearch(searchQuery, page);
    } else {
      loadDramaList(currentCategory || undefined, page);
    }
  };

  const handleSearch = async (query: string, page: number = 1) => {
    try {
      setLoading(true);
      const { data } = await dramaAPI.searchDrama(query, page);
      const list = Array.isArray(data?.list) ? data.list : [];
      setDramaList(list);
      if (data.currentPage !== undefined && data.totalPages !== undefined) {
        setPage(data.currentPage, data.totalPages);
      }
    } catch (error) {
      console.error('搜索失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDramaClick = (dramaId: number) => {
    navigate(`/player/${dramaId}`);
  };

  useEffect(() => {
    if (!searchQuery) {
      loadDramaList(currentCategory || undefined, 1);
    }
  }, [currentCategory, searchQuery]);

  return (
    <div className="home-page">
      <div className="container">
        {isLoading ? (
          <div className="poster-grid">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="poster-skeleton"></div>
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
            
            {dramaList.length === 0 && !isLoading && (
              <div className="empty-state">
                <p>暂无内容</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default HomePage;
