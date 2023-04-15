import { Post } from "../../models/post";

interface PostPreviewProps {
  post: Post;
}

export const PostPreview: React.FC<PostPreviewProps> = ({ post }) => {
  return (
    <div className="user-preview">
      <div className="header-container">
        <div className="user-info">
          <div className="user-name">
            <h3>{post.user.username}</h3>
          </div>
        </div>
      </div>
    </div>
  );
};
