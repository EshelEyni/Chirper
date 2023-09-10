import { FC, useRef } from "react";
import { HiVolumeUp, HiVolumeOff } from "react-icons/hi";
import storageService from "../../../services/storageService";
import { VideoVolumeSlider } from "../../Video/VideoVolumeSlider/VideoVolumeSlider";
import "./BtnToggleVolume.scss";
import { useVideoPlayer } from "../../../contexts/VideoPlayerContext";
import { useVideoCustomControls } from "../../../contexts/VideoCustomControlsContext";

type BtnToggleVolumeProps = {
  size: number;
};

export const BtnToggleVolume: FC<BtnToggleVolumeProps> = ({ size }) => {
  const { isMuted, setIsMuted, setVolume } = useVideoPlayer();
  const { isVolumeHover, setIsVolumeHover } = useVideoCustomControls();
  const btnRef = useRef<HTMLButtonElement | null>(null);

  function onToggleMute(e: React.MouseEvent) {
    e.stopPropagation();
    setIsMuted(prev => !prev);
    if (isMuted) setVolume(Number(storageService.get("volume") || 0.5));
  }

  function onToggleVolumeHover(e: React.MouseEvent, isHover: boolean) {
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
      <VideoVolumeSlider isVolumeHover={isVolumeHover} />
      <button className="btn-toggle-volume" onClick={e => onToggleMute(e)} ref={btnRef}>
        {isMuted ? <HiVolumeOff size={size} /> : <HiVolumeUp size={size} />}
      </button>
    </div>
  );
};
