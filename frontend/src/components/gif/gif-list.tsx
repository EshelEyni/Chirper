import { Gif } from "@giphy/react-components";
import { IGif } from "@giphy/js-types";
import { useState, useEffect } from "react";
import { postService } from "../../services/post.service";
import { ContentLoader } from "../loaders/content-loader";

interface GifListProps {
  category: string;
}

export const GifList: React.FC<GifListProps> = ({ category }) => {
  const [gifs, setGifs] = useState<IGif[]>([]);

  useEffect(() => {
    if (category && !gifs.length) getGifsByCategory();

    return () => {
      setGifs([]);
    };
  }, []);

  const getGifsByCategory = async () => {
    const gifs = await postService.getGifByCategory(category);
    console.log(gifs);
    setGifs(gifs);
  };

  return (
    <div className="gif-details">
      {gifs.length === 0 && <ContentLoader />}
      {gifs.length > 0 &&
        gifs.map((gif) => {
          return (
            <div className="gif-container" key={gif.id}>
              <Gif gif={gif} width={200} />
            </div>
          );
        })}
    </div>
  );
};
