import { FC, useState } from "react";
import { FaPlay } from "react-icons/fa";
import { ContentLoader } from "../loaders/content-loader";
import { BtnRemoveContent } from "../btns/btn-remove-content";
import { AppDispatch } from "../../store/types";
import { useDispatch, useSelector } from "react-redux";
import { NewPost } from "../../../../shared/interfaces/post.interface";
import { RootState } from "../../store/store";
import { updateCurrNewPost } from "../../store/actions/new-post.actions";
import { BtnPlay } from "../btns/btn-play";

type GifEditProps = {
  currNewPost: NewPost;
};
export const GifEdit: FC<GifEditProps> = ({ currNewPost }) => {
  const dispatch: AppDispatch = useDispatch();
  const { newPostType } = useSelector((state: RootState) => state.newPostModule);

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  function onTogglePlay() {
    setIsPlaying(prevState => !prevState);
  }

  function onRemoveGif() {
    const newPost = { ...currNewPost, gif: null };
    dispatch(updateCurrNewPost(newPost, newPostType));
  }

  return (
    <>
      {isLoading && <ContentLoader />}
      <div className="gif-edit" style={{ visibility: isLoading ? "hidden" : "visible" }}>
        <BtnRemoveContent onRemoveContent={onRemoveGif} />
        <img
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          src={isPlaying ? currNewPost.gif!.url : currNewPost.gif!.staticUrl}
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
