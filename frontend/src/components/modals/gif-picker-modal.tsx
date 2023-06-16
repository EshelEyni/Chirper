import { Fragment, useState, useRef } from "react";
import { AiOutlineClose } from "react-icons/ai";
import { GifCategoryList } from "../gif/gif-category-list";
import { GifList } from "../gif/gif-list";
import { IoArrowBackSharp } from "react-icons/io5";
import { Gif } from "../../../../shared/interfaces/gif.interface";
import { GifSearchBar } from "../gif/gif-search-bar";
import { ContentLoader } from "../loaders/content-loader";
import { UIElement } from "../post/post-edit-actions";
import { NewPost } from "../../../../shared/interfaces/post.interface";

interface GifPickerProps {
  currNewPost: NewPost;
  onToggleElementVisibility: (element: UIElement) => void;
}

export const GifPickerModal: React.FC<GifPickerProps> = ({
  currNewPost,
  onToggleElementVisibility,
}) => {
  const [gifs, setGifs] = useState<Gif[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const SearchBarInputRef = useRef<HTMLInputElement>(null);

  const handleHeaderBtnClick = () => {
    if (!gifs.length) {
      onToggleElementVisibility("gifPicker");
    } else {
      setGifs([]);
      setSearchTerm("");
      SearchBarInputRef.current!.value = "";
    }
  };

  return (
    <Fragment>
      <div className="main-screen dark" onClick={() => onToggleElementVisibility("gifPicker")} />
      <div className="gif-picker">
        <header className="gif-picker-header">
          <button className="gif-picker-header-btn" onClick={handleHeaderBtnClick}>
            {!gifs.length ? <AiOutlineClose /> : <IoArrowBackSharp />}
          </button>
          <GifSearchBar
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            setGifs={setGifs}
            SearchBarInputRef={SearchBarInputRef}
          />
        </header>

        {gifs.length > 0 ? (
          <GifList
            currNewPost={currNewPost}
            onToggleElementVisibility={onToggleElementVisibility}
            gifs={gifs}
          />
        ) : (
          <ContentLoader />
        )}

        {!searchTerm && (
          <GifCategoryList
            currCategory={searchTerm}
            setCurrCategory={setSearchTerm}
            setGifs={setGifs}
          />
        )}
      </div>
    </Fragment>
  );
};
