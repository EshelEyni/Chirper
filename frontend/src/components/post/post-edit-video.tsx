import { FC } from "react";

type PostEditVideoProps = {
  video: { url: string; isLoading: boolean; file: File };
  setVideo: (video: { url: string; isLoading: boolean; file: File }) => void;
};

export const PostEditVideo: FC<PostEditVideoProps> = ({ video, setVideo }) => {
  return (
    <div>
      <h1>PostEditVideo</h1>
      <video
        src={video.isLoading ? URL.createObjectURL(video.file) : video.url}
        controls={true}
        autoPlay={true}
      ></video>
    </div>
  );
};
