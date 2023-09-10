import { useEffect, useState } from "react";
import { Gif } from "../../../../../shared/types/gif.interface";
import { useInView } from "react-intersection-observer";
import { BtnTogglePlay } from "../../Btns/BtnTogglePlay/BtnTogglePlay";
import "./GifDisplay.scss";
import { gifPlaceholderBcg } from "../../../services/GIF/GIFService";
import { Modal } from "../../Modal/Modal";

interface GifDisplayProps {
  gif: Gif;
  isAutoPlay?: boolean;
}

export const GifDisplay: React.FC<GifDisplayProps> = ({
  gif: {
    url,
    staticUrl,
    description,
    size: { height, width },
  },
  isAutoPlay = true,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(isAutoPlay);
  const [isUserPaused, setIsUserPaused] = useState<boolean>(false);
  const { ref, inView } = useInView({
    threshold: 0.5,
  });

  function onTogglePlay() {
    setIsPlaying(prev => !prev);
    setIsUserPaused(prev => !prev);
  }

  useEffect(() => {
    setIsPlaying(inView);
  }, [inView]);

  return (
    <article className="gif-display">
      <img
        src={isPlaying ? url : staticUrl}
        ref={isUserPaused || !isAutoPlay ? undefined : ref}
        alt={description}
        loading="lazy"
        style={{
          height: `${(height / width) * 100}%`,
          width: "100%",
          backgroundColor: gifPlaceholderBcg[0],
        }}
        onClick={onTogglePlay}
      />
      <div className="gif-display-content-container">
        <BtnTogglePlay isPlaying={isPlaying} setIsPlaying={setIsPlaying} size={14} />
        <span className="gif-title">GIF</span>
        <div className="description-container">
          <Modal>
            <Modal.OpenBtn modalName="gif-description" setPositionByRef={true} modalHeight={364}>
              <button className="btn-open-description">ALT</button>
            </Modal.OpenBtn>

            <Modal.Window
              name="gif-description"
              className="gif-description"
              mainScreenMode="transparent"
              mainScreenZIndex={1000}
              includeTippy={true}
            >
              <div className="gif-description-title-text-container">
                <h1>Image description</h1>
                <p>{description}</p>
              </div>

              <Modal.CloseBtn>
                <button className="btn-close-image-description">Dismiss</button>
              </Modal.CloseBtn>
            </Modal.Window>
          </Modal>
        </div>
      </div>
    </article>
  );
};
