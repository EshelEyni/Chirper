import { useState, useEffect } from "react";
import { postService } from "../../services/post.service";
import { ContentLoader } from "../loaders/content-loader";
import { Gif, GifUrl } from "../../../../shared/interfaces/gif.interface";

interface GifListProps {
  category: string;
  setGifUrl: (url: GifUrl | null) => void;
  setIsgifPickerShown: (isShown: boolean) => void;
}

export const GifList: React.FC<GifListProps> = ({ category, setGifUrl ,setIsgifPickerShown}) => {
  const [gifs, setGifs] = useState<Gif[]>([]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  useEffect(() => {
    if (category && !gifs.length) getGifsByCategory();

    return () => {
      setGifs([]);
    };
  }, []);

  const getGifsByCategory = async () => {
    const gifs: Gif[] = await postService.getGifByCategory(category);
    setGifs(gifs);
  };

  const handleGifClick = (gif: Gif) => {
    setGifUrl({ url: gif.gif, staticUrl: gif.img });
    setIsgifPickerShown(false);
  };

  return (
    <div className="gif-list">
      {gifs.length === 0 && <ContentLoader />}
      {gifs.length > 0 &&
        gifs.map((gif, idx) => {
          return (
            <div
              className="gif-container"
              key={idx}
              onClick={() => handleGifClick(gif)}
            >
              {isPlaying ? (
                <img src={gif.gif} alt="gif" loading="lazy" />
              ) : (
                <img src={gif.img} alt="img" loading="lazy" />
              )}
            </div>
          );
        })}
    </div>
  );
};
