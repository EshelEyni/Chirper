import { FC } from "react";
import { IoIosPause } from "react-icons/io";
import { IoPlaySharp } from "react-icons/io5";

type BtnTogglePlayProps = {
  isPlaying: boolean;
  setIsPlaying: (isPlaying: boolean) => void;
  size: number;
};

export const BtnTogglePlay: FC<BtnTogglePlayProps> = ({ isPlaying, setIsPlaying, size }) => {
  const onTogglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPlaying(!isPlaying);
  };

  return (
    <button className="btn-toggle-play" onClick={e => onTogglePlay(e)}>
      {isPlaying ? <IoIosPause size={size} /> : <IoPlaySharp size={size} />}
    </button>
  );
};
