import { FC } from "react";
import "./PlaybackRatePickerModal.scss";
import { Modal } from "../Modal/Modal";
import { Tippy } from "../../App/Tippy/Tippy";
import { PlaybackRateList } from "./PlaybackRateList/PlaybackRateList";
import { useVideoPlayer } from "../../../contexts/VideoPlayerContext";
import { useVideoCustomControls } from "../../../contexts/VideoCustomControlsContext";

type PlaybackRatePickerModalProps = {
  isModalAbove: boolean;
};

export const PlaybackRatePickerModal: FC<PlaybackRatePickerModalProps> = ({ isModalAbove }) => {
  const { playbackRate, setPlaybackRate } = useVideoPlayer();
  const { isFullScreen, setIsModalShown } = useVideoCustomControls();

  function onSetPlaybackRate(e: React.MouseEvent, rate: number) {
    e.stopPropagation();
    setPlaybackRate(rate);
    setIsModalShown(false);
  }

  return (
    <Modal
      className={
        "playback-rate-picker" +
        (isModalAbove ? " modal-above" : "") +
        (isFullScreen ? " full-screen" : "")
      }
      onClickMainScreen={() => setIsModalShown(false)}
    >
      <Tippy isModalAbove={isModalAbove} isFullScreen={isFullScreen} />
      <div className="playback-rate-picker-main-container">
        <h1>Playback speed</h1>
        <PlaybackRateList currPlaybackRate={playbackRate} onSetPlaybackRate={onSetPlaybackRate} />
      </div>
    </Modal>
  );
};
