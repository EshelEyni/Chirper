import { FC, useRef, useState } from "react";
import { FaPlay } from "react-icons/fa";
import { ContentLoader } from "../loaders/content-loader";
import { Fragment } from "react";
import { BtnRemoveContent } from "../btns/btn-remove-content";
import { AppDispatch } from "../../store/types";
import { useDispatch, useSelector } from "react-redux";
import { NewPost } from "../../../../shared/interfaces/post.interface";
import { RootState } from "../../store/store";
import { setNewPost } from "../../store/actions/post.actions";
import { NewPostType } from "../../store/reducers/post.reducer";

export const GifEdit: FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const {
    newPost,
    sideBarNewPost,
    newPostType,
  }: { newPost: NewPost; sideBarNewPost: NewPost; newPostType: NewPostType } = useSelector(
    (state: RootState) => state.postModule
  );

  const newPostTypeRef = useRef(newPostType);
  const currPost = newPostTypeRef.current === "side-bar-post" ? sideBarNewPost : newPost;

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const onImageLoad = () => {
    setIsLoading(false);
  };

  const onTogglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const onRemoveGif = () => {
    dispatch(setNewPost({ ...currPost, gif: null }, newPostType));
  };

  return (
    <Fragment>
      {isLoading && <ContentLoader />}
      <div className="gif-edit" style={{ visibility: isLoading ? "hidden" : "visible" }}>
        <BtnRemoveContent onRemoveContent={onRemoveGif} />
        <img
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          src={isPlaying ? currPost.gif!.url : currPost.gif!.staticUrl}
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
