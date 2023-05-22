import { FC, RefObject } from "react";
import { Slider } from "@mui/material";
import ReactPlayer from "react-player";

type VideoProgressBarProps = {
  progress: number;
  setProgress: (progress: number) => void;
  videoPlayerRef: RefObject<ReactPlayer>;
};

export const VideoProgressBar: FC<VideoProgressBarProps> = ({
  progress,
  setProgress,
  videoPlayerRef,
}) => {
  const handleChange = (newValue: number) => {
    if (!videoPlayerRef.current) return;
    videoPlayerRef.current.seekTo((newValue * videoPlayerRef.current.getDuration()) / 100);
    setProgress(newValue as number);
  };

  return (
    <Slider
      value={progress}
      step={1}
      min={0}
      max={100}
      onChange={(e, value) => handleChange(value as number)}
      sx={{
        color: "white",
        width: "100%",
        transition: "all 0.2s ease-in-out",
        height: 2,
        padding: 0,
        "& .MuiSlider-thumb": {
          backgroundColor: "white",
          transition: "all 0.2s ease-in-out",
          height: 16,
          width: 16,
          display: "none",
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
        "&:hover": {
          "& .MuiSlider-thumb": {
            display: "block",
            transition: "all 0.2s ease-in-out",
          },
        },
      }}
    />
  );
};
