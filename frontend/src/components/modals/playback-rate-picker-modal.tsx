import { FC, Fragment } from "react";
import { AiFillCheckCircle } from "react-icons/ai";

type PlaybackRatePickerModalProps = {
  playbackRate: number;
  onToggleModal: (isModal: boolean) => void;
  isModalAbove: boolean;
};

export const PlaybackRatePickerModal: FC<PlaybackRatePickerModalProps> = ({
  playbackRate,
  onToggleModal,
  isModalAbove,
}) => {
  const playbackRates = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2];

  return (
    <Fragment>
      <div className="main-screen" onClick={() => onToggleModal(false)}></div>
      <div
        className="playback-rate-picker-modal-container"
        style={isModalAbove ? { bottom: "30px" } : { top: "30px" }}
      >
        <div className={"tippy" + (isModalAbove ? " down" : " up")}></div>
        <div className="playback-rate-picker-modal-main-container">
          <div className="playback-rate-picker-modal-header-container">
            <h3>Playback Rate</h3>
          </div>
          <div className="playback-rate-picker-modal-body-container">
            <ul className="playback-rate-picker-modal-list">
              {playbackRates.map((rate, index) => (
                <li key={index} className="playback-rate-picker-modal-list-item">
                  <button>{rate}</button>
                  {playbackRate === rate && <AiFillCheckCircle size={20} />}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </Fragment>
  );
};
