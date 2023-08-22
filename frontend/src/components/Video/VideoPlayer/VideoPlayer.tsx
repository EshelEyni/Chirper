import { FC, useRef, useEffect, MouseEvent } from "react";
import ReactPlayer from "react-player";
import storageService from "../../../services/storage.service";
import { useInView } from "react-intersection-observer";
import "./VideoPlayer.scss";
import { VideoCustomControls } from "../VideoCustomControls/VideoCustomControls";
import { useVideoPlayer } from "../../../contexts/VideoPlayerContext";
import { VideoCustomControlsProvider } from "../../../contexts/VideoCustomControlsContext";

type VideoPlayerProps = {
  videoUrl: string;
  isCustomControls?: boolean;
};

export const VideoPlayer: FC<VideoPlayerProps> = ({ videoUrl, isCustomControls = false }) => {
  const videoPlayerRef = useRef<ReactPlayer>(null);
  const playerWrapperRef = useRef<HTMLDivElement>(null);

  const { ref, inView } = useInView({
    threshold: 0.5,
  });

  const {
    isPlaying,
    setIsPlaying,
    isMuted,
    setIsMuted,
    volume,
    setVolume,
    setProgress,
    setPlayedSeconds,
    setDuration,
    isLooping,
    setIsLooping,
    playbackRate,
  } = useVideoPlayer();

  function onHandlePlayerClick(e: MouseEvent) {
    const isVideoCustomControlsClick = (e.target as HTMLElement).closest(
      ".video-custom-controls-main-container"
    );
    if (isVideoCustomControlsClick) return;
    if (!isCustomControls) return;
    if (isMuted) {
      setIsMuted(prev => !prev);
      setVolume(Number(storageService.get("volume")) || 0.5);
      return;
    }
    setIsPlaying(prev => !prev);
  }

  useEffect(() => {
    setIsPlaying(inView);
  }, [inView, setIsPlaying]);

  return (
    <div className="video-player-container" ref={ref}>
      <div className="react-player-wrapper" onClick={onHandlePlayerClick} ref={playerWrapperRef}>
        <ReactPlayer
          className="react-player"
          ref={videoPlayerRef}
          url={videoUrl}
          controls={!isCustomControls}
          onProgress={({ played, playedSeconds }) => {
            setPlayedSeconds(playedSeconds);
            setProgress(played * 100);
          }}
          onDuration={d => {
            setIsLooping(d < 60);
            setDuration(d);
          }}
          loop={isLooping}
          playing={isPlaying}
          volume={volume}
          width="100%"
          height="100%"
          muted={isMuted}
          progressInterval={100}
          playbackRate={playbackRate}
        />
        {isCustomControls && (
          <VideoCustomControlsProvider>
            <VideoCustomControls
              videoPlayerRef={videoPlayerRef}
              playerWrapperRef={playerWrapperRef}
            />
          </VideoCustomControlsProvider>
        )}
      </div>
    </div>
  );
};
