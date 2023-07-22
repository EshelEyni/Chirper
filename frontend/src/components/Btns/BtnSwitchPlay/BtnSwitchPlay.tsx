import { FC } from "react";
import Switch from "@mui/material/Switch";
import "./BtnSwitchPlay.scss";

interface BtnSwitchPlayProps {
  isPlaying: boolean;
  handleChange: () => void;
}

export const BtnSwitchPlay: FC<BtnSwitchPlayProps> = ({ isPlaying, handleChange }) => {
  return (
    <div className="btn-switch-play">
      <span>Auto-play GIFs</span>
      <Switch
        checked={isPlaying}
        onChange={handleChange}
        sx={{
          "&.MuiSwitch-root .MuiSwitch-thumb": {
            backgroundColor: isPlaying ? "var(--color-primary)" : "white",
          },
          "&.MuiSwitch-root .Mui-checked + .MuiSwitch-track": {
            backgroundColor: "var(--color-primary-light)",
          },
          "& .MuiSwitch-track": {
            width: "40px",
          },
          "& .MuiSwitch-switchBase.Mui-checked": {
            transform: "translateX(24px)",
          },
        }}
      />
    </div>
  );
};
