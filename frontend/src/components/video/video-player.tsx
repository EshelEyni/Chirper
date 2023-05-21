import { FC, useState, useRef } from "react";
import ReactPlayer from "react-player";
import { VideoCustomControls } from "./video-custom-controls";

type VideoPlayerProps = {
  videoUrl: string;
  isCustomControls?: boolean;
};

export const VideoPlayer: FC<VideoPlayerProps> = ({ videoUrl, isCustomControls = false }) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [playedSeconds, setPlayedSeconds] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLooping, setIsLooping] = useState(true);
  const videoPlayerRef = useRef<ReactPlayer>(null);

  return (
    <div className="react-player-container">
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
        width="100%"
        height="100%"
        muted={isMuted}
      />
      {isCustomControls && (
        <VideoCustomControls
          isPlaying={isPlaying}
          setIsPlaying={setIsPlaying}
          isMuted={isMuted}
          setIsMuted={setIsMuted}
          progress={progress}
          setProgress={setProgress}
          playedSeconds={playedSeconds}
          duration={duration}
          videoPlayerRef={videoPlayerRef}
        />
      )}
    </div>
  );
};
