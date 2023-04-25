import { postService } from "../../services/post.service";
import { useState, useEffect } from "react";
import { ContentLoader } from "../loaders/content-loader";
import { GifList } from "./gif-list";
import { GifCategory } from "../../../../shared/interfaces/gif.interface";

interface GifCategoryListProps {
  currCategory: string;
  setCurrCategory: (category: string) => void;
}

export const GifCategoryList: React.FC<GifCategoryListProps> = ({
  currCategory,
  setCurrCategory,
}) => {
  const [gifCategories, setGifCategories] = useState<GifCategory[]>([]);

  useEffect(() => {
    if (!gifCategories.length) getGifHeaders();

    return () => {
      setGifCategories([]);
    };
  }, []);

  const getGifHeaders = async () => {
    const gifs = await postService.getGifCategroies();
    setGifCategories(gifs);
  };

  return (
    <div className="gif-category-list">
      {gifCategories.length === 0 && !currCategory && <ContentLoader />}
      {gifCategories.length > 0 &&
        gifCategories.map((gifCategory, idx) => {
          return (
            <div
              className={
                "gif-category-preview" +
                (idx === gifCategories.length - 1 ? " last" : "")
              }
              key={gifCategory._id}
              onClick={() => setCurrCategory(gifCategory.name)}
            >
              <img src={gifCategory.img} alt="gif-category" />
              <h5 className="gif-category-preview-title">{gifCategory.name}</h5>
            </div>
          );
        })}
    </div>
  );
};
