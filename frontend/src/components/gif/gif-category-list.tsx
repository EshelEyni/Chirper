import { useState, useEffect } from "react";
import { ContentLoader } from "../loaders/content-loader";
import { Gif, GifCategory } from "../../../../shared/interfaces/gif.interface";
import { gifService } from "../../services/gif.service";

interface GifEditProps {
  currCategory: string;
  setCurrCategory: (category: string) => void;
  setGifs: (gifs: Gif[]) => void;
}

export const GifCategoryList: React.FC<GifEditProps> = ({
  currCategory,
  setCurrCategory,
  setGifs,
}) => {
  const [gifCategories, setGifCategories] = useState<GifCategory[]>([]);

  useEffect(() => {
    getGifCategories();
  }, []);

  const getGifCategories = async () => {
    const gifs = await gifService.getGifCategroies();
    setGifCategories(gifs);
  };

  const handleCategoryClick = async (category: string) => {
    setCurrCategory(category);
    const gifs = await gifService.getGifByCategory(category);
    setGifs(gifs);
  };

  return (
    <div className="gif-category-list">
      {gifCategories.length === 0 && !currCategory && <ContentLoader />}
      {gifCategories.length > 0 &&
        gifCategories.map((gifCategory, idx) => {
          return (
            <div
              className={"gif-category-preview" + (idx === gifCategories.length - 1 ? " last" : "")}
              key={gifCategory.id}
              onClick={() => handleCategoryClick(gifCategory.name)}
            >
              <img src={gifCategory.imgUrl} alt="gif-category" />
              <h5 className="gif-category-preview-title">{gifCategory.name}</h5>
            </div>
          );
        })}
    </div>
  );
};
