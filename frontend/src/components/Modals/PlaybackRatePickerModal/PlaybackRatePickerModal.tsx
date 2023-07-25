import { FC } from "react";
import "./PlaybackRatePickerModal.scss";
import { Modal } from "../Modal/Modal";
import { Tippy } from "../../App/Tippy/Tippy";
import { PlaybackRateList } from "./PlaybackRateList/PlaybackRateList";

type PlaybackRatePickerModalProps = {
  playbackRate: number;
  setPlaybackRate: (playbackRate: number) => void;
  onToggleModal: (isModal: boolean) => void;
  isModalAbove: boolean;
  isFullScreen: boolean;
};

export const PlaybackRatePickerModal: FC<PlaybackRatePickerModalProps> = ({
  playbackRate,
  setPlaybackRate,
  onToggleModal,
  isModalAbove,
  isFullScreen,
}) => {
  function onSetPlaybackRate(e: React.MouseEvent, rate: number) {
    e.stopPropagation();
    setPlaybackRate(rate);
    onToggleModal(false);
  }

  return (
    <Modal
      className={
        "playback-rate-picker" +
        (isModalAbove ? " modal-above" : "") +
        (isFullScreen ? " full-screen" : "")
      }
      onClickMainScreen={() => onToggleModal(false)}
    >
      <Tippy isModalAbove={isModalAbove} isFullScreen={isFullScreen} />
      <div className="playback-rate-picker-main-container">
        <h1>Playback speed</h1>
        <PlaybackRateList currPlaybackRate={playbackRate} onSetPlaybackRate={onSetPlaybackRate} />
      </div>
    </Modal>
  );
};
