import { FC, useState, RefObject } from "react";
import ReactPlayer from "react-player";
import "./VideoCustomControls.scss";
import { VideoProgressBar } from "../VideoProgressBar/VideoProgressBar";
import { BtnTogglePlay } from "../../Btns/BtnTogglePlay/BtnTogglePlay";
import { VideoTimer } from "../VideoTimer/VideoTimer";
import { BtnToggleVolume } from "../../Btns/BtnToggleVolume/BtnToggleVolume";
import { BtnToggleVideoFullScreen } from "../../Btns/BtnToggleVideoFullScreen/BtnToggleVideoFullScreen";
import { useVideoPlayer } from "../../../contexts/VideoPlayerContext";
import { useVideoCustomControls } from "../../../contexts/VideoCustomControlsContext";
import { Modal } from "../../Modals/Modal/Modal";
import { IoSettingsOutline } from "react-icons/io5";
import { Checkbox } from "../../App/Checkbox/Checkbox";

type VideoCustomControlsProps = {
  videoPlayerRef: RefObject<ReactPlayer>;
  playerWrapperRef: RefObject<HTMLDivElement>;
};

export const VideoCustomControls: FC<VideoCustomControlsProps> = ({
  videoPlayerRef,
  playerWrapperRef,
}) => {
  const [openedModalName, setOpenedModalName] = useState("");

  const { isPlaying, setIsPlaying, playbackRate, setPlaybackRate } = useVideoPlayer();

  const { isFullScreen } = useVideoCustomControls();
  const playbackRates = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2];

  return (
    <section
      className={
        "video-cutom-controls" +
        (isFullScreen ? " full-screen" : "") +
        (openedModalName ? " playback-rate-picker-shown" : "")
      }
    >
      <div className="video-custom-controls-main-container" onClick={e => e.stopPropagation()}>
        <VideoProgressBar videoPlayerRef={videoPlayerRef} />
        <div className="video-custom-controls-actions-container">
          <BtnTogglePlay isPlaying={isPlaying} setIsPlaying={setIsPlaying} size={20} />
          <div className="video-custom-controls-actions-main-container">
            <VideoTimer isCountDown={false} />
            <BtnToggleVolume size={20} />
            <Modal externalStateControl={{ openedModalName, setOpenedModalName }}>
              <Modal.OpenBtn
                modalName="playback-rate-picker"
                modalHeight={200}
                setPositionByRef={true}
              >
                <button className="btn-toggle-video-setting">
                  <IoSettingsOutline size={20} color="white" />
                </button>
              </Modal.OpenBtn>

              <Modal.Window
                name="playback-rate-picker"
                includeTippy={true}
                mainScreenMode="transparent"
                mainScreenZIndex={1000}
              >
                <div className="playback-rate-picker-main-container">
                  <h1>Playback speed</h1>

                  <ul className="playback-rate-list">
                    {playbackRates.map(rate => (
                      <li
                        key={rate}
                        className="playback-rate-list-item"
                        onClick={() => {
                          setPlaybackRate(rate);
                          setOpenedModalName("");
                        }}
                      >
                        <span className="playback-rate-list-item-label">{rate}x</span>
                        <Checkbox isChecked={playbackRate === rate} />
                      </li>
                    ))}
                  </ul>
                </div>
              </Modal.Window>
            </Modal>
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
