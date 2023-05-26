import { FC, useRef } from "react";
import { BtnRemoveContent } from "../btns/btn-remove-content";
import { VideoPlayer } from "../video/video-player";
import { ContentLoader } from "../loaders/content-loader";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { NewPost } from "../../../../shared/interfaces/post.interface";
import { AppDispatch } from "../../store/types";
import { setNewPost } from "../../store/actions/post.actions";
import { NewPostType } from "../../store/reducers/post.reducer";

type PostEditVideoProps = {
  setIsVideoRemoved: (isVideoRemoved: boolean) => void;
};

export const PostEditVideo: FC<PostEditVideoProps> = ({ setIsVideoRemoved }) => {
  const {
    newPost,
    sideBarNewPost,
    newPostType,
  }: { newPost: NewPost; sideBarNewPost: NewPost; newPostType: NewPostType } = useSelector(
    (state: RootState) => state.postModule
  );

  const newPostTypeRef = useRef(newPostType);
  const currPost = newPostTypeRef.current === "side-bar-post" ? sideBarNewPost : newPost;
  const dispatch: AppDispatch = useDispatch();

  const onRemoveVideo = () => {
    dispatch(setNewPost({ ...currPost, video: null }, newPostType));
    setIsVideoRemoved(true);
  };

  return (
    <section className="post-edit-video">
      <div className="post-edit-video-player-container">
        <BtnRemoveContent onRemoveContent={onRemoveVideo} />
        {currPost.video?.isLoading ? (
          <ContentLoader />
        ) : (
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          <VideoPlayer videoUrl={currPost.video!.url} />
        )}
      </div>

      <p className="post-video-upload-msg">
        It will take a while to upload long videos. Make sure to keep your browser tab open to avoid
        upload interruptions.
      </p>
    </section>
  );
};
