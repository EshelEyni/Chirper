import { FC, RefObject, useEffect } from "react";
import { BsArrowsAngleContract, BsArrowsAngleExpand } from "react-icons/bs";
import "./BtnToggleVideoFullScreen.scss";
import { useVideoCustomControls } from "../../../contexts/VideoCustomControlsContext";

type BtnToggleVideoFullScreenProps = {
  playerWrapperRef: RefObject<HTMLDivElement>;
};

export const BtnToggleVideoFullScreen: FC<BtnToggleVideoFullScreenProps> = ({
  playerWrapperRef,
}) => {
  const { isFullScreen, setIsFullScreen } = useVideoCustomControls();
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
  }, [setIsFullScreen]);

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
