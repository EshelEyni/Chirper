import { FC } from "react";
import { BtnRemoveContent } from "../btns/btn-remove-content";
import { VideoPlayer } from "../video/video-player";
import { ContentLoader } from "../loaders/content-loader";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { NewPost } from "../../../../shared/interfaces/post.interface";
import { AppDispatch } from "../../store/types";
import { updateCurrNewPost } from "../../store/actions/post.actions";

type PostEditVideoProps = {
  currNewPost: NewPost;
  setIsVideoRemoved: (isVideoRemoved: boolean) => void;
};

export const PostEditVideo: FC<PostEditVideoProps> = ({ currNewPost, setIsVideoRemoved }) => {
  const { newPostType } = useSelector((state: RootState) => state.postModule.newPostState);

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
