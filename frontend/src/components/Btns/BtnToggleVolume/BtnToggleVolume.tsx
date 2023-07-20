import { FC, useRef } from "react";
import { HiVolumeUp, HiVolumeOff } from "react-icons/hi";
import { storageService } from "../../../services/storage.service";
import { VideoVolumeSlider } from "../../Video/VideoVolumeSlider/VideoVolumeSlider";
import "./BtnToggleVolume.scss";

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
  const btnRef = useRef<HTMLButtonElement | null>(null);

  function onToggleMute(e: React.MouseEvent) {
    e.stopPropagation();
    setIsMuted(!isMuted);
    if (isMuted) setVolume(Number(storageService.get("volume") || 0.5));
  }

  function onToggleVolumeHover(e: React.MouseEvent, isHover: boolean) {
    console.log("onToggleVolumeHover", e.relatedTarget);
    e.stopPropagation();
    const isExternalClick =
      btnRef.current &&
      e.relatedTarget instanceof Node &&
      !btnRef.current.contains(e.relatedTarget);
    if (isHover) setIsVolumeHover(true);
    else if (isExternalClick) setIsVolumeHover(false);
  }

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
      <button className="btn-toggle-volume" onClick={e => onToggleMute(e)} ref={btnRef}>
        {isMuted ? <HiVolumeOff size={size} /> : <HiVolumeUp size={size} />}
      </button>
    </div>
  );
};
