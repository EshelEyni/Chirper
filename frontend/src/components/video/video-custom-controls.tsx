import { findDOMNode } from "react-dom";
import { FC, RefObject } from "react";
import { VideoProgressBar } from "./video-progress-bar";
import ReactPlayer from "react-player";
import { VideoTimer } from "./video-timer";
import { BtnTogglePlay } from "../btns/btn-toggle-play";
import { BtnToggleVolume } from "../btns/btn-toggle-volume";
import { BtnToggleVideoSetting } from "../btns/btn-toggle-video-setting";
import { CgArrowsExpandRight } from "react-icons/cg";

type VideoCustomControlsProps = {
  isPlaying: boolean;
  setIsPlaying: (isPlaying: boolean) => void;
  isMuted: boolean;
  setIsMuted: (isMuted: boolean) => void;
  volume: number;
  setVolume: (volume: number) => void;
  progress: number;
  setProgress: (timer: number) => void;
  playedSeconds: number;
  duration: number;
  playbackRate: number;
  setPlaybackRate: (playbackRate: number) => void;
  videoPlayerRef: RefObject<ReactPlayer>;
  playerWrapperRef: RefObject<HTMLDivElement>;
};

export const VideoCustomControls: FC<VideoCustomControlsProps> = ({
  isPlaying,
  setIsPlaying,
  isMuted,
  setIsMuted,
  volume,
  setVolume,
  progress,
  setProgress,
  playedSeconds,
  duration,
  playbackRate,
  setPlaybackRate,
  videoPlayerRef,
  playerWrapperRef,
}) => {
  const onToggleFullScreen = () => {
    if (playerWrapperRef.current) {
      const player = playerWrapperRef.current as HTMLElement;

      if (player.requestFullscreen) {
        player.requestFullscreen();
      } else if ((player as any).mozRequestFullScreen) {
        (player as any).mozRequestFullScreen();
      } else if ((player as any).webkitRequestFullscreen) {
        (player as any).webkitRequestFullscreen();
      } else if ((player as any).msRequestFullscreen) {
        (player as any).msRequestFullscreen();
      }
    }
  };

  return (
    <section className="video-cutom-controls">
      <div className="video-custom-controls-main-container">
        <VideoProgressBar
          progress={progress}
          setProgress={setProgress}
          videoPlayerRef={videoPlayerRef}
        />
        <div className="video-custom-controls-actions-container">
          <BtnTogglePlay isPlaying={isPlaying} setIsPlaying={setIsPlaying} size={20} />

          <div className="video-custom-controls-actions-main-container">
            <VideoTimer playedSeconds={playedSeconds} duration={duration} />
            <BtnToggleVolume
              isMuted={isMuted}
              setIsMuted={setIsMuted}
              volume={volume}
              setVolume={setVolume}
              size={20}
            />
            <BtnToggleVideoSetting playbackRate={playbackRate} setPlaybackRate={setPlaybackRate} />
            <button onClick={onToggleFullScreen}>
              <CgArrowsExpandRight />
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
