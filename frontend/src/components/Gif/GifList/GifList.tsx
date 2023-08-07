import { FC, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../store/store";
import { Gif } from "../../../../../shared/interfaces/gif.interface";
import { AppDispatch } from "../../../store/types";
import { SpinnerLoader } from "../../Loaders/SpinnerLoader/SpinnerLoader";
import { BtnSwitchPlay } from "../../Btns/BtnSwitchPlay/BtnSwitchPlay";
import { GifPreview } from "../GifPreview/GifPreview";
import "./GifList.scss";
import { usePostEdit } from "../../../contexts/PostEditContext";
import { UIElement } from "../../Post/PostEdit/PostEditActions/PostEditActions/PostEditActions";
import { updateNewPost } from "../../../store/slices/postEditSlice";

interface GifListProps {
  gifs: Gif[];
  onToggleElementVisibility: (element: UIElement) => void;
}

export const GifList: FC<GifListProps> = ({ gifs, onToggleElementVisibility }) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const dispatch: AppDispatch = useDispatch();
  const { newPostType } = useSelector((state: RootState) => state.postEdit);
  const { currNewPost } = usePostEdit();

  function handleGifClick(gif: Gif) {
    if (!currNewPost) return;
    dispatch(updateNewPost({ newPost: { ...currNewPost, gif }, newPostType }));
    onToggleElementVisibility("gifPicker");
  }

  function handleChange() {
    setIsPlaying(prev => !prev);
  }

  return (
    <div className="gif-list">
      <BtnSwitchPlay isPlaying={isPlaying} handleChange={handleChange} />
      <ul className="gif-list-main-container">
        {gifs.length > 0 ? (
          gifs.map((gif, idx) => {
            const ratio = gif.size.width / gif.size.height;
            const width = 120 * ratio + "px";
            return (
              <GifPreview
                key={gif.id}
                gif={gif}
                idx={idx}
                width={width}
                isPlaying={isPlaying}
                handleGifClick={handleGifClick}
              />
            );
          })
        ) : (
          <SpinnerLoader />
        )}
      </ul>
    </div>
  );
};
