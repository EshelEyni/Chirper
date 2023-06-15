import { useEffect, useState } from "react";
import { Gif } from "../../../../shared/interfaces/gif.interface";
import { useInView } from "react-intersection-observer";
import { GifDescriptionModal } from "./gif-description-details";
import { BtnTogglePlay } from "../btns/btn-toggle-play";
import { useModalPosition } from "../../hooks/useModalPosition";

interface GifDisplayProps {
  gif: Gif;
  isAutoPlay?: boolean;
}

export const GifDisplay: React.FC<GifDisplayProps> = ({
  gif: { url, staticUrl, description },
  isAutoPlay = true,
}) => {
  const modalHeight = 364;
  const { btnRef, isModalAbove, updateModalPosition } = useModalPosition(modalHeight);
  const [isPlaying, setIsPlaying] = useState<boolean>(isAutoPlay);
  const [isUserPaused, setIsUserPaused] = useState<boolean>(false);
  const [isDescriptionShown, setIsDescriptionShown] = useState<boolean>(false);
  const { ref, inView } = useInView({
    threshold: 0.5,
  });

  useEffect(() => {
    console.log("GifDisplay: useEffect: isAutoPlay", isAutoPlay);
    console.log("GifDisplay: useEffect: isPlaying", isPlaying);
    setIsPlaying(inView);
  }, [inView]);

  const onTogglePlay = () => {
    setIsPlaying(prevState => !prevState);
    setIsUserPaused(prevState => !prevState);
  };

  const onToggleDescription = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateModalPosition();
    setIsDescriptionShown(!isDescriptionShown);
  };

  return (
    <article className="gif-display" onClick={onTogglePlay}>
      <img
        src={isPlaying ? url : staticUrl}
        ref={isUserPaused || !isAutoPlay ? undefined : ref}
        alt="gif"
        loading="lazy"
      />
      <div className="gif-display-content-container">
        <BtnTogglePlay isPlaying={isPlaying} setIsPlaying={setIsPlaying} size={14} />
        <span className="gif-title">GIF</span>
        <div className="description-container">
          <button className="btn-open-description" onClick={onToggleDescription} ref={btnRef}>
            ALT
          </button>
          {isDescriptionShown && (
            <GifDescriptionModal
              isModalAbove={isModalAbove}
              description={description}
              onToggleDescription={onToggleDescription}
            />
          )}
        </div>
      </div>
    </article>
  );
};
