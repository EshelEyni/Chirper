import { FC } from "react";
import { BtnRemoveContent } from "../btns/btn-remove-content";
import ReactPlayer from "react-player";

type PostEditVideoProps = {
  video: { url: string; isLoading: boolean; file: File };
  setVideo: (video: { url: string; isLoading: boolean; file: File } | null) => void;
};

export const PostEditVideo: FC<PostEditVideoProps> = ({ video, setVideo }) => {
  const onRemoveVideo = () => {
    setVideo(null);
  };

  return (
    <section className="post-video-edit">
      <div className="post-video-container">
        <BtnRemoveContent onRemoveContent={onRemoveVideo} />
        <div className="react-player-container">
          <ReactPlayer
            className="react-player"
            url={video.url}
            controls={true}
            playing={false}
            width="100%"
            height="100%"
            muted={true}
          />
        </div>
      </div>

      <p className="post-video-upload-msg">
        It will take a while to upload long videos. Make sure to keep your browser tab open to avoid
        upload interruptions.
      </p>
    </section>
  );
};
