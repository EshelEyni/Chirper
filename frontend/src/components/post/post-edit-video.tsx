import { FC } from "react";
import { BtnRemoveContent } from "../btns/btn-remove-content";
import { VideoPlayer } from "../video/video-player";
import { ContentLoader } from "../loaders/content-loader";

type PostEditVideoProps = {
  video: { url: string; isLoading: boolean; file: File | null };
  setVideo: (video: { url: string; isLoading: boolean; file: File } | null) => void;
  setIsVideoRemoved: (isVideoRemoved: boolean) => void;
};

export const PostEditVideo: FC<PostEditVideoProps> = ({ video, setVideo, setIsVideoRemoved }) => {
  const onRemoveVideo = () => {
    setVideo(null);
    setIsVideoRemoved(true);
  };

  return (
    <section className="post-edit-video">
      <div className="post-edit-video-player-container">
        <BtnRemoveContent onRemoveContent={onRemoveVideo} />
        {video.isLoading ? <ContentLoader /> : <VideoPlayer videoUrl={video.url} />}
      </div>

      <p className="post-video-upload-msg">
        It will take a while to upload long videos. Make sure to keep your browser tab open to avoid
        upload interruptions.
      </p>
    </section>
  );
};
