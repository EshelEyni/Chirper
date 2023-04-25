import { Fragment, useState, useEffect } from "react";
import { AiOutlineClose } from "react-icons/ai";
import { postService } from "../../services/post.service";
import { GifCategoryList } from "../gif/gif-category-list";
import { GifList } from "../gif/gif-list";
import { IoArrowBackSharp } from "react-icons/io5";
import { GifUrl } from "../../../../shared/interfaces/gif.interface";

interface GifPickerProps {
  gifUrl: GifUrl | null;
  setgifUrl: (url: GifUrl | null) => void;
  setIsgifPickerShown: (isShown: boolean) => void;
}

export const GifPickerModal: React.FC<GifPickerProps> = ({
  gifUrl,
  setgifUrl,
  setIsgifPickerShown,
}) => {
  const [gifs, setgifs] = useState<any[]>([]);
  const [currCategory, setCurrCategory] = useState<string>("agree");

  useEffect(() => {}, []);

  const getgifs = async (searchTerm: string) => {
    const gifs = await postService.getGifsBySearchTerm(searchTerm);
    console.log(gifs);
    setgifs(gifs);
  };

  const handleHeaderBtnClick = () => {
    if (!currCategory && !gifs.length) {
      setIsgifPickerShown(false);
    } else {
      setCurrCategory("");
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
            {!currCategory && !gifs.length ? (
              <AiOutlineClose />
            ) : (
              <IoArrowBackSharp />
            )}
          </button>
        </header>

        {currCategory ? (
          <GifList
            category={currCategory}
            setGifUrl={setgifUrl}
            setIsgifPickerShown={setIsgifPickerShown}
          />
        ) : (
          <GifCategoryList
            currCategory={currCategory}
            setCurrCategory={setCurrCategory}
          />
        )}
      </div>
    </Fragment>
  );
};
