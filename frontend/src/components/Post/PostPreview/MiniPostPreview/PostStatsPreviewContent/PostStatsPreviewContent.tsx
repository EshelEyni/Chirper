import { Post } from "../../../../../../../shared/types/post.interface";
import { PostPreviewProvider } from "../../../../../contexts/PostPreviewContext";
import { VideoPlayerProvider } from "../../../../../contexts/VideoPlayerContext";
import { GifDisplay } from "../../../../Gif/GifDisplay/GifDisplay";
import { VideoPlayer } from "../../../../Video/VideoPlayer/VideoPlayer";
import { PostImg } from "../../../PostImgList/PostImgList";
import { PostPreviewHeader } from "../../../PostPreviewHeader/PostPreviewHeader";
import { PostPreviewBody } from "../../Body/PostPreviewBody";
import { PostPreviewMainContainer } from "../../MainContainer/PostPreviewMainContainer";
import { PostPreviewText } from "../../Text/PostPreviewText";
import "./PostStatsPreviewContent.scss";

type PostStatsPreviewContentProps = {
  post: Post;
};

export const PostStatsPreviewContent: React.FC<PostStatsPreviewContentProps> = ({ post }) => {
  const isImgShown = post.imgs && post.imgs.length > 0;
  return (
    <PostPreviewProvider post={post}>
      <PostPreviewMainContainer>
        <PostPreviewHeader isMiniPreview={true} />
        <PostPreviewBody>
          <PostPreviewText
            text={post.text}
            isPlainText={true}
            postId={post.id}
            loggedInUserActionState={post.loggedInUserActionState}
          />
          {isImgShown && (
            <PostImg imgs={post.imgs.map((img, idx) => ({ url: img.url, sortOrder: idx }))} />
          )}
          {post.videoUrl && (
            <VideoPlayerProvider>
              <VideoPlayer videoUrl={post.videoUrl} isCustomControls={true} />
            </VideoPlayerProvider>
          )}
          {post.gif && <GifDisplay gif={post.gif} isAutoPlay={false} />}
          {post.poll && <span className="link-to-poll">Show this poll</span>}
        </PostPreviewBody>
      </PostPreviewMainContainer>
    </PostPreviewProvider>
  );
};
