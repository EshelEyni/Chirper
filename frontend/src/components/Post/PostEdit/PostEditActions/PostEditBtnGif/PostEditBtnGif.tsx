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

type PostEditBtnGifProps = {
  btn: TypeOfPostEditActionBtn;
};

export const PostEditBtnGif: FC<PostEditBtnGifProps> = ({ btn }) => {
  const { isPickerShown } = usePostEdit();
  const [gifs, setGifs] = useState<Gif[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const searchBarInputRef = useRef<HTMLInputElement>(null);
  const [openedModalName, setOpenedModalName] = useState("");

  function resetState() {
    setGifs([]);
    setSearchTerm("");
    if (!searchBarInputRef.current) return;
    searchBarInputRef.current.value = "";
  }

  function handleBtnCloseClick() {
    setOpenedModalName("");
    if (!gifs.length) return setOpenedModalName("");
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
      <Modal.OpenBtn modalName="gif-picker" onClickFn={handleBtnOpenClick} isCallInnerFn={false}>
        <button
          disabled={btn.isDisabled}
          className={"post-edit-action-btn" + (btn.isDisabled ? " disabled" : "")}
        >
          <div className="post-edit-action-icon-container">{btn.icon}</div>
        </button>
      </Modal.OpenBtn>

      <Modal.Window name="gif-picker" mainScreenMode="dark" mainScreenZIndex={100}>
        <header className="gif-picker-header">
          <Modal.CloseBtn onClickFn={handleBtnCloseClick} isCallInnerFn={false}>
            <button className="gif-picker-header-btn">
              {!gifs.length ? <AiOutlineClose /> : <IoArrowBackSharp />}
            </button>
          </Modal.CloseBtn>
          <GifSearchBar
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            setGifs={setGifs}
            SearchBarInputRef={searchBarInputRef}
          />
        </header>

        {gifs.length > 0 ? (
          <GifList onToggleElementVisibility={setOpenedModalName} gifs={gifs} />
        ) : (
          <SpinnerLoader />
        )}

        <GifCategoryList
          currCategory={searchTerm}
          setCurrCategory={setSearchTerm}
          setGifs={setGifs}
        />
      </Modal.Window>
    </Modal>
  );
};
