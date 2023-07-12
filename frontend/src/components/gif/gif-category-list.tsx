import { useState, useEffect } from "react";
import { ContentLoader } from "../loaders/content-loader";
import { Gif, GifCategory } from "../../../../shared/interfaces/gif.interface";
import { gifService } from "../../services/gif.service";

type GifEditProps = {
  currCategory: string;
  setCurrCategory: (category: string) => void;
  setGifs: (gifs: Gif[]) => void;
};

export const GifCategoryList: React.FC<GifEditProps> = ({
  currCategory,
  setCurrCategory,
  setGifs,
}) => {
  const [gifCategories, setGifCategories] = useState<GifCategory[]>([]);

  async function getGifCategories() {
    const gifs = await gifService.getGifCategroies();
    setGifCategories(gifs);
  }

  async function handleCategoryClick(category: string) {
    setCurrCategory(category);
    const gifs = await gifService.getGifByCategory(category);
    setGifs(gifs);
  }

  useEffect(() => {
    getGifCategories();
  }, []);

  return (
    <div className="gif-category-list">
      {!gifCategories.length && !currCategory && <ContentLoader />}
      {gifCategories.length > 0 &&
        gifCategories.map((gifCategory, idx) => {
          const isLast = idx === gifCategories.length - 1;
          return (
            <div
              className={"gif-category-preview" + (isLast ? " last" : "")}
              key={gifCategory.id}
              onClick={() => handleCategoryClick(gifCategory.name)}
            >
              <img src={gifCategory.imgUrl} alt="gif-category" loading="lazy" />
              <h5 className="gif-category-preview-title">{gifCategory.name}</h5>
            </div>
          );
        })}
    </div>
  );
};
