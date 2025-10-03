import React from 'react';
import './VideoPlayer.css';

const VideoPlayer = ({
  videoUrl,
  onEnded,
  onLoadedData,
  onError,
  isLoading
}) => {
  const videoRef = React.useRef(null);
  const [isLongPress, setIsLongPress] = React.useState(false);
  const [showSpeedIndicator, setShowSpeedIndicator] = React.useState(false);
  const [videoError, setVideoError] = React.useState(null);
  const pressTimer = React.useRef(null);

  const normalSpeed = 1.0;
  const fastSpeed = 3.0;

  React.useEffect(() => {
    if (videoUrl && videoRef.current) {
      setVideoError(null);
      videoRef.current.src = videoUrl;
      videoRef.current.load();

      // 尝试自动播放
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log('视频自动播放成功');
          })
          .catch(error => {
            console.log('自动播放失败，需要用户交互:', error);
          });
      }
    }
  }, [videoUrl]);

  const handleTouchStart = () => {
    pressTimer.current = setTimeout(() => {
      if (videoRef.current && !videoRef.current.paused) {
        videoRef.current.playbackRate = fastSpeed;
        setIsLongPress(true);
        setShowSpeedIndicator(true);
      }
    }, 50);
  };

  const handleTouchEnd = () => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
    }
    if (isLongPress && videoRef.current) {
      videoRef.current.playbackRate = normalSpeed;
      setIsLongPress(false);
      setShowSpeedIndicator(false);
    }
  };

  const handleVideoError = (e) => {
    console.error('视频加载错误:', e);
    setVideoError('视频加载失败，请重试');
    if (onError) onError(e);
  };

  const handleLoadedData = (e) => {
    console.log('视频加载成功');
    if (onLoadedData) onLoadedData(e);
  };

  return (
    <div className="video-player-container">
      <video
        ref={videoRef}
        className="video-player"
        controls
        playsInline
        webkit-playsinline="true"
        preload="auto"
        onEnded={onEnded}
        onLoadedData={handleLoadedData}
        onError={handleVideoError}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleTouchStart}
        onMouseUp={handleTouchEnd}
        onMouseLeave={handleTouchEnd}
      />

      {showSpeedIndicator && (
        <div className="speed-indicator">{fastSpeed}x</div>
      )}

      {isLoading && (
        <div className="video-loading">
          <div className="spinner"></div>
          <p>加载中...</p>
        </div>
      )}

      {videoError && (
        <div className="video-error">
          <p>{videoError}</p>
          <button onClick={() => {
            setVideoError(null);
            if (videoUrl && videoRef.current) {
              videoRef.current.load();
            }
          }}>重试</button>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
