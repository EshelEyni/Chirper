import { FC, useState } from "react";
import { useDispatch } from "react-redux";
import { SpinnerLoader } from "../../Loaders/SpinnerLoader/SpinnerLoader";
import { BtnRemoveContent } from "../../Btns/BtnRemoveContent/BtnRemoveContent";
import "./GifEdit.scss";
import { usePostEdit } from "../../../contexts/PostEditContext";
import { updateNewPost } from "../../../store/slices/postEditSlice";
import { AppDispatch } from "../../../types/app";
import { Button } from "../../App/Button/Button";
import { FaPlay } from "react-icons/fa";

export const GifEdit: FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const { currNewPost } = usePostEdit();
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  if (!currNewPost || !currNewPost.gif) return null;

  function onTogglePlay() {
    setIsPlaying(prev => !prev);
  }

  function onRemoveGif() {
    if (!currNewPost) return;
    dispatch(updateNewPost({ newPost: { ...currNewPost, gif: null } }));
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
        {!isPlaying && (
          <Button className="btn-play" onClickFn={onTogglePlay}>
            <div className="btn-play-icon-container">
              <FaPlay className="play-icon" />
            </div>
          </Button>
        )}
        <span className="gif-title">GIF</span>
      </div>
    </>
  );
};
