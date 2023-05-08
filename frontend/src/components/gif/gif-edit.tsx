import { AiOutlineClose } from "react-icons/ai";
import { Gif as GitType } from "../../../../shared/interfaces/gif.interface";
import { useState } from "react";
import { FaPlay } from "react-icons/fa";
import { ContentLoader } from "../loaders/content-loader";
import { Fragment } from "react";

interface GifProps {
  gif: GitType;
  setGif: (url: GitType | null) => void;
}

export const GifEdit: React.FC<GifProps> = ({ gif, setGif }) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const onImageLoad = () => {
    setIsLoading(false);
  };

  const onTogglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <Fragment>
      {isLoading && <ContentLoader />}
      <div className="gif" style={{ visibility: isLoading ? "hidden" : "visible" }}>
        <button className="btn-remove-content" onClick={() => setGif(null)}>
          <AiOutlineClose className="remove-content-icon" />
        </button>
        <img
          src={isPlaying ? gif.url : gif.staticUrl}
          alt="gif"
          onClick={onTogglePlay}
          onLoad={onImageLoad}
        />
        {!isPlaying && (
          <button className="btn-play" onClick={onTogglePlay}>
            <div className="btn-play-icon-container">
              <FaPlay className="play-icon" />
            </div>
          </button>
        )}
        <span className="gif-title">GIF</span>
      </div>
    </Fragment>
  );
};
