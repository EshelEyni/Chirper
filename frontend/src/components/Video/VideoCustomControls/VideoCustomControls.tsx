import { Dispatch, FC, RefObject, SetStateAction, useState } from "react";
import ReactPlayer from "react-player";
import "./VideoCustomControls.scss";
import { VideoProgressBar } from "../VideoProgressBar/VideoProgressBar";
import { BtnTogglePlay } from "../../Btns/BtnTogglePlay/BtnTogglePlay";
import { VideoTimer } from "../VideoTimer/VideoTimer";
import { BtnToggleVolume } from "../../Btns/BtnToggleVolume/BtnToggleVolume";
import { BtnToggleVideoSetting } from "../../Btns/BtnToggleVideoSetting/BtnToggleVideoSetting";
import { BtnToggleVideoFullScreen } from "../../Btns/BtnToggleVideoFullScreen/BtnToggleVideoFullScreen";

type VideoCustomControlsProps = {
  isPlaying: boolean;
  setIsPlaying: Dispatch<SetStateAction<boolean>>;
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
        (isPlaybackRatePickerModalShown ? " playback-rate-picker-shown" : "")
      }
    >
      <div className="video-custom-controls-main-container" onClick={e => e.stopPropagation()}>
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
