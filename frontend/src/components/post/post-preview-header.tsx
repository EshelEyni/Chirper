import { IoEllipsisHorizontalSharp } from "react-icons/io5";
import { Logo } from "../other/logo";
import { utilService } from "../../services/util.service/utils.service";
import { ReactComponent as BlueCheckMark } from "../../assets/svg/blue-check-mark.svg";
import { Post, QuotedPost } from "../../../../shared/interfaces/post.interface";
import { UserImg } from "../user/user-img";

type PostPreviewHeaderProps = {
  post: Post | QuotedPost;
  isMiniPreview?: boolean;
};

export const PostPreviewHeader: React.FC<PostPreviewHeaderProps> = ({
  post,
  isMiniPreview = false,
}) => {
  return (
    <header className="post-preview-header">
      <div className="post-preview-header-main">
        <div className="user-info">
          {isMiniPreview && <UserImg imgUrl={post.createdBy.imgUrl} />}
          <h3>{post.createdBy.fullname}</h3>
          <span>@{post.createdBy.username}</span>
          {post.createdBy.isVerified && <BlueCheckMark className="post-preview-blue-check-mark" />}
          {post.createdBy.isAdmin && <Logo />}
        </div>
        <span className="post-preview-header-dot">·</span>
        <div className="post-time">
          <span>{utilService.formatTime(post.createdAt)}</span>
        </div>
      </div>
      {!isMiniPreview && (
        <div className="post-preview-header-options-container">
          <IoEllipsisHorizontalSharp />
        </div>
      )}
    </header>
  );
};
