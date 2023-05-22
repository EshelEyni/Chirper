import { FC, useState, useRef } from "react";
import ReactPlayer from "react-player";
import { VideoCustomControls } from "./video-custom-controls";
import { storageService } from "../../services/storage.service";

type VideoPlayerProps = {
  videoUrl: string;
  isCustomControls?: boolean;
};

export const VideoPlayer: FC<VideoPlayerProps> = ({ videoUrl, isCustomControls = false }) => {
  const videoPlayerRef = useRef<ReactPlayer>(null);
  const playerWrapperRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [volume, setVolume] = useState(storageService.get("volume") || 0);
  const [progress, setProgress] = useState(0);
  const [playedSeconds, setPlayedSeconds] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLooping, setIsLooping] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);

  return (
    <div
      className="react-player-container"
      onClick={() => {
        if (isCustomControls) setIsPlaying(!isPlaying);
      }}
      ref={playerWrapperRef}
    >
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
  );
};
