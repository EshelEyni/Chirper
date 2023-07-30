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

export const QuotedPostContent: React.FC = () => {
  const { quotedPost } = useSelector((state: RootState) => state.newPostModule.quote);
  if (!quotedPost) return null;
  const isImgShown = quotedPost.imgs && quotedPost.imgs.length > 0;
  return (
    <PostPreviewMainContainer>
      <PostPreviewHeader post={quotedPost} isMiniPreview={true} />
      <PostPreviewBody>
        <PostPreviewText text={quotedPost.text} isPlainText={true} />
        {isImgShown && (
          <PostImg imgs={quotedPost.imgs.map((img, idx) => ({ url: img.url, sortOrder: idx }))} />
        )}
        {quotedPost.videoUrl && (
          <VideoPlayer videoUrl={quotedPost.videoUrl} isCustomControls={true} />
        )}
        {quotedPost.gif && <GifDisplay gif={quotedPost.gif} isAutoPlay={false} />}
        {quotedPost.poll && <span className="link-to-poll">Show this poll</span>}
      </PostPreviewBody>
    </PostPreviewMainContainer>
  );
};
