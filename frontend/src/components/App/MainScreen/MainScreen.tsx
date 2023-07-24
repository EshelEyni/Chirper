import { FC } from "react";
import "./MainScreen.scss";

type MainScreenProps = {
  onClickFn: () => void;
  mode?: "light" | "dark";
  zIndex?: number;
};

export const MainScreen: FC<MainScreenProps> = ({ onClickFn, mode, zIndex }) => {
  return (
    <div className={`main-screen ${mode ? mode : ""}`} onClick={onClickFn} style={{ zIndex }} />
  );
};
