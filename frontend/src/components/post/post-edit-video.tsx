import { FC } from "react";
import { BtnRemoveContent } from "../btns/btn-remove-content";
import { VideoPlayer } from "../video/video-player";
import { ContentLoader } from "../loaders/content-loader";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { NewPost } from "../../../../shared/interfaces/post.interface";

type PostEditVideoProps = {
  onRemoveVideo: () => void;
};

export const PostEditVideo: FC<PostEditVideoProps> = ({ onRemoveVideo }) => {
  const { newPost }: { newPost: NewPost } = useSelector((state: RootState) => state.postModule);

  return (
    <section className="post-edit-video">
      <div className="post-edit-video-player-container">
        <BtnRemoveContent onRemoveContent={onRemoveVideo} />
        {newPost.video?.isLoading ? (
          <ContentLoader />
        ) : (
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          <VideoPlayer videoUrl={newPost.video!.url} />
        )}
      </div>

      <p className="post-video-upload-msg">
        It will take a while to upload long videos. Make sure to keep your browser tab open to avoid
        upload interruptions.
      </p>
    </section>
  );
};
