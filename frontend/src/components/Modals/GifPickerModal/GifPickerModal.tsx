import { useState, useRef } from "react";
import { NewPost } from "../../../../../shared/interfaces/post.interface";
import { Gif } from "../../../../../shared/interfaces/gif.interface";
import { GifList } from "../../Gif/GifList/GifList";
import { GifCategoryList } from "../../Gif/GifCategoryList/GifCategoryList";
import { ContentLoader } from "../../Loaders/ContentLoader/ContentLoader";
import { UIElement } from "../../Post/PostEditActions/PostEditActions/PostEditActions";
import { Modal } from "../Modal/Modal";
import { GifPickerModalHeader } from "./GifPickerModalHeader/GifPickerModalHeader";

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

  function handleHeaderBtnClick() {
    if (!gifs.length) {
      onToggleElementVisibility("gifPicker");
    } else {
      setGifs([]);
      setSearchTerm("");
      SearchBarInputRef.current!.value = "";
    }
  }

  return (
    <Modal
      className="gif-picker"
      mainScreenMode="dark"
      onClickMainScreen={() => onToggleElementVisibility("gifPicker")}
    >
      <GifPickerModalHeader
        gifs={gifs}
        setGifs={setGifs}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        SearchBarInputRef={SearchBarInputRef}
        handleHeaderBtnClick={handleHeaderBtnClick}
      />

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
