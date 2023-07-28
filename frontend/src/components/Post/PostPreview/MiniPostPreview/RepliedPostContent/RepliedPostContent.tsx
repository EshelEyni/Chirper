import { Post } from "../../../../../../../shared/interfaces/post.interface";
import { UserImg } from "../../../../User/UserImg/UserImg";
import { PostRepliedToUsersList } from "../../../PostRepliedToUsersList/PostRepliedToUsersList";
import { PostPreviewBody } from "../../Body/PostPreviewBody";
import { PostPreviewMainContainer } from "../../MainContainer/PostPreviewMainContainer";
import { PostPreviewText } from "../../Text/PostPreviewText";

type RepliedPostContentProps = {
  post: Post;
};

export const RepliedPostContent: React.FC<RepliedPostContentProps> = ({ post }) => {
  return (
    <>
      <div className="mini-post-preview-side-bar">
        <UserImg imgUrl={post.createdBy.imgUrl} />
        <div className="post-line"></div>
      </div>
      <PostPreviewMainContainer>
        <PostPreviewBody>
          <PostPreviewText text={post.text} isPlainText={true} />
        </PostPreviewBody>
        {post?.repliedPostDetails && post.repliedPostDetails.length > 0 && (
          <PostRepliedToUsersList repliedPostDetails={post.repliedPostDetails} />
        )}
      </PostPreviewMainContainer>
    </>
  );
};
