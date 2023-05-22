import { FC } from "react";
import { HiVolumeUp, HiVolumeOff } from "react-icons/hi";
import { VideoVolumeSlider } from "../video/video-volume-slider";

type BtnToggleVolumeProps = {
  isMuted: boolean;
  setIsMuted: (isMuted: boolean) => void;
  volume: number;
  setVolume: (volume: number) => void;
  size: number;
};

export const BtnToggleVolume: FC<BtnToggleVolumeProps> = ({
  isMuted,
  setIsMuted,
  volume,
  setVolume,
  size,
}) => {
  const onToggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMuted(!isMuted);
  };
  return (
    <div className="btn-toggle-volume-container">
      <VideoVolumeSlider
        isMuted={isMuted}
        setIsMuted={setIsMuted}
        volume={volume}
        setVolume={setVolume}
      />
      <button className="btn-toggle-volume" onClick={e => onToggleMute(e)}>
        {isMuted ? <HiVolumeOff size={size} /> : <HiVolumeUp size={size} />}
      </button>
    </div>
  );
};
