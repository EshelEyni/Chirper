import { FC, useEffect } from "react";
import { Slider } from "@mui/material";
import localForageService from "../../../services/localForage/localForageService";
import { useVideoPlayer } from "../../../contexts/VideoPlayerContext";

type VideoVolumeSliderProps = {
  isVolumeHover: boolean;
};
export const VideoVolumeSlider: FC<VideoVolumeSliderProps> = ({ isVolumeHover }) => {
  const { isMuted, setIsMuted, volume, setVolume } = useVideoPlayer();

  function handleChange(e: Event, newValue: number | number[]) {
    e.stopPropagation();
    setVolume((newValue as number) / 100);
    if (newValue === 0) {
      setIsMuted(true);
    } else {
      localForageService.set("volume", ((newValue as number) / 100).toString());
      if (isMuted) setIsMuted(false);
    }
  }

  useEffect(() => {
    if (isMuted) setVolume(0);
  }, [isMuted, setVolume]);

  return (
    <div
      className={"video-volume-slider-container" + (isVolumeHover ? " visible" : "")}
      onClick={e => e.stopPropagation()}
    >
      <Slider
        value={volume * 100}
        orientation="vertical"
        step={1}
        min={0}
        max={100}
        onChange={(e, value) => handleChange(e, value)}
        sx={{
          '& input[type="range"]': {
            WebkitAppearance: "slider-vertical",
          },
          color: "white",
          width: 3,
          transition: "all 0.2s ease-in-out",
          height: 100,
          padding: 0,
          "& .MuiSlider-thumb": {
            backgroundColor: "white",
            transition: "all 0.2s ease-in-out",
            height: 14,
            width: 14,
            "&:hover, &.Mui-focusVisible": {
              boxShadow: "0px 0px 0px 10px rgba(255, 255, 255, 0.10)",
            },
          },
          "& .MuiSlider-rail": {
            transition: "all 0.2s ease-in-out",
            backgroundColor: "grey",
          },
          "& .MuiSlider-track": {
            backgroundColor: "white",
            transition: "all 0.2s ease-in-out",
          },
        }}
      />
    </div>
  );
};
