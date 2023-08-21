import { FC, useState, useRef, useEffect } from "react";
import { Modal } from "../../../../Modals/Modal/Modal";
import { PostEditActionBtn as TypeOfPostEditActionBtn } from "../PostEditActions/PostEditActions";
import { GifCategoryList } from "../../../../Gif/GifCategoryList/GifCategoryList";
import { SpinnerLoader } from "../../../../Loaders/SpinnerLoader/SpinnerLoader";
import { GifList } from "../../../../Gif/GifList/GifList";
import { Gif } from "../../../../../../../shared/interfaces/gif.interface";
import { AiOutlineClose } from "react-icons/ai";
import { IoArrowBackSharp } from "react-icons/io5";
import { GifSearchBar } from "../../../../Gif/GifSearchBar/GifSearchBar";
import "./PostEditBtnGif.scss";
import { usePostEdit } from "../../../../../contexts/PostEditContext";
import { useQueryGifs } from "../../../../../hooks/reactQuery/gif/useQueryGifs";
import { ErrorMsg } from "../../../../Msg/ErrorMsg/ErrorMsg";

type PostEditBtnGifProps = {
  btn: TypeOfPostEditActionBtn;
};

export const PostEditBtnGif: FC<PostEditBtnGifProps> = ({ btn }) => {
  const { isPickerShown } = usePostEdit();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const searchBarInputRef = useRef<HTMLInputElement>(null);
  const [openedModalName, setOpenedModalName] = useState("");

  const { gifs, isLoading, isSuccess, isError, isEmpty } = useQueryGifs(searchTerm);

  function resetState() {
    setSearchTerm("");
    if (!searchBarInputRef.current) return;
    searchBarInputRef.current.value = "";
  }

  function handleBtnCloseClick() {
    if (searchTerm) return setSearchTerm("");
    setOpenedModalName("");
    resetState();
  }

  function handleBtnOpenClick() {
    if (!isPickerShown) return;
    setOpenedModalName("gif-picker");
  }

  useEffect(() => {
    resetState();
  }, [openedModalName]);

  return (
    <Modal externalStateControl={{ openedModalName, setOpenedModalName }}>
      <button
        disabled={btn.isDisabled}
        className={"post-edit-action-btn" + (btn.isDisabled ? " disabled" : "")}
        onClick={handleBtnOpenClick}
      >
        <div className="post-edit-action-icon-container">{btn.icon}</div>
      </button>

      <Modal.Window name="gif-picker" mainScreenMode="dark" mainScreenZIndex={100}>
        <header className="gif-picker-header">
          <button className="gif-picker-header-btn" onClick={handleBtnCloseClick}>
            {searchTerm ? <IoArrowBackSharp /> : <AiOutlineClose />}
          </button>
          <GifSearchBar
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            SearchBarInputRef={searchBarInputRef}
          />
        </header>

        {searchTerm && (
          <>
            {isLoading && <SpinnerLoader />}
            {isSuccess && !isEmpty && (
              <GifList onToggleElementVisibility={setOpenedModalName} gifs={gifs as Gif[]} />
            )}
            {isSuccess && isEmpty && <p className="no-res-msg">no gifs to show</p>}
            {isError && <ErrorMsg msg={"Couldn't get gifs. Please try again later."} />}
          </>
        )}

        {!searchTerm && <GifCategoryList setCurrCategory={setSearchTerm} />}
      </Modal.Window>
    </Modal>
  );
};
