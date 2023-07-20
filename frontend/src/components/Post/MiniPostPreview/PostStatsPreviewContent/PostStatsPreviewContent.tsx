import { Post } from "../../../../../../shared/interfaces/post.interface";
import { GifDisplay } from "../../../Gif/GifDisplay/GifDisplay";
import { VideoPlayer } from "../../../Video/VideoPlayer/VideoPlayer";
import { PostImg } from "../../PostImg/PostImg";
import { PostPreviewHeader } from "../../PostPreviewHeader/PostPreviewHeader";

type PostStatsPreviewContentProps = {
  post: Post;
};

export const PostStatsPreviewContent: React.FC<PostStatsPreviewContentProps> = ({ post }) => {
  return (
    <div className="post-preview-main-container">
      <PostPreviewHeader post={post} isMiniPreview={true} />
      <div className="post-preview-body">
        <p className="post-preview-text">{post.text}</p>
        {post.imgs && post.imgs.length > 0 && (
          <PostImg
            imgs={post.imgs.map((img, idx) => {
              return { url: img.url, sortOrder: idx };
            })}
          />
        )}
        {post.videoUrl && <VideoPlayer videoUrl={post.videoUrl} isCustomControls={true} />}
        {post.gif && <GifDisplay gif={post.gif} isAutoPlay={false} />}
        {post.poll && <span className="link-to-poll">Show this poll</span>}
      </div>
    </div>
  );
};
