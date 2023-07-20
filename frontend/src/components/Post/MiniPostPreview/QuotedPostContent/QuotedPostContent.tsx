import { QuotedPost } from "../../../../../../shared/interfaces/post.interface";
import { GifDisplay } from "../../../Gif/GifDisplay/GifDisplay";
import { VideoPlayer } from "../../../Video/VideoPlayer/VideoPlayer";
import { PostImg } from "../../PostImg/PostImg";
import { PostPreviewHeader } from "../../PostPreviewHeader/PostPreviewHeader";

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
