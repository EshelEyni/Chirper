import { FC } from "react";
import "./MainScreen.scss";

type MainScreenProps = {
  mode: "light" | "dark" | "transparent";
  zIndex?: number;
};

export const MainScreen: FC<MainScreenProps> = ({ mode, zIndex }) => {
  return (
    <div
      className={`main-screen ${mode ? mode : ""}`}
      style={{ zIndex }}
      data-testid="main-screen"
    />
  );
};
