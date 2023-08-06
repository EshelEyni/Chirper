import { FC } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../store/store";
import { AppDispatch } from "../../../store/types";
import { updateCurrNewPost } from "../../../store/actions/new-post.actions";
import { BtnRemoveContent } from "../../Btns/BtnRemoveContent/BtnRemoveContent";
import { SpinnerLoader } from "../../Loaders/SpinnerLoader/SpinnerLoader";
import { VideoPlayer } from "../VideoPlayer/VideoPlayer";
import "./VideoEdit.scss";
import { usePostEdit } from "../../../contexts/PostEditContext";
import { VideoPlayerProvider } from "../../../contexts/VideoPlayerContext";

export const VideoEdit: FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const { newPostType } = useSelector((state: RootState) => state.newPostModule);
  const { currNewPost, setIsVideoRemoved } = usePostEdit();
  if (!currNewPost || !currNewPost.video) return null;
  const { video } = currNewPost;
  const { url, isLoading } = video;

  function onRemoveVideo() {
    if (!currNewPost) return;
    dispatch(updateCurrNewPost({ ...currNewPost, video: null }, newPostType));
    setIsVideoRemoved(true);
  }

  return (
    <section className="video-edit">
      <div className="video-edit-player-container">
        <BtnRemoveContent onRemoveContent={onRemoveVideo} />
        {isLoading ? (
          <SpinnerLoader />
        ) : (
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          <VideoPlayerProvider>
            <VideoPlayer videoUrl={url} />
          </VideoPlayerProvider>
        )}
      </div>

      <p className="post-video-upload-msg">
        It will take a while to upload long videos. Make sure to keep your browser tab open to avoid
        upload interruptions.
      </p>
    </section>
  );
};
