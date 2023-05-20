import { FC, useState, useRef } from "react";
import ReactPlayer from "react-player";
import { VideoCustomControls } from "./video-custom-controls";

type VideoPlayerProps = {
  videoUrl: string;
  isCustomControls?: boolean;
};

export const VideoPlayer: FC<VideoPlayerProps> = ({ videoUrl, isCustomControls = false }) => {
  const [timer, setTimer] = useState(0);
  const [dur, setDur] = useState(0);
  const videoPlayerRef = useRef<ReactPlayer>(null);

  return (
    <div className="react-player-container">
      <ReactPlayer
        className="react-player"
        ref={videoPlayerRef}
        url={videoUrl}
        controls={!isCustomControls}
        onProgress={({ playedSeconds }) => {
          setTimer((playedSeconds * 100) / dur);
        }}
        onDuration={duration => setDur(duration)}
        playing={true}
        width="100%"
        height="100%"
        muted={true}
      />
      {isCustomControls && (
        <VideoCustomControls timer={timer} setTimer={setTimer} videoPlayerRef={videoPlayerRef} />
      )}
    </div>
  );
};
