import Artplayer from 'artplayer';
import Hls from 'hls.js';
import React, { useEffect, useRef } from 'react';
import './VideoPlayer.css';

interface VideoPlayerProps {
  videoUrl: string;
  onEnded: () => void;
  onLoadedData?: () => void;
  onError?: (e: any) => void;
  isLoading: boolean;
  onProgressUpdate?: (currentTime: number, duration: number) => void;
  initialTime?: number;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoUrl,
  onEnded,
  onLoadedData,
  onError,
  isLoading,
  onProgressUpdate,
  initialTime
}) => {
  const artRef = useRef<HTMLDivElement>(null);
  const playerInstance = useRef<Artplayer | null>(null);

  useEffect(() => {
    if (!artRef.current || !videoUrl) return;

    // 清理之前的实例
    if (playerInstance.current) {
      playerInstance.current.destroy();
    }

    const player = new Artplayer({
      container: artRef.current,
      url: videoUrl,
      autoplay: true,
      isLive: false,
      muted: false,
      volume: 0.7,
      playbackRate: true,
      aspectRatio: true,
      setting: true,
      pip: true,
      fullscreen: true,
      fullscreenWeb: true,
      miniProgressBar: true,
      lock: true,
      fastForward: true,
      autoOrientation: true,
      autoSize: false,
      moreVideoAttr: {
        crossOrigin: 'anonymous',
        playsInline: true,
      },

      customType: {
        m3u8: function (video: HTMLVideoElement, url: string) {
          if (Hls.isSupported()) {
            const hls = new Hls();
            hls.loadSource(url);
            hls.attachMedia(video);
          } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = url;
          }
        },
      },
    });

    playerInstance.current = player;

    // 处理准备就绪
    player.on('ready', () => {
      if (initialTime && initialTime > 5) {
        player.currentTime = initialTime;
        // 使用 ArtPlayer 的 toast 或者我们的自定义提示
        const tip = document.createElement('div');
        tip.className = 'custom-resume-tip';
        tip.innerText = `已为您恢复播放至 ${formatTime(initialTime)}`;
        artRef.current?.appendChild(tip);
        setTimeout(() => tip.remove(), 3000);
      }
      if (onLoadedData) onLoadedData();
    });

    // 处理进度更新
    player.on('video:timeupdate', () => {
      if (onProgressUpdate) {
        onProgressUpdate(player.currentTime, player.duration);
      }
    });

    // 处理播放结束
    player.on('video:ended', () => {
      if (onEnded) onEnded();
    });

    // 处理错误
    player.on('error', (err) => {
      console.error('ArtPlayer Error:', err);
      if (onError) onError(err);
    });

    return () => {
      if (playerInstance.current) {
        playerInstance.current.destroy();
        playerInstance.current = null;
      }
    };
  }, [videoUrl, initialTime]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="video-player-wrapper">
      <div ref={artRef} className="artplayer-app"></div>
      {isLoading && (
        <div className="player-overlay">
          <div className="spinner"></div>
          <p>资源准备中...</p>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
