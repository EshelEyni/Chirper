import { FC } from "react";
import { Slider } from "@mui/material";

type VideoProgressBarProps = {
  timer: number;
  setTimer: (timer: number) => void;
  videoPlayerRef: any;
};

export const VideoProgressBar: FC<VideoProgressBarProps> = ({
  timer,
  setTimer,
  videoPlayerRef,
}) => {
  const handleChange = (newValue: number) => {
    videoPlayerRef.current.seekTo((newValue * videoPlayerRef.current.getDuration()) / 100);
    setTimer(newValue as number);
  };

  return (
    <Slider
      value={timer}
      step={1}
      min={0}
      max={100}
      onChange={(e, value) => handleChange(value as number)}
      sx={{
        color: "white",
        width: "100%",
        transition: "all 0.2s ease-in-out",
        padding: 0,
        "& .MuiSlider-thumb": {
          backgroundColor: "white",
          transition: "all 0.2s ease-in-out",
          height: 16,
          width: 16,
          display: "none",
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
