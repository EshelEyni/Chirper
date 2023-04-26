import { AiOutlineClose } from "react-icons/ai";
import { GifUrl } from "../../../../shared/interfaces/gif.interface";
import { useState } from "react";
import { FaPlay } from "react-icons/fa";

interface GifProps {
  gifUrl: GifUrl;
  setGifUrl: (url: GifUrl | null) => void;
}

export const Gif: React.FC<GifProps> = ({ gifUrl, setGifUrl }) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  return (
    <div>
      <div className="gif">
        <button className="btn-remove-content" onClick={() => setGifUrl(null)}>
          <AiOutlineClose className="remove-content-icon" />
        </button>
        {isPlaying ? (
          <img
            src={gifUrl.url}
            alt="gif"
            onClick={() => setIsPlaying(!isPlaying)}
          />
        ) : (
          <img
            src={gifUrl.staticUrl}
            alt="gif"
            onClick={() => setIsPlaying(!isPlaying)}
          />
        )}
        {!isPlaying && (
          <button className="btn-play">
            <div className="btn-play-icon-container">
              <FaPlay className="play-icon" />
            </div>
          </button>
        )}
        <span className="gif-title">GIF</span>
      </div>
    </div>
  );
};
