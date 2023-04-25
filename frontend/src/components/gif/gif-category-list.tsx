import { Gif } from "@giphy/react-components";
import { postService } from "../../services/post.service";
import { useState, useEffect } from "react";
import { ContentLoader } from "../loaders/content-loader";
import { IGif } from "@giphy/js-types";
import { GifList } from "./gif-list";
import { GifHeader } from "../../../../shared/interfaces/gif.interface";

export const GifCategoryList: React.FC = () => {
  const [gifHeaders, setGifHeaders] = useState<GifHeader[]>([]);
  const [currCategory, setCurrCategory] = useState<string>("");
  useEffect(() => {
    getGifHeaders();
  }, []);

  const getGifHeaders = async () => {
    const gifs = await postService.getGifsHeaders();
    setGifHeaders(gifs);
  };

  return (
    <div className="gif-category-list">
      {gifHeaders.length === 0 && !currCategory && <ContentLoader />}
      {gifHeaders.length > 0 &&
        !currCategory &&
        gifHeaders
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((gifHeader, idx) => {
            const { gif } = gifHeader;
            return (
              <div
                className={
                  "gif-category-preview" +
                  (idx === gifHeaders.length - 1 ? " last" : "")
                }
                key={gifHeader._id}
                onClick={() => setCurrCategory(gifHeader.name)}
              >
                <img src={gif.images.original_still.url} alt="" />
                <h5 className="gif-category-preview-title">{gifHeader.name}</h5>
              </div>
            );
          })}
      {currCategory && <GifList category={currCategory} />}
    </div>
  );
};
