import { FC } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../store/store";
import { NewPost } from "../../../../../shared/interfaces/post.interface";
import { AppDispatch } from "../../../store/types";
import { updateCurrNewPost } from "../../../store/actions/new-post.actions";
import { BtnRemoveContent } from "../../Btns/BtnRemoveContent/BtnRemoveContent";
import { ContentLoader } from "../../Loaders/ContentLoader/ContentLoader";
import { VideoPlayer } from "../../Video/VideoPlayer/VideoPlayer";
import "./PostEditVideo.scss";

type PostEditVideoProps = {
  currNewPost: NewPost;
  setIsVideoRemoved: (isVideoRemoved: boolean) => void;
};

export const PostEditVideo: FC<PostEditVideoProps> = ({ currNewPost, setIsVideoRemoved }) => {
  const { newPostType } = useSelector((state: RootState) => state.newPostModule);

  const dispatch: AppDispatch = useDispatch();

  const onRemoveVideo = () => {
    dispatch(updateCurrNewPost({ ...currNewPost, video: null }, newPostType));
    setIsVideoRemoved(true);
  };

  return (
    <section className="post-edit-video">
      <div className="post-edit-video-player-container">
        <BtnRemoveContent onRemoveContent={onRemoveVideo} />
        {currNewPost.video?.isLoading ? (
          <ContentLoader />
        ) : (
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          <VideoPlayer videoUrl={currNewPost.video!.url} />
        )}
      </div>

      <p className="post-video-upload-msg">
        It will take a while to upload long videos. Make sure to keep your browser tab open to avoid
        upload interruptions.
      </p>
    </section>
  );
};
