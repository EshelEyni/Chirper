import { useState, useRef } from "react";
import { AiOutlineClose } from "react-icons/ai";
import { NewPost } from "../../../../../shared/interfaces/post.interface";
import { Gif } from "../../../../../shared/interfaces/gif.interface";
import { IoArrowBackSharp } from "react-icons/io5";
import "./GifPickerModal.scss";
import { GifSearchBar } from "../../Gif/GifSearchBar/GifSearchBar";
import { GifList } from "../../Gif/GifList/GifList";
import { GifCategoryList } from "../../Gif/GifCategoryList/GifCategoryList";
import { ContentLoader } from "../../Loaders/ContentLoader/ContentLoader";
import { UIElement } from "../../Post/PostEditActions/PostEditActions/PostEditActions";
import { Modal } from "../Modal/Modal";

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
    <Modal
      className="gif-picker"
      mainScreenMode="dark"
      onClickMainScreen={() => onToggleElementVisibility("gifPicker")}
    >
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
    </Modal>
  );
};
