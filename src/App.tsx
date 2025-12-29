import React, { ReactNode } from 'react';
import { BrowserRouter, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import CategoryMenu from './components/CategoryMenu/CategoryMenu';
import Header from './components/Header/Header';
import DownloadsPage from './pages/DownloadsPage/DownloadsPage';
import FavoritesPage from './pages/FavoritesPage/FavoritesPage';
import HistoryPage from './pages/HistoryPage/HistoryPage';
import HomePage from './pages/HomePage/HomePage';
import PlayerPage from './pages/PlayerPage/PlayerPage';
import { dramaAPI } from './services/api';
import { useAppStore } from './store/useAppStore';
import './styles/global.css';

const Layout: React.FC<{ children: ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    categories,
    currentCategory,
    setCategories,
    setCurrentCategory,
    setSearchQuery,
    setDramaList,
    setPage,
    setLoading,
  } = useAppStore();

  const isHomePage = location.pathname === '/';

  React.useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await dramaAPI.getCategories();
        const list = Array.isArray(data?.categories) ? data.categories : [];
        setCategories(list);
        if (list.length > 0) {
          // 默认分类设置为第一个或特定 ID (字符串 "1")
          const defaultCat = list.find(c => c.type_id === "1") || list[0];
          setCurrentCategory(defaultCat.type_id);
        }
      } catch (error) {
        console.error('获取分类失败:', error);
      }
    };

    fetchCategories();
  }, [setCategories, setCurrentCategory]);

  const handleSearch = async (query: string) => {
    try {
      setLoading(true);
      setSearchQuery(query);
      const { data } = await dramaAPI.searchDrama(query, 1);
      const list = Array.isArray(data?.list) ? data.list : [];
      setDramaList(list);
      if (data.currentPage !== undefined && data.totalPages !== undefined) {
        setPage(data.currentPage, data.totalPages);
      }
      navigate('/');
    } catch (error) {
      console.error('搜索失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRandomClick = async () => {
    try {
      setLoading(true);
      const { data } = await dramaAPI.getRandomDrama();
      const dramaId = data.items?.[0]?.vod_id;

      if (dramaId) {
        navigate(`/player/${dramaId}`);
      } else {
        console.error('未找到有效的剧集ID');
      }
    } catch (error) {
      console.error('获取随机推荐失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (categoryId: string) => {
    setCurrentCategory(categoryId);
    setSearchQuery('');
  };

  return (
    <div className="app-container">
      <Header onSearch={handleSearch} onRandomClick={handleRandomClick} />
      {isHomePage && (
        <CategoryMenu
          categories={categories}
          activeCategory={currentCategory}
          onCategoryChange={handleCategoryChange}
        />
      )}
      <main className="main-content">
        {children}
      </main>
      <footer className="footer">
        <p>
          <a
            href="https://github.com/SchrodingerFish/short_tv_ui"
            target="_blank"
            rel="noopener noreferrer"
          >
              © 2025 福利短剧. All rights reserved.
          </a>
        </p>
      </footer>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/downloads" element={<DownloadsPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/player/:dramaId" element={<PlayerPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
};

export default App;
