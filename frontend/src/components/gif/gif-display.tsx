import { useEffect, useState, useRef } from "react";
import { Gif } from "../../../../shared/interfaces/gif.interface";
import { useInView } from "react-intersection-observer";
import { GifDescriptionModal } from "./gif-description-details";
import { BtnTogglePlay } from "../btns/btn-toggle-play";
import { useModalPosition } from "../../hooks/useModalPosition";

interface GifDisplayProps {
  gif: Gif;
}

export const GifDisplay: React.FC<GifDisplayProps> = ({ gif: { url, staticUrl, description } }) => {
  const { ref, inView } = useInView({
    threshold: 0.5,
  });

  const modalHeight = 364;
  const { btnRef, isModalAbove, updateModalPosition } = useModalPosition(modalHeight);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isDescriptionShown, setIsDescriptionShown] = useState<boolean>(false);

  useEffect(() => {
    setIsPlaying(inView);
  }, [inView]);

  const onTogglePlay = () => {
    setIsPlaying(prevState => !prevState);
  };

  const onToggleDescription = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateModalPosition();

    setIsDescriptionShown(!isDescriptionShown);
  };

  return (
    <article className="gif-display" onClick={onTogglePlay}>
      <img src={isPlaying ? url : staticUrl} ref={ref} alt="gif" />
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
