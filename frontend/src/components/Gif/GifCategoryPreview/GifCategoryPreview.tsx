import { FC } from "react";
import { GifCategory } from "../../../../../shared/types/GIF";
import "./GifCategoryPreview.scss";

type GifCategoryPreviewProps = {
  gifCategory: GifCategory;
  isLast: boolean;
  handleCategoryClick: (category: string) => void;
};

export const GifCategoryPreview: FC<GifCategoryPreviewProps> = ({
  gifCategory,
  isLast,
  handleCategoryClick,
}) => {
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
};
