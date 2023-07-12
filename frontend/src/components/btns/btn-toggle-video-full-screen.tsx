import { FC, RefObject, useEffect } from "react";
import { BsArrowsAngleContract, BsArrowsAngleExpand } from "react-icons/bs";

type BtnToggleVideoFullScreenProps = {
  playerWrapperRef: RefObject<HTMLDivElement>;
  isFullScreen: boolean;
  setIsFullScreen: (isFullScreen: boolean) => void;
};

export const BtnToggleVideoFullScreen: FC<BtnToggleVideoFullScreenProps> = ({
  playerWrapperRef,
  isFullScreen,
  setIsFullScreen,
}) => {
  function onToggleFullScreen(e: React.MouseEvent) {
    e.stopPropagation();
    const player = playerWrapperRef.current as HTMLElement;
    if (!playerWrapperRef.current) return;

    if (!isFullScreen) {
      player.requestFullscreen();
      setIsFullScreen(true);
    } else {
      document.exitFullscreen();
      setIsFullScreen(false);
    }
  }

  useEffect(() => {
    document.addEventListener("fullscreenchange", () => {
      setIsFullScreen(!!document.fullscreenElement);
    });

    return () => {
      document.removeEventListener("fullscreenchange", () => {
        setIsFullScreen(!!document.fullscreenElement);
      });
    };
  }, []);

  return (
    <button onClick={e => onToggleFullScreen(e)} className="btn-toggle-video-full-screen">
      {isFullScreen ? (
        <BsArrowsAngleContract color="white" size={18} />
      ) : (
        <BsArrowsAngleExpand color="white" size={18} />
      )}
    </button>
  );
};
