import { useSelector } from "react-redux";
import { RootState } from "../../../store/store";
import { PostRepliedToUsersList } from "../PostRepliedToUsersList/PostRepliedToUsersList";
import { PostPreviewBody } from "./PostPreviewBody";
import { PostPreviewMainContainer } from "./PostPreviewMainContainer";
import { PostPreviewText } from "./PostPreviewText";
import { MiniPostPreviewAside } from "./MiniPostPreviewAside";
import { PostPreviewProvider } from "../../../contexts/PostPreviewContext";

export const RepliedPostContent: React.FC = () => {
  const post = useSelector((state: RootState) => state.postEdit.reply.repliedToPost);
  if (!post) return null;
  const isReplyingToPostShown = post.repliedPostDetails && post.repliedPostDetails.length > 0;
  return (
    <>
      <PostPreviewProvider post={post}>
        <MiniPostPreviewAside userImgUrl={post.createdBy.imgUrl} isPostLineShowned={true} />
        <PostPreviewMainContainer>
          <PostPreviewBody>
            <PostPreviewText text={post.text} isPlainText={true} />
          </PostPreviewBody>
          {isReplyingToPostShown && (
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            <PostRepliedToUsersList />
          )}
        </PostPreviewMainContainer>
      </PostPreviewProvider>
    </>
  );
};
