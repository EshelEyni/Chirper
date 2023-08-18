import { IoEllipsisHorizontalSharp } from "react-icons/io5";
import { ReactComponent as BlueCheckMark } from "../../../assets/svg/blue-check-mark.svg";
import { useCustomElementHover } from "../../../hooks/app/useCustomElementHover";
import { useState } from "react";
import {
  formatDateToCleanString,
  formatDateToRelativeTime,
} from "../../../services/util/utils.service";
import {
  PostPreviewUserModal,
  UserPreviewModalPosition,
} from "../../Modals/PostPreviewUserModal/PostPreviewUserModal";
import { UserImg } from "../../User/UserImg/UserImg";
import { Logo } from "../../App/Logo/Logo";
import { ElementTitle } from "../../App/ElementTitle/ElementTitle";
import "./PostPreviewHeader.scss";
import { usePostPreview } from "../../../contexts/PostPreviewContext";

type PostPreviewHeaderProps = {
  isMiniPreview?: boolean;
};

export const PostPreviewHeader: React.FC<PostPreviewHeaderProps> = ({ isMiniPreview = false }) => {
  const { post, onNavigateToProfile, onNavigateToPostDetails } = usePostPreview();
  const [userPreviewModalPosition, setUserPreviewModalPosition] =
    useState<UserPreviewModalPosition>({});

  const { elementsHoverState, handleMouseEnter, handleMouseLeave } = useCustomElementHover({
    postTime: false,
    userInfo: false,
  });

  function handleMouseEnterInUserInfo(e: React.MouseEvent) {
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
  }

  function handleMouseLeaveInUserInfo() {
    setUserPreviewModalPosition({});
    handleMouseLeave("userInfo");
  }

  return (
    <header className="post-preview-header">
      <div className="post-preview-header-main">
        <div className="post-preview-header-user-info" onMouseLeave={handleMouseLeaveInUserInfo}>
          {isMiniPreview && <UserImg imgUrl={post.createdBy.imgUrl} />}
          <div
            className="post-preview-header-details-container"
            onClick={() => onNavigateToProfile(post.createdBy.username)}
            onMouseEnter={handleMouseEnterInUserInfo}
          >
            <span className="post-preview-header-full-name">{post.createdBy.fullname}</span>
            {post.createdBy.isVerified && (
              <BlueCheckMark className="post-preview-blue-check-mark" />
            )}
            {post.createdBy.isAdmin && (
              <Logo options={{ staticLogo: true, autoAnimate: false, width: 18, height: 18 }} />
            )}
          </div>
          <span
            className="post-preview-header-username"
            onMouseEnter={handleMouseEnterInUserInfo}
            onClick={() => onNavigateToProfile(post.createdBy.username)}
          >
            @{post.createdBy.username}
          </span>
          {elementsHoverState?.userInfo && (
            <PostPreviewUserModal
              userPreviewModalPosition={userPreviewModalPosition}
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
