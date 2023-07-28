import { Post } from "../../../../../../../shared/interfaces/post.interface";
import { PostRepliedToUsersList } from "../../../PostRepliedToUsersList/PostRepliedToUsersList";
import { PostPreviewBody } from "../../Body/PostPreviewBody";
import { PostPreviewMainContainer } from "../../MainContainer/PostPreviewMainContainer";
import { PostPreviewText } from "../../Text/PostPreviewText";
import { MiniPostPreviewAside } from "../Aside/MiniPostPreviewAside";

type RepliedPostContentProps = {
  post: Post;
};

export const RepliedPostContent: React.FC<RepliedPostContentProps> = ({ post }) => {
  const isRepplyingToPostShown = post.repliedPostDetails && post.repliedPostDetails.length > 0;
  return (
    <>
      <MiniPostPreviewAside userImgUrl={post.createdBy.imgUrl} isPostLineShowned={true} />
      <PostPreviewMainContainer>
        <PostPreviewBody>
          <PostPreviewText text={post.text} isPlainText={true} />
        </PostPreviewBody>
        {isRepplyingToPostShown && (
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          <PostRepliedToUsersList repliedPostDetails={post.repliedPostDetails!} />
        )}
      </PostPreviewMainContainer>
    </>
  );
};
