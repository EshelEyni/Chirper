import { Fragment, useState, useEffect, useRef } from "react";
import { AiOutlineClose } from "react-icons/ai";
import { postService } from "../../services/post.service";
import { GifCategoryList } from "../gif/gif-category-list";
import { GifList } from "../gif/gif-list";
import { IoArrowBackSharp } from "react-icons/io5";
import { Gif, GifUrl } from "../../../../shared/interfaces/gif.interface";
import { GifSearchBar } from "../gif/gif-search-bar";
import { ContentLoader } from "../loaders/content-loader";

interface GifPickerProps {
  gifUrl: GifUrl | null;
  setGifUrl: (url: GifUrl | null) => void;
  setIsgifPickerShown: (isShown: boolean) => void;
}

export const GifPickerModal: React.FC<GifPickerProps> = ({
  gifUrl,
  setGifUrl,
  setIsgifPickerShown,
}) => {
  const [gifs, setGifs] = useState<Gif[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const SearchBarInputRef = useRef<HTMLInputElement>(null);

  const handleHeaderBtnClick = () => {
    if (!gifs.length) {
      setIsgifPickerShown(false);
    } else {
      setGifs([]);
      setSearchTerm("");
      SearchBarInputRef.current!.value = "";
    }
  };

  return (
    <Fragment>
      <div
        className="main-screen dark"
        onClick={() => setIsgifPickerShown(false)}
      ></div>
      <div className="gif-picker">
        <header className="gif-picker-header">
          <button
            className="gif-picker-header-btn"
            onClick={handleHeaderBtnClick}
          >
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
            setGifUrl={setGifUrl}
            setIsgifPickerShown={setIsgifPickerShown}
            gifs={gifs}
            setGifs={setGifs}
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
