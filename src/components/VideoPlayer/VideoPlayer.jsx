import React from 'react';
import './VideoPlayer.css';

const VideoPlayer = ({
  videoUrl,
  onEnded,
  onLoadedData,
  onError,
  isLoading,
  onProgressUpdate,
  initialTime
}) => {
  const videoRef = React.useRef(null);
  const [isLongPress, setIsLongPress] = React.useState(false);
  const [showSpeedIndicator, setShowSpeedIndicator] = React.useState(false);
  const [videoError, setVideoError] = React.useState(null);
  const [retryCount, setRetryCount] = React.useState(0);
  const pressTimer = React.useRef(null);
  const retryTimer = React.useRef(null);
  const progressTimer = React.useRef(null);

  const normalSpeed = 1.0;
  const fastSpeed = 3.0;
  const MAX_RETRY = 3;

  React.useEffect(() => {
    if (videoUrl && videoRef.current) {
      setVideoError(null);
      setRetryCount(0); // 重置重试计数
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

    // 清理定时器
    return () => {
      if (retryTimer.current) {
        clearTimeout(retryTimer.current);
      }
      if (progressTimer.current) {
        clearInterval(progressTimer.current);
      }
    };
  }, [videoUrl]);

  // 恢复播放进度
  React.useEffect(() => {
    if (initialTime && videoRef.current && videoRef.current.readyState >= 2) {
      videoRef.current.currentTime = initialTime;
      console.log('恢复播放进度:', initialTime);
    }
  }, [initialTime, videoUrl]);

  // 定期更新播放进度
  React.useEffect(() => {
    if (onProgressUpdate && videoRef.current) {
      progressTimer.current = setInterval(() => {
        if (videoRef.current && !videoRef.current.paused) {
          const currentTime = videoRef.current.currentTime;
          const duration = videoRef.current.duration;
          if (currentTime > 0 && duration > 0) {
            onProgressUpdate(currentTime, duration);
          }
        }
      }, 5000); // 每5秒更新一次进度

      return () => {
        if (progressTimer.current) {
          clearInterval(progressTimer.current);
        }
      };
    }
  }, [onProgressUpdate, videoUrl]);

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

    // 如果还没达到最大重试次数，自动重试
    if (retryCount < MAX_RETRY) {
      const nextRetry = retryCount + 1;
      setRetryCount(nextRetry);
      console.log(`视频加载失败，${2}秒后自动重试 (${nextRetry}/${MAX_RETRY})...`);

      setVideoError(`加载失败，正在重试 (${nextRetry}/${MAX_RETRY})...`);

      // 2秒后重试
      retryTimer.current = setTimeout(() => {
        if (videoRef.current && videoUrl) {
          setVideoError(null);
          videoRef.current.load();
          videoRef.current.play().catch(err => {
            console.log('重试播放失败:', err);
          });
        }
      }, 2000);
    } else {
      // 达到最大重试次数，显示错误
      setVideoError('视频加载失败，请点击重试或切换其他剧集');
      if (onError) onError(e);
    }
  };

  const handleManualRetry = () => {
    setVideoError(null);
    setRetryCount(0);
    if (videoUrl && videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch(err => {
        console.log('手动重试播放失败:', err);
      });
    }
  };

  const handleLoadedData = (e) => {
    console.log('视频加载成功');

    // 恢复播放进度
    if (initialTime && videoRef.current) {
      videoRef.current.currentTime = initialTime;
      console.log('从历史记录恢复播放进度:', initialTime);
    }

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
          <button onClick={handleManualRetry}>重试</button>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
