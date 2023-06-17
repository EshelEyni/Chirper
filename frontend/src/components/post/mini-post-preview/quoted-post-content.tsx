import { QuotedPost } from "../../../../../shared/interfaces/post.interface";
import { GifDisplay } from "../../gif/gif-display";
import { VideoPlayer } from "../../video/video-player";
import { PostImg } from "../post-img";
import { PostPreviewHeader } from "../post-preview-header";

type QuotedPostContentProps = {
  quotedPost: QuotedPost;
};

export const QuotedPostContent: React.FC<QuotedPostContentProps> = ({ quotedPost }) => {
  return (
    <div className="post-preview-main-container">
      <PostPreviewHeader post={quotedPost} isMiniPreview={true} />
      <div className="post-preview-body">
        <p className="post-preview-text">{quotedPost.text}</p>
        {quotedPost.imgs && quotedPost.imgs.length > 0 && (
          <PostImg
            imgs={quotedPost.imgs.map((img, idx) => {
              return { url: img.url, sortOrder: idx };
            })}
          />
        )}
        {quotedPost.videoUrl && (
          <VideoPlayer videoUrl={quotedPost.videoUrl} isCustomControls={true} />
        )}
        {quotedPost.gif && <GifDisplay gif={quotedPost.gif} isAutoPlay={false} />}
        {quotedPost.poll && <span className="link-to-poll">Show this poll</span>}
      </div>
    </div>
  );
};
