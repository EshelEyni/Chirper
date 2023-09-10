import { FC } from "react";
import { Gif } from "../../../../../shared/types/gif.interface";
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
      onClick={() => handleGifClick(gif)}
      style={{
        backgroundColor: gifPlaceholderBcg[idx % gifPlaceholderBcg.length],
        width: width,
      }}
    >
      <img
        src={isPlaying ? gif.placeholderUrl : gif.staticPlaceholderUrl}
        alt={gif.description}
        loading="lazy"
      />
    </li>
  );
};
