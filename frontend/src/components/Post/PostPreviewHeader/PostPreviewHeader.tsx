import { IoEllipsisHorizontalSharp } from "react-icons/io5";
import { ReactComponent as BlueCheckMark } from "../../../assets/svg/blue-check-mark.svg";
import { Post, QuotedPost } from "../../../../../shared/interfaces/post.interface";
import { useCustomElementHover } from "../../../hooks/useCustomElementHover";
import { useState } from "react";
import {
  formatDateToCleanString,
  formatDateToRelativeTime,
} from "../../../services/util.service/utils.service";
import {
  UserPreviewModal,
  UserPreviewModalPosition,
} from "../../Modals/UserPreviewModal/UserPreviewModal";
import { UserImg } from "../../User/UserImg/UserImg";
import { Logo } from "../../App/Logo/Logo";
import { ElementTitle } from "../../App/ElementTitle/ElementTitle";
import "./PostPreviewHeader.scss";

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
  const [userPreviewModalPosition, setUserPreviewModalPosition] =
    useState<UserPreviewModalPosition>({});

  const { elementsHoverState, handleMouseEnter, handleMouseLeave } = useCustomElementHover({
    postTime: false,
    userInfo: false,
  });

  const handleMouseEnterInUserInfo = (e: React.MouseEvent) => {
    const container = e.currentTarget.closest(".post-preview-header-user-info");
    const containerRect = container?.getBoundingClientRect();
    const targetRect = e.currentTarget.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    const isModalPositionUp = windowHeight - targetRect.top < 300;
    e.currentTarget.classList.add(isModalPositionUp ? "modal-above" : "modal-below");
    const leftPosition = targetRect.left - containerRect!.left + targetRect.width / 2;
    setUserPreviewModalPosition({
      top: isModalPositionUp ? "unset" : "24px",
      bottom: isModalPositionUp ? "24px" : "unset",
      left: `${leftPosition}px`,
    });
    handleMouseEnter("userInfo");
  };

  const handleMouseLeaveInUserInfo = () => {
    setUserPreviewModalPosition({});
    handleMouseLeave("userInfo");
  };

  return (
    <header className="post-preview-header">
      <div className="post-preview-header-main">
        <div className="post-preview-header-user-info" onClick={onNavigateToProfile}>
          {isMiniPreview && <UserImg imgUrl={post.createdBy.imgUrl} />}
          <div
            className="post-preview-header-details-container"
            onMouseEnter={handleMouseEnterInUserInfo}
            onMouseLeave={handleMouseLeaveInUserInfo}
          >
            <span className="post-preview-header-full-name">{post.createdBy.fullname}</span>
            {post.createdBy.isVerified && (
              <BlueCheckMark className="post-preview-blue-check-mark" />
            )}
            {post.createdBy.isAdmin && <Logo />}
          </div>
          <span
            className="post-preview-header-username"
            onMouseEnter={handleMouseEnterInUserInfo}
            onMouseLeave={handleMouseLeaveInUserInfo}
          >
            @{post.createdBy.username}
          </span>
          {elementsHoverState?.userInfo && onToggleFollow && (
            <UserPreviewModal
              user={post.createdBy}
              userPreviewModalPosition={userPreviewModalPosition}
              onToggleFollow={onToggleFollow}
              handleMouseLeave={handleMouseLeaveInUserInfo}
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
            {formatDateToRelativeTime(post.createdAt)}
            {elementsHoverState?.postTime && (
              <ElementTitle title={formatDateToCleanString(post.createdAt)} />
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
