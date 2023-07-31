import { FC, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../store/store";
import { updateCurrNewPost } from "../../../store/actions/new-post.actions";
import { Gif } from "../../../../../shared/interfaces/gif.interface";
import { AppDispatch } from "../../../store/types";
import { UIElement } from "../../Post/PostEditActions/PostEditActions/PostEditActions";
import { ContentLoader } from "../../Loaders/ContentLoader/ContentLoader";
import { BtnSwitchPlay } from "../../Btns/BtnSwitchPlay/BtnSwitchPlay";
import { GifPreview } from "../GifPreview/GifPreview";
import "./GifList.scss";
import { usePostEdit } from "../../../contexts/PostEditContext";

interface GifListProps {
  gifs: Gif[];
  onToggleElementVisibility: (element: UIElement) => void;
}

export const GifList: FC<GifListProps> = ({ gifs, onToggleElementVisibility }) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const dispatch: AppDispatch = useDispatch();
  const { newPostType } = useSelector((state: RootState) => state.newPostModule);
  const { currNewPost } = usePostEdit();

  function handleGifClick(gif: Gif) {
    if (!currNewPost) return;
    const newPost = { ...currNewPost, gif };
    dispatch(updateCurrNewPost(newPost, newPostType));
    onToggleElementVisibility("gifPicker");
  }

  function handleChange() {
    setIsPlaying(prev => !prev);
  }

  return (
    <div className="gif-list">
      <BtnSwitchPlay isPlaying={isPlaying} handleChange={handleChange} />
      <ul className="gif-list-main-container">
        {gifs.length === 0 && <ContentLoader />}
        {gifs.length > 0 &&
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
          })}
      </ul>
    </div>
  );
};
