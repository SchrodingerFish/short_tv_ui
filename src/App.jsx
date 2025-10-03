import React from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Header from './components/Header/Header';
import CategoryMenu from './components/CategoryMenu/CategoryMenu';
import HomePage from './pages/HomePage/HomePage';
import PlayerPage from './pages/PlayerPage/PlayerPage';
import { useAppStore } from './store/useAppStore';
import { dramaAPI } from './services/api';
import './styles/global.css';

const Layout = ({ children }) => {
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
        setCategories(data.categories || []);
        if (data.categories?.length > 0) {
          setCurrentCategory(data.categories[0].type_id);
        }
      } catch (error) {
        console.error('获取分类失败:', error);
      }
    };

    fetchCategories();
  }, []);

  const handleSearch = async (query) => {
    try {
      setLoading(true);
      setSearchQuery(query);
      const { data } = await dramaAPI.searchDrama(query, 1);
      setDramaList(data.list || []);
      setPage(data.currentPage, data.totalPages);
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
      if (data.items?.length > 0) {
        const drama = data.items[0];
        navigate(`/player/${drama.vod_id}`);
      }
    } catch (error) {
      console.error('获取随机推荐失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (categoryId) => {
    setCurrentCategory(categoryId);
    setSearchQuery('');
  };

  return (
    <div>
      <Header onSearch={handleSearch} onRandomClick={handleRandomClick} />
      {isHomePage && (
        <CategoryMenu
          categories={categories}
          activeCategory={currentCategory}
          onCategoryChange={handleCategoryChange}
        />
      )}
      {children}
      <footer style={{
        textAlign: 'center',
        padding: '32px 0',
        borderTop: '1px solid var(--border)',
        color: 'var(--text-secondary)',
        fontSize: '14px'
      }}>
        <p>© 2025 福利短剧. All rights reserved.</p>
      </footer>
    </div>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/player/:dramaId" element={<PlayerPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
};

export default App;
