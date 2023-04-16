import { Post } from "../../models/post";
import { utilService } from "../../services/utils.service";
import { IoEllipsisHorizontalSharp } from "react-icons/io5";

interface PostPreviewProps {
  post: Post;
}

export const PostPreview: React.FC<PostPreviewProps> = ({ post }) => {
  return (
    <article className="post-preview">
      <div className="user-img">
        <img src={post.user.imgUrl} alt="user-avatar" />
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
      </div>
    </article>
  );
};
