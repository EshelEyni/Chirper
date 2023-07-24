import { FC, RefObject } from "react";
import { AiOutlineClose } from "react-icons/ai";
import { IoArrowBackSharp } from "react-icons/io5";
import { GifSearchBar } from "../../../Gif/GifSearchBar/GifSearchBar";
import "./GifPickerModalHeader.scss";
import { Gif } from "../../../../../../shared/interfaces/gif.interface";

type GifPickerModalHeaderProps = {
  gifs: Gif[];
  setGifs: (gifs: Gif[]) => void;
  searchTerm: string;
  setSearchTerm: (searchTerm: string) => void;
  SearchBarInputRef: RefObject<HTMLInputElement>;
  handleHeaderBtnClick: () => void;
};

export const GifPickerModalHeader: FC<GifPickerModalHeaderProps> = ({
  gifs,
  setGifs,
  searchTerm,
  setSearchTerm,
  SearchBarInputRef,
  handleHeaderBtnClick,
}) => {
  return (
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
  );
};
