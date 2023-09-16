import { FC } from "react";

type TippyProps = {
  isModalAbove: boolean;
  isFullScreen?: boolean;
};

export const Tippy: FC<TippyProps> = ({ isModalAbove, isFullScreen = false }) => {
  const className =
    "tippy" + (isModalAbove ? " down" : " up") + (isFullScreen ? " full-screen" : "");
  return <div className={className} data-testid="tippy" />;
};
