import { IoEllipsisHorizontalSharp } from "react-icons/io5";
import { Logo } from "../other/logo";
import { utilService } from "../../services/util.service/utils.service";
import { ReactComponent as BlueCheckMark } from "../../assets/svg/blue-check-mark.svg";
import { Post, QuotedPost } from "../../../../shared/interfaces/post.interface";
import { UserImg } from "../user/user-img";
import { useCustomElementHover } from "../../hooks/useCustomElementHover";
import { ElementTitle } from "../other/element-title";
import { UserPreviewModal } from "../modals/user-preview-modal";
import { useState } from "react";

type PostPreviewHeaderProps = {
  post: Post | QuotedPost;
  isMiniPreview?: boolean;
  onNavigateToProfile?: () => void;
  onNavigateToPostDetails?: () => void;
  onToggleFollow?: () => void;
};

export const PostPreviewHeader: React.FC<PostPreviewHeaderProps> = ({
  post,
  isMiniPreview = false,
  onNavigateToProfile,
  onNavigateToPostDetails,
  onToggleFollow,
}) => {
  const [userPreviewModalPosition, setUserPreviewModalPosition] = useState({} as any);
  const { elementsHoverState, handleMouseEnter, handleMouseLeave } = useCustomElementHover({
    postTime: false,
    userInfo: false,
  });

  const handleMouseEnterInUserInfo = () => {
    setUserPreviewModalPosition({
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
    });
    handleMouseEnter("userInfo");
  };

  const handleMouseLeaveInUserInfo = () => {
    setUserPreviewModalPosition({} as any);
    handleMouseLeave("userInfo");
  };

  return (
    <header className="post-preview-header">
      <div className="post-preview-header-main">
        <div className="post-preview-header-user-info" onClick={onNavigateToProfile}>
          {isMiniPreview && <UserImg imgUrl={post.createdBy.imgUrl} />}
          <span
            className="post-preview-header-full-name"
            onMouseEnter={() => handleMouseEnterInUserInfo()}
            onMouseLeave={handleMouseLeaveInUserInfo}
          >
            {post.createdBy.fullname}
          </span>
          <span
            className="post-preview-header-username"
            onMouseEnter={() => handleMouseEnterInUserInfo()}
            onMouseLeave={handleMouseLeaveInUserInfo}
          >
            @{post.createdBy.username}
          </span>
          {post.createdBy.isVerified && <BlueCheckMark className="post-preview-blue-check-mark" />}
          {post.createdBy.isAdmin && <Logo />}
          {elementsHoverState?.userInfo && onToggleFollow && (
            <UserPreviewModal
              user={post.createdBy}
              userPreviewModalPosition={userPreviewModalPosition}
              onToggleFollow={onToggleFollow}
            />
          )}
        </div>
        <span>·</span>
        <div className="post-time">
          <span
            onClick={onNavigateToPostDetails}
            onMouseEnter={() => handleMouseEnter("postTime")}
            onMouseLeave={() => handleMouseLeave("postTime")}
          >
            {utilService.formatDateToRelativeTime(post.createdAt)}
            {elementsHoverState?.postTime && (
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
