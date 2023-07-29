import { useSelector } from "react-redux";
import { RootState } from "../../../../../store/store";
import { PostRepliedToUsersList } from "../../../PostRepliedToUsersList/PostRepliedToUsersList";
import { PostPreviewBody } from "../../Body/PostPreviewBody";
import { PostPreviewMainContainer } from "../../MainContainer/PostPreviewMainContainer";
import { PostPreviewText } from "../../Text/PostPreviewText";
import { MiniPostPreviewAside } from "../Aside/MiniPostPreviewAside";

export const RepliedPostContent: React.FC = () => {
  const post = useSelector((state: RootState) => state.newPostModule.reply.repliedToPost);
  if (!post) return null;
  const isReplyingToPostShown = post.repliedPostDetails && post.repliedPostDetails.length > 0;
  return (
    <>
      <MiniPostPreviewAside userImgUrl={post.createdBy.imgUrl} isPostLineShowned={true} />
      <PostPreviewMainContainer>
        <PostPreviewBody>
          <PostPreviewText text={post.text} isPlainText={true} />
        </PostPreviewBody>
        {isReplyingToPostShown && (
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          <PostRepliedToUsersList repliedPostDetails={post.repliedPostDetails!} />
        )}
      </PostPreviewMainContainer>
    </>
  );
};
