import { FC, Fragment } from "react";
import { AiFillCheckCircle } from "react-icons/ai";

type PlaybackRatePickerModalProps = {
  playbackRate: number;
  setPlaybackRate: (playbackRate: number) => void;
  onToggleModal: (isModal: boolean) => void;
  isModalAbove: boolean;
};

export const PlaybackRatePickerModal: FC<PlaybackRatePickerModalProps> = ({
  playbackRate,
  setPlaybackRate,
  onToggleModal,
  isModalAbove,
}) => {
  const playbackRates = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2];

  const onSetPlaybackRate = (e: React.MouseEvent, rate: number) => {
    e.stopPropagation();
    setPlaybackRate(rate);
    onToggleModal(false);
  };

  return (
    <Fragment>
      <div className="main-screen" onClick={() => onToggleModal(false)}></div>
      <div
        className="playback-rate-picker-modal-container"
        style={isModalAbove ? { bottom: "40px" } : { top: "40px" }}
      >
        <div className={"tippy" + (isModalAbove ? " down" : " up")}></div>
        <div className="playback-rate-picker-modal-main-container">
          <h1>Playback speed</h1>
          <ul className="playback-rate-picker-modal-list">
            {playbackRates.map(rate => (
              <li
                key={rate}
                className="playback-rate-picker-modal-list-item"
                onClick={e => onSetPlaybackRate(e, rate)}
              >
                <span className="playback-rate-picker-modal-list-item-label">{rate}x</span>
                <div
                  className={
                    "playback-rate-picker-modal-list-item-check-box" +
                    (playbackRate === rate ? " checked" : " unchecked")
                  }
                >
                  {playbackRate === rate && (
                    <AiFillCheckCircle size={24} color="var(--color-primary)" />
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Fragment>
  );
};
