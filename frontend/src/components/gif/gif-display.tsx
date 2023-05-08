import { Gif } from "../../../../shared/interfaces/gif.interface";

interface GifDisplayProps {
  gif: Gif;
}

export const GifDisplay: React.FC<GifDisplayProps> = ({ gif }) => {
  return (
    <div className="gif">
      <img src={gif.url} alt="gif" />
      <span className="gif-title">GIF</span>
    </div>
  );
};
