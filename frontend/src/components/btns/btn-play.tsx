import { FC } from "react";
import { FaPlay } from "react-icons/fa";

type BtnPlayProps = {
  onTogglePlay: (e: React.MouseEvent) => void;
};

export const BtnPlay: FC<BtnPlayProps> = ({ onTogglePlay }) => {
  return (
    <button className="btn-play" onClick={onTogglePlay}>
      <div className="btn-play-icon-container">
        <FaPlay className="play-icon" />
      </div>
    </button>
  );
};
