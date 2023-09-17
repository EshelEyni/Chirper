import { FC } from "react";
import { Gif } from "../../../../../shared/types/GIF";
import { gifPlaceholderBcg } from "../../../services/GIF/GIFService";
import "./GifPreview.scss";

type GifPreviewProps = {
  gif: Gif;
  idx: number;
  width: string;
  isPlaying: boolean;
  handleGifClick: (gif: Gif) => void;
};

export const GifPreview: FC<GifPreviewProps> = ({ gif, idx, width, isPlaying, handleGifClick }) => {
  return (
    <li
      className="gif-preview"
      data-testid="gif-preview"
      onClick={() => handleGifClick(gif)}
      style={{ backgroundColor: gifPlaceholderBcg[idx % gifPlaceholderBcg.length] }}
    >
      <img
        /* 
          the placeholderUrl is a static image that is a low resolution version of the gif
          intended to be used as a placeholder until the gif is clicked 
        */
        src={isPlaying ? gif.placeholderUrl : gif.staticPlaceholderUrl}
        alt={gif.description}
        loading="lazy"
        width={width}
      />
    </li>
  );
};
