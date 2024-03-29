import { FC } from "react";
import { useDispatch } from "react-redux";
import { BtnRemoveContent } from "../../Btns/BtnRemoveContent/BtnRemoveContent";
import { SpinnerLoader } from "../../Loaders/SpinnerLoader/SpinnerLoader";
import { VideoPlayer } from "../VideoPlayer/VideoPlayer";
import "./VideoEdit.scss";
import { usePostEdit } from "../../../contexts/PostEditContext";
import { VideoPlayerProvider } from "../../../contexts/VideoPlayerContext";
import { updateNewPost } from "../../../store/slices/postEditSlice";
import { AppDispatch } from "../../../types/app";

export const VideoEdit: FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const { currNewPost, setIsVideoRemoved } = usePostEdit();
  if (!currNewPost || !currNewPost.video) return null;
  const { video } = currNewPost;
  const { url, isLoading } = video;

  function onRemoveVideo() {
    if (!currNewPost) return;
    dispatch(updateNewPost({ newPost: { ...currNewPost, video: null } }));
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
