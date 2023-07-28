import { Post } from "../../../../../../../shared/interfaces/post.interface";
import { GifDisplay } from "../../../../Gif/GifDisplay/GifDisplay";
import { VideoPlayer } from "../../../../Video/VideoPlayer/VideoPlayer";
import { PostImg } from "../../../PostImg/PostImg";
import { PostPreviewHeader } from "../../../PostPreviewHeader/PostPreviewHeader";
import { PostPreviewBody } from "../../Body/PostPreviewBody";
import { PostPreviewMainContainer } from "../../MainContainer/PostPreviewMainContainer";
import { PostPreviewText } from "../../Text/PostPreviewText";

type PostStatsPreviewContentProps = {
  post: Post;
};

export const PostStatsPreviewContent: React.FC<PostStatsPreviewContentProps> = ({ post }) => {
  return (
    <PostPreviewMainContainer>
      <PostPreviewHeader post={post} isMiniPreview={true} />
      <PostPreviewBody>
        <PostPreviewText text={post.text} isPlainText={true} />
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
      </PostPreviewBody>
    </PostPreviewMainContainer>
  );
};
