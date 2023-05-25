import { FC, useState } from "react";
import { HiVolumeUp, HiVolumeOff } from "react-icons/hi";
import { VideoVolumeSlider } from "../video/video-volume-slider";
import { set } from "mongoose";
import { storageService } from "../../services/storage.service";

type BtnToggleVolumeProps = {
  isMuted: boolean;
  setIsMuted: (isMuted: boolean) => void;
  volume: number;
  setVolume: (volume: number) => void;
  size: number;
  isVolumeHover: boolean;
  setIsVolumeHover: (isVolumeHover: boolean) => void;
};

export const BtnToggleVolume: FC<BtnToggleVolumeProps> = ({
  isMuted,
  setIsMuted,
  volume,
  setVolume,
  size,
  isVolumeHover,
  setIsVolumeHover,
}) => {
  const [isBtnClicked, setIsBtnClicked] = useState(false);

  const onToggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMuted(!isMuted);
    if (isMuted) {
      setVolume(Number(storageService.get("volume") || 0.5));
    }
    setIsBtnClicked(true);
    setTimeout(() => {
      setIsBtnClicked(false);
    }, 100);
  };

  const onToggleVolumeHover = (e: React.MouseEvent, isEntering: boolean) => {
    e.stopPropagation();

    if (isEntering) {
      setIsVolumeHover(true);
    } else if (!isBtnClicked) {
      setIsVolumeHover(false);
    }
  };

  return (
    <div
      className="btn-toggle-volume-container"
      onMouseEnter={e => onToggleVolumeHover(e, true)}
      onMouseLeave={e => onToggleVolumeHover(e, false)}
    >
      <VideoVolumeSlider
        isMuted={isMuted}
        setIsMuted={setIsMuted}
        volume={volume}
        setVolume={setVolume}
        isVolumeHover={isVolumeHover}
      />
      <button className="btn-toggle-volume" onClick={e => onToggleMute(e)}>
        {isMuted ? <HiVolumeOff size={size} /> : <HiVolumeUp size={size} />}
      </button>
    </div>
  );
};
