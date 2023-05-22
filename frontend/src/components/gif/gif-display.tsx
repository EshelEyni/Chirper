import { useEffect, useState, useRef } from "react";
import { Gif } from "../../../../shared/interfaces/gif.interface";
import { useInView } from "react-intersection-observer";
import { GifDescriptionModal } from "./gif-description-details";
import { BtnTogglePlay } from "../btns/btn-toggle-play";

interface GifDisplayProps {
  gif: Gif;
}

export const GifDisplay: React.FC<GifDisplayProps> = ({ gif: { url, staticUrl, description } }) => {
  const { ref, inView } = useInView({
    threshold: 0.5,
  });

  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isDescriptionShown, setIsDescriptionShown] = useState<boolean>(false);
  const [isModalAbove, setIsModalAbove] = useState(false);
  const btnToggleDescriptionRef = useRef<HTMLButtonElement>(null);

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

  const updateModalPosition = () => {
    if (btnToggleDescriptionRef.current) {
      const { top } = btnToggleDescriptionRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const isModalPositionUp = windowHeight - top < 350;
      setIsModalAbove(isModalPositionUp);
    }
  };

  return (
    <article className="gif-display" onClick={onTogglePlay}>
      <img src={isPlaying ? url : staticUrl} ref={ref} alt="gif" />
      <div className="gif-display-content-container">
        <BtnTogglePlay isPlaying={isPlaying} setIsPlaying={setIsPlaying} size={14} />
        <span className="gif-title">GIF</span>
        <div className="description-container">
          <button
            className="btn-open-description"
            onClick={onToggleDescription}
            ref={btnToggleDescriptionRef}
          >
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
