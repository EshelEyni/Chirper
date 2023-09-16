import { FC } from "react";
import { IoIosPause } from "react-icons/io";
import { IoPlaySharp } from "react-icons/io5";

type BtnTogglePlayProps = {
  isPlaying: boolean;
  setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>;
  size: number;
};

export const BtnTogglePlay: FC<BtnTogglePlayProps> = ({ isPlaying, setIsPlaying, size }) => {
  function onTogglePlay() {
    setIsPlaying(prev => !prev);
  }

  return (
    <button className="btn-toggle-play" onClick={onTogglePlay}>
      {isPlaying ? (
        <IoIosPause size={size} data-testid="btn-toggle-play-pause-icon" />
      ) : (
        <IoPlaySharp size={size} data-testid="btn-toggle-play-play-icon" />
      )}
    </button>
  );
};
