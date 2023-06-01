import { FC, useState } from "react";
import { FaPlay } from "react-icons/fa";
import { ContentLoader } from "../loaders/content-loader";
import { Fragment } from "react";
import { BtnRemoveContent } from "../btns/btn-remove-content";
import { AppDispatch } from "../../store/types";
import { useDispatch, useSelector } from "react-redux";
import { NewPost } from "../../../../shared/interfaces/post.interface";
import { RootState } from "../../store/store";
import { updateCurrNewPost } from "../../store/actions/new-post.actions";

type GifEditProps = {
  currNewPost: NewPost;
};
export const GifEdit: FC<GifEditProps> = ({ currNewPost }) => {
  const dispatch: AppDispatch = useDispatch();
  const { newPostType } = useSelector((state: RootState) => state.newPostModule);

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const onImageLoad = () => {
    setIsLoading(false);
  };

  const onTogglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const onRemoveGif = () => {
    const newPost = { ...currNewPost, gif: null };
    dispatch(updateCurrNewPost(newPost, newPostType));
  };

  return (
    <Fragment>
      {isLoading && <ContentLoader />}
      <div className="gif-edit" style={{ visibility: isLoading ? "hidden" : "visible" }}>
        <BtnRemoveContent onRemoveContent={onRemoveGif} />
        <img
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          src={isPlaying ? currNewPost.gif!.url : currNewPost.gif!.staticUrl}
          alt="gif"
          onClick={onTogglePlay}
          onLoad={onImageLoad}
        />
        {!isPlaying && (
          <button className="btn-play" onClick={onTogglePlay}>
            <div className="btn-play-icon-container">
              <FaPlay className="play-icon" />
            </div>
          </button>
        )}
        <span className="gif-title">GIF</span>
      </div>
    </Fragment>
  );
};
