import { IoEllipsisHorizontalSharp } from "react-icons/io5";
import { Logo } from "../other/logo";
import { utilService } from "../../services/util.service/utils.service";
import { ReactComponent as BlueCheckMark } from "../../assets/svg/blue-check-mark.svg";
import { Post, QuotedPost } from "../../../../shared/interfaces/post.interface";
import { UserImg } from "../user/user-img";
import { useElementTitle } from "../../hooks/useElementTitle";
import { ElementTitle } from "../other/element-title";

type PostPreviewHeaderProps = {
  post: Post | QuotedPost;
  isMiniPreview?: boolean;
  onNavigateToProfile?: () => void;
  onNavigateToPostDetails?: () => void;
};

export const PostPreviewHeader: React.FC<PostPreviewHeaderProps> = ({
  post,
  isMiniPreview = false,
  onNavigateToProfile,
  onNavigateToPostDetails,
}) => {
  const { isElementShown, handleMouseEnter, handleMouseLeave } = useElementTitle();

  return (
    <header className="post-preview-header">
      <div className="post-preview-header-main">
        <div className="post-preview-header-user-info" onClick={onNavigateToProfile}>
          {isMiniPreview && <UserImg imgUrl={post.createdBy.imgUrl} />}
          <span className="post-preview-header-full-name">{post.createdBy.fullname}</span>
          <span>@{post.createdBy.username}</span>
          {post.createdBy.isVerified && <BlueCheckMark className="post-preview-blue-check-mark" />}
          {post.createdBy.isAdmin && <Logo />}
        </div>
        <span>·</span>
        <div className="post-time">
          <span
            onClick={onNavigateToPostDetails}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            {utilService.formatDateToRelativeTime(post.createdAt)}
            {isElementShown && (
              <ElementTitle title={utilService.formatDateToCleanString(post.createdAt)} />
            )}
          </span>
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
