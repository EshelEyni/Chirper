import { FC, useState, useRef, useEffect } from "react";
import ReactPlayer from "react-player";
import { storageService } from "../../../services/storage.service";
import { useInView } from "react-intersection-observer";
import "./VideoPlayer.scss";
import { VideoCustomControls } from "../VideoCustomControls/VideoCustomControls";

type VideoPlayerProps = {
  videoUrl: string;
  isCustomControls?: boolean;
};

export const VideoPlayer: FC<VideoPlayerProps> = ({ videoUrl, isCustomControls = false }) => {
  const videoPlayerRef = useRef<ReactPlayer>(null);
  const playerWrapperRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [volume, setVolume] = useState(0);
  const [progress, setProgress] = useState(0);
  const [playedSeconds, setPlayedSeconds] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLooping, setIsLooping] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);
  const { ref, inView } = useInView({
    threshold: 0.5,
  });

  useEffect(() => {
    setIsPlaying(inView);
  }, [inView]);

  const onHandlePlayerClick = () => {
    if (isCustomControls) {
      if (isMuted) {
        setIsMuted(!isMuted);
        setVolume(Number(storageService.get("volume")) || 0.5);
        return;
      }
      setIsPlaying(!isPlaying);
    }
  };
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
          <VideoCustomControls
            isPlaying={isPlaying}
            setIsPlaying={setIsPlaying}
            isMuted={isMuted}
            setIsMuted={setIsMuted}
            volume={volume}
            setVolume={setVolume}
            progress={progress}
            setProgress={setProgress}
            playedSeconds={playedSeconds}
            duration={duration}
            playbackRate={playbackRate}
            setPlaybackRate={setPlaybackRate}
            videoPlayerRef={videoPlayerRef}
            playerWrapperRef={playerWrapperRef}
          />
        )}
      </div>
    </div>
  );
};
