import { FC } from "react";
import { AiFillCheckCircle } from "react-icons/ai";

type PlaybackRatePickerModalListProps = {
  playbackRate: number;
  playbackRates: number[];
  onSetPlaybackRate: (e: React.MouseEvent, rate: number) => void;
};

export const PlaybackRatePickerModalList: FC<PlaybackRatePickerModalListProps> = ({
  playbackRate,
  playbackRates,
  onSetPlaybackRate,
}) => {
  return (
    <ul className="playback-rate-picker-list">
      {playbackRates.map(rate => (
        <li
          key={rate}
          className="playback-rate-picker-list-item"
          onClick={e => onSetPlaybackRate(e, rate)}
        >
          <span className="playback-rate-picker-list-item-label">{rate}x</span>
          <div
            className={
              "playback-rate-picker-list-item-check-box" +
              (playbackRate === rate ? " checked" : " unchecked")
            }
          >
            {playbackRate === rate && <AiFillCheckCircle size={24} color="var(--color-primary)" />}
          </div>
        </li>
      ))}
    </ul>
  );
};
