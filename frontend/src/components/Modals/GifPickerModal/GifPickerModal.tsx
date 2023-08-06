import { useState, useRef } from "react";
import { Gif } from "../../../../../shared/interfaces/gif.interface";
import { GifList } from "../../Gif/GifList/GifList";
import { GifCategoryList } from "../../Gif/GifCategoryList/GifCategoryList";
import { SpinnerLoader } from "../../Loaders/SpinnerLoader/SpinnerLoader";
import { Modal } from "../Modal/Modal";
import { GifPickerModalHeader } from "./GifPickerModalHeader/GifPickerModalHeader";
import { UIElement } from "../../Post/PostEdit/PostEditActions/PostEditActions/PostEditActions";

interface GifPickerProps {
  onToggleElementVisibility: (element: UIElement) => void;
}

export const GifPickerModal: React.FC<GifPickerProps> = ({ onToggleElementVisibility }) => {
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
        <GifList onToggleElementVisibility={onToggleElementVisibility} gifs={gifs} />
      ) : (
        <SpinnerLoader />
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
