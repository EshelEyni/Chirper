import { FC, RefObject } from "react";
import { VideoProgressBar } from "./video-progress-bar";
import ReactPlayer from "react-player";
import { VideoTimer } from "./video-timer";
import { FaPlay } from "react-icons/fa";
import { IoIosPause } from "react-icons/io";
import { HiVolumeUp, HiVolumeOff } from "react-icons/hi";

type VideoCustomControlsProps = {
  isPlaying: boolean;
  setIsPlaying: (isPlaying: boolean) => void;
  isMuted: boolean;
  setIsMuted: (isMuted: boolean) => void;
  progress: number;
  setProgress: (timer: number) => void;
  playedSeconds: number;
  duration: number;
  videoPlayerRef: RefObject<ReactPlayer>;
};

export const VideoCustomControls: FC<VideoCustomControlsProps> = ({
  isPlaying,
  setIsPlaying,
  isMuted,
  setIsMuted,
  progress,
  setProgress,
  playedSeconds,
  duration,
  videoPlayerRef,
}) => {
  return (
    <section className="video-cutom-controls">
      <div className="video-custom-controls-main-container">
        <VideoProgressBar
          progress={progress}
          setProgress={setProgress}
          videoPlayerRef={videoPlayerRef}
        />
        <div className="video-custom-controls-actions-container">
          <button className="video-custom-controls-toggle-play-btn">
            {isPlaying ? <IoIosPause /> : <FaPlay />}
          </button>

          <div className="video-custom-controls-actions-main-container">
            <VideoTimer playedSeconds={playedSeconds} duration={duration} />
            <button className="video-custom-controls-toggle-volume-btn">
              {isMuted ? <HiVolumeOff /> : <HiVolumeUp />}
            </button>
          </div>
        </div>
      </div>
      {/* <div className="count-down-timer-container">
        <VideoTimer playedSeconds={playedSeconds} duration={duration} isCountDown={true} />
      </div> */}
    </section>
  );
};
