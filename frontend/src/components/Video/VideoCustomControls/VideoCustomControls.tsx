import { FC, RefObject } from "react";
import ReactPlayer from "react-player";
import "./VideoCustomControls.scss";
import { VideoProgressBar } from "../VideoProgressBar/VideoProgressBar";
import { BtnTogglePlay } from "../../Btns/BtnTogglePlay/BtnTogglePlay";
import { VideoTimer } from "../VideoTimer/VideoTimer";
import { BtnToggleVolume } from "../../Btns/BtnToggleVolume/BtnToggleVolume";
import { BtnToggleVideoSetting } from "../../Btns/BtnToggleVideoSetting/BtnToggleVideoSetting";
import { BtnToggleVideoFullScreen } from "../../Btns/BtnToggleVideoFullScreen/BtnToggleVideoFullScreen";
import { useVideoPlayer } from "../../../contexts/VideoPlayerContext";
import { useVideoCustomControls } from "../../../contexts/VideoCustomControlsContext";

type VideoCustomControlsProps = {
  videoPlayerRef: RefObject<ReactPlayer>;
  playerWrapperRef: RefObject<HTMLDivElement>;
};

export const VideoCustomControls: FC<VideoCustomControlsProps> = ({
  videoPlayerRef,
  playerWrapperRef,
}) => {
  const { isPlaying, setIsPlaying } = useVideoPlayer();

  const { isFullScreen, isModalShown } = useVideoCustomControls();

  return (
    <section
      className={
        "video-cutom-controls" +
        (isFullScreen ? " full-screen" : "") +
        (isModalShown ? " playback-rate-picker-shown" : "")
      }
    >
      <div className="video-custom-controls-main-container" onClick={e => e.stopPropagation()}>
        <VideoProgressBar videoPlayerRef={videoPlayerRef} />
        <div className="video-custom-controls-actions-container">
          <BtnTogglePlay isPlaying={isPlaying} setIsPlaying={setIsPlaying} size={20} />
          <div className="video-custom-controls-actions-main-container">
            <VideoTimer isCountDown={false} />
            <BtnToggleVolume size={20} />
            <BtnToggleVideoSetting />
            <BtnToggleVideoFullScreen playerWrapperRef={playerWrapperRef} />
          </div>
        </div>
      </div>
      <div className="count-down-timer-container">
        <VideoTimer isCountDown={true} />
      </div>
    </section>
  );
};
