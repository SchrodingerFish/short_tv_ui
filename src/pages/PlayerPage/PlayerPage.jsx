import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import VideoPlayer from '../../components/VideoPlayer/VideoPlayer';
import EpisodeList from '../../components/EpisodeList/EpisodeList';
import { useAppStore } from '../../store/useAppStore';
import { dramaAPI } from '../../services/api';
import './PlayerPage.css';

const PlayerPage = () => {
  const { dramaId } = useParams();
  const navigate = useNavigate();
  const {
    currentDrama,
    currentEpisode,
    episodes,
    setCurrentDrama,
    setCurrentEpisode,
    setEpisodes,
  } = useAppStore();

  const [videoUrl, setVideoUrl] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [dramaInfo, setDramaInfo] = React.useState(null);

  const loadEpisode = async (episodeIndex) => {
    try {
      setIsLoading(true);
      setVideoUrl(''); // 先清空URL避免显示旧视频

      const { data } = await dramaAPI.parseEpisode(dramaId, episodeIndex);

      if (data.episode?.parsedUrl) {
        setVideoUrl(data.episode.parsedUrl);
        setDramaInfo({
          title: data.videoName,
          description: data.description,
          cover: data.cover,
          totalEpisodes: data.totalEpisodes || 20,
        });
      } else {
        throw new Error('未获取到视频地址');
      }
    } catch (error) {
      console.error('加载剧集失败:', error);
      alert('加载失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    if (!dramaId) {
      navigate('/');
      return;
    }

    const initPlayer = async () => {
      try {
        setIsLoading(true);
        console.log('正在初始化播放器, dramaId:', dramaId);

        const response = await dramaAPI.parseEpisode(dramaId, 0);
        console.log('API 响应:', response);

        const { data } = response;
        console.log('解析数据:', data);

        if (data.episode?.parsedUrl) {
          console.log('获取到视频地址:', data.episode.parsedUrl);
          setVideoUrl(data.episode.parsedUrl);

          const totalEps = data.totalEpisodes || 20;
          const episodeList = Array.from({ length: totalEps }, (_, i) => ({
            index: i,
            label: `第${i + 1}集`,
          }));

          setEpisodes(episodeList);
          setCurrentDrama({ id: dramaId, name: data.videoName });
          setCurrentEpisode(0);
          setDramaInfo({
            title: data.videoName,
            description: data.description,
            cover: data.cover,
            totalEpisodes: totalEps,
          });
        } else {
          console.error('API 响应中没有 parsedUrl:', data);
          alert('未能获取视频地址，请稍后重试');
        }
      } catch (error) {
        console.error('初始化播放器失败:', error);
        console.error('错误详情:', error.response?.data || error.message);
        alert(`加载播放器失败: ${error.response?.data?.message || error.message || '未知错误'}`);
      } finally {
        setIsLoading(false);
      }
    };

    initPlayer();
  }, [dramaId, navigate]);

  const handleEpisodeClick = (index) => {
    if (index !== currentEpisode) {
      setCurrentEpisode(index);
      loadEpisode(index);
    }
  };

  const handleVideoEnded = () => {
    if (currentEpisode < episodes.length - 1) {
      handleEpisodeClick(currentEpisode + 1);
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  return (
    <div className="player-page">
      <div className="container">
        <button className="back-btn" onClick={handleBack}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M15 10H5M5 10l5 5M5 10l5-5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span>返回</span>
        </button>

        <VideoPlayer
          videoUrl={videoUrl}
          onEnded={handleVideoEnded}
          isLoading={isLoading}
        />

        {dramaInfo && (
          <div className="drama-info">
            <img src={dramaInfo.cover} alt={dramaInfo.title} className="drama-cover" />
            <div className="drama-details">
              <h1 className="drama-title">{dramaInfo.title}</h1>
              <p className="drama-desc">{dramaInfo.description || '暂无简介'}</p>
            </div>
          </div>
        )}

        <EpisodeList
          episodes={episodes}
          currentEpisode={currentEpisode}
          onEpisodeClick={handleEpisodeClick}
        />
      </div>
    </div>
  );
};

export default PlayerPage;
