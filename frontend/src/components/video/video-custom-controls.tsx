import { FC, RefObject, useState } from "react";
import { VideoProgressBar } from "./video-progress-bar";
import ReactPlayer from "react-player";
import { VideoTimer } from "./video-timer";
import { BtnTogglePlay } from "../btns/btn-toggle-play";
import { BtnToggleVolume } from "../btns/btn-toggle-volume";
import { BtnToggleVideoSetting } from "../btns/btn-toggle-video-setting";
import { BtnToggleVideoFullScreen } from "../btns/btn-toggle-video-full-screen";

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
  const [isVolumeHover, setIsVolumeHover] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isPlaybackRatePickerModalShown, setIsPlaybackRaterPickerModalShown] = useState(false);

  return (
    <section
      className={
        "video-cutom-controls" +
        (isFullScreen ? " full-screen" : "") +
        (isPlaybackRatePickerModalShown ? " playback-rate-picker-modal-shown" : "")
      }
    >
      <div className="video-custom-controls-main-container">
        <VideoProgressBar
          progress={progress}
          setProgress={setProgress}
          videoPlayerRef={videoPlayerRef}
          isVolumeHover={isVolumeHover}
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
              isVolumeHover={isVolumeHover}
              setIsVolumeHover={setIsVolumeHover}
            />
            <BtnToggleVideoSetting
              isPlaybackRatePickerModalShown={isPlaybackRatePickerModalShown}
              setIsPlaybackRaterPickerModalShown={setIsPlaybackRaterPickerModalShown}
              playbackRate={playbackRate}
              setPlaybackRate={setPlaybackRate}
              isFullScreen={isFullScreen}
            />

            <BtnToggleVideoFullScreen
              isFullScreen={isFullScreen}
              setIsFullScreen={setIsFullScreen}
              playerWrapperRef={playerWrapperRef}
            />
          </div>
        </div>
      </div>
      <div className="count-down-timer-container">
        <VideoTimer playedSeconds={playedSeconds} duration={duration} isCountDown={true} />
      </div>
    </section>
  );
};
