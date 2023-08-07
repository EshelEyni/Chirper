import { useSelector } from "react-redux";
import { GifDisplay } from "../../../../Gif/GifDisplay/GifDisplay";
import { VideoPlayer } from "../../../../Video/VideoPlayer/VideoPlayer";
import { PostImg } from "../../../PostImgList/PostImgList";
import { PostPreviewHeader } from "../../../PostPreviewHeader/PostPreviewHeader";
import { PostPreviewBody } from "../../Body/PostPreviewBody";
import { PostPreviewMainContainer } from "../../MainContainer/PostPreviewMainContainer";
import { PostPreviewText } from "../../Text/PostPreviewText";
import "./QuotedPostContent.scss";
import { RootState } from "../../../../../store/store";
import { PostPreviewProvider } from "../../../../../contexts/PostPreviewContext";
import { VideoPlayerProvider } from "../../../../../contexts/VideoPlayerContext";

export const QuotedPostContent: React.FC = () => {
  const { quotedPost } = useSelector((state: RootState) => state.postEdit.quote);
  if (!quotedPost) return null;
  const isImgShown = quotedPost.imgs && quotedPost.imgs.length > 0;
  return (
    <PostPreviewProvider post={quotedPost}>
      <PostPreviewMainContainer>
        <PostPreviewHeader isMiniPreview={true} />
        <PostPreviewBody>
          <PostPreviewText text={quotedPost.text} isPlainText={true} />
          {isImgShown && <PostImg imgs={quotedPost.imgs} />}
          {quotedPost.videoUrl && (
            <VideoPlayerProvider>
              <VideoPlayer videoUrl={quotedPost.videoUrl} isCustomControls={true} />
            </VideoPlayerProvider>
          )}
          {quotedPost.gif && <GifDisplay gif={quotedPost.gif} isAutoPlay={false} />}
          {quotedPost.poll && <span className="link-to-poll">Show this poll</span>}
        </PostPreviewBody>
      </PostPreviewMainContainer>
    </PostPreviewProvider>
  );
};
