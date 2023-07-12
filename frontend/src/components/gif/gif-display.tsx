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
  const { elementRef, isModalAbove, updateModalPosition } = useModalPosition<HTMLButtonElement>({
    modalHeight: 364,
  });
  const [isPlaying, setIsPlaying] = useState<boolean>(isAutoPlay);
  const [isUserPaused, setIsUserPaused] = useState<boolean>(false);
  const [isDescriptionShown, setIsDescriptionShown] = useState<boolean>(false);
  const { ref, inView } = useInView({
    threshold: 0.5,
  });

  function onTogglePlay() {
    setIsPlaying(prevState => !prevState);
    setIsUserPaused(prevState => !prevState);
  }

  function onToggleDescription(e: React.MouseEvent) {
    e.stopPropagation();
    updateModalPosition();
    setIsDescriptionShown(!isDescriptionShown);
  }

  useEffect(() => {
    setIsPlaying(inView);
  }, [inView]);

  return (
    <article className="gif-display" onClick={onTogglePlay}>
      <img
        src={isPlaying ? url : staticUrl}
        ref={isUserPaused || !isAutoPlay ? undefined : ref}
        alt={description}
        loading="lazy"
      />
      <div className="gif-display-content-container">
        <BtnTogglePlay isPlaying={isPlaying} setIsPlaying={setIsPlaying} size={14} />
        <span className="gif-title">GIF</span>
        <div className="description-container">
          <button className="btn-open-description" onClick={onToggleDescription} ref={elementRef}>
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
