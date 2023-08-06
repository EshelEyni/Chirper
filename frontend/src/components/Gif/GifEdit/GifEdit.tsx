import { FC, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../../../store/types";
import { RootState } from "../../../store/store";
import { updateCurrNewPost } from "../../../store/actions/new-post.actions";
import { SpinnerLoader } from "../../Loaders/SpinnerLoader/SpinnerLoader";
import { BtnRemoveContent } from "../../Btns/BtnRemoveContent/BtnRemoveContent";
import { BtnPlay } from "../../Btns/BtnPlay/BtnPlay";
import "./GifEdit.scss";
import { usePostEdit } from "../../../contexts/PostEditContext";

export const GifEdit: FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const { newPostType } = useSelector((state: RootState) => state.newPostModule);
  const { currNewPost } = usePostEdit();
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  if (!currNewPost || !currNewPost.gif) return null;

  function onTogglePlay() {
    setIsPlaying(prev => !prev);
  }

  function onRemoveGif() {
    if (!currNewPost) return;
    const newPost = { ...currNewPost, gif: null };
    dispatch(updateCurrNewPost(newPost, newPostType));
  }

  return (
    <>
      {isLoading && <SpinnerLoader />}
      <div className="gif-edit" style={{ visibility: isLoading ? "hidden" : "visible" }}>
        <BtnRemoveContent onRemoveContent={onRemoveGif} />
        <img
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          src={isPlaying ? currNewPost.gif!.url : currNewPost.gif!.staticUrl}
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          alt={currNewPost.gif!.description}
          onClick={onTogglePlay}
          onLoad={() => setIsLoading(false)}
        />
        {!isPlaying && <BtnPlay onTogglePlay={onTogglePlay} />}
        <span className="gif-title">GIF</span>
      </div>
    </>
  );
};
