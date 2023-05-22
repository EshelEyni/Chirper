import { FC } from "react";

type PlaybackRatePickerModalProps = {
  playbackRate: number;
};

export const PlaybackRatePickerModal: FC<PlaybackRatePickerModalProps> = ({ playbackRate }) => {
  const playbackRates = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2];

  return (
    <div className="playback-rate-picker-modal-container">
      <div className="playback-rate-picker-modal-main-container">
        <div className="playback-rate-picker-modal-header-container">
          <h3>Playback Rate</h3>
        </div>
        <div className="playback-rate-picker-modal-body-container">
          <ul className="playback-rate-picker-modal-list">
            {playbackRates.map((rate, index) => (
              <li key={index} className="playback-rate-picker-modal-list-item">
                <button>{rate}</button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
