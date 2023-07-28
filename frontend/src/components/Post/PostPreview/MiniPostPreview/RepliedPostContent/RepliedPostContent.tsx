import { Post } from "../../../../../../../shared/interfaces/post.interface";
import { UserImg } from "../../../../User/UserImg/UserImg";
import { PostRepliedToUsersList } from "../../../PostRepliedToUsersList/PostRepliedToUsersList";

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
      <div className="post-preview-main-container">
        <div className="post-preview-body">
          <p className="post-preview-text">{post.text}</p>
        </div>
        {post?.repliedPostDetails && post.repliedPostDetails.length > 0 && (
          <PostRepliedToUsersList repliedPostDetails={post.repliedPostDetails} />
        )}
      </div>
    </>
  );
};
