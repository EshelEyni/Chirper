import { GifCategory } from "../../../../../shared/interfaces/gif.interface";
import { SpinnerLoader } from "../../Loaders/SpinnerLoader/SpinnerLoader";
import "./GifCategoryList.scss";
import { GifCategoryPreview } from "../GifCategoryPreview/GifCategoryPreview";
import { useQueryGifCategories } from "../../../hooks/reactQuery/gif/useQueryGifCategories";
import { ErrorMsg } from "../../Msg/ErrorMsg/ErrorMsg";

type GifEditProps = {
  setCurrCategory: (category: string) => void;
};

export const GifCategoryList: React.FC<GifEditProps> = ({ setCurrCategory }) => {
  const { gifCategories, isLoading, isSuccess, isError, isEmpty } = useQueryGifCategories();

  async function handleCategoryClick(category: string) {
    setCurrCategory(category);
  }

  return (
    <div className="gif-category-list">
      {isLoading && <SpinnerLoader />}
      {isSuccess &&
        !isEmpty &&
        (gifCategories as GifCategory[]).map((gifCategory, idx, arr) => {
          const isLast = idx === arr.length - 1;
          return (
            <GifCategoryPreview
              key={gifCategory.id}
              gifCategory={gifCategory}
              isLast={isLast}
              handleCategoryClick={handleCategoryClick}
            />
          );
        })}

      {isSuccess && isEmpty && <p className="no-res-msg">no categories to show</p>}
      {isError && <ErrorMsg msg={"Couldn't get gif categories. Please try again later."} />}
    </div>
  );
};
