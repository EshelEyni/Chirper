import { Post } from "../../../../shared/interfaces/post.interface";
import { utilService } from "../../services/util.service/utils.service";
import { IoEllipsisHorizontalSharp } from "react-icons/io5";
import { PostPreviewActionBtns } from "../btns/post-preview-action-brns";
import { UserImg } from "../user/user-img";

interface PostPreviewProps {
  post: Post;
}

export const PostPreview: React.FC<PostPreviewProps> = ({ post }) => {
  return (
    <article className="post-preview">
      <div className="user-img-container">
        <UserImg imgUrl={post.user.imgUrl} />
      </div>
      <div className="main-container">
        <header className="post-preview-header">
          <div className="post-preview-header-main">
            <div className="user-info">
              <h3>{post.user.fullname}</h3>
              <span>@{post.user.username}</span>
            </div>
            <span>·</span>
            <div className="post-time">
              <span>{utilService.formatTime(post.createdAt)}</span>
            </div>
          </div>
          <div className="post-preview-header-options-container">
            <IoEllipsisHorizontalSharp />
          </div>
        </header>
        <div className="post-preview-body">
          <p>{post.text}</p>
        </div>
        <footer className="flex">
          <PostPreviewActionBtns post={post} />
        </footer>
      </div>
    </article>
  );
};
