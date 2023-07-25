import { FC } from "react";
import "./PlaybackRateList.scss";
import { Checkbox } from "../../../App/Checkbox/Checkbox";

type PlaybackRatePickerModalListProps = {
  currPlaybackRate: number;
  onSetPlaybackRate: (e: React.MouseEvent, rate: number) => void;
};

export const PlaybackRateList: FC<PlaybackRatePickerModalListProps> = ({
  currPlaybackRate,
  onSetPlaybackRate,
}) => {
  const playbackRates = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2];

  return (
    <ul className="playback-rate-list">
      {playbackRates.map(rate => (
        <li
          key={rate}
          className="playback-rate-list-item"
          onClick={e => onSetPlaybackRate(e, rate)}
        >
          <span className="playback-rate-list-item-label">{rate}x</span>
          <Checkbox isChecked={currPlaybackRate === rate} />
        </li>
      ))}
    </ul>
  );
};
