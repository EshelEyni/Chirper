import { FC } from "react";
import { UserImg } from "../../../../User/UserImg/UserImg";
import {
  PostPreviewUserModal,
  UserPreviewModalPosition,
} from "../../../../Modals/PostPreviewUserModal/PostPreviewUserModal";
import { useModalPosition } from "../../../../../hooks/app/useModalPosition";
import { useCustomElementHover } from "../../../../../hooks/app/useCustomElementHover";
import "./PostPreviewAside.scss";
import { usePostPreview } from "../../../../../contexts/PostPreviewContext";

export const PostPreviewAside: FC = () => {
  const { post, onNavigateToProfile } = usePostPreview();
  const { elementRef, isModalAbove, updateModalPosition } = useModalPosition<HTMLDivElement>({
    modalHeight: 300,
  });
  const { elementsHoverState, handleMouseEnter, handleMouseLeave } = useCustomElementHover({
    userImg: false,
  });

  function onHandleMouseEnter() {
    updateModalPosition();
    handleMouseEnter("userImg");
  }

  const getModalPosition = (): UserPreviewModalPosition => {
    return isModalAbove
      ? {
          top: "unset",
          bottom: "55px",
        }
      : {
          bottom: "unset",
          top: "55px",
        };
  };

  return (
    <aside
      className={"post-preview-wrapper-aside" + (isModalAbove ? " modal-above" : " modal-below")}
      onMouseEnter={() => onHandleMouseEnter()}
      onMouseLeave={() => handleMouseLeave("userImg")}
      ref={elementRef}
    >
      <UserImg
        imgUrl={post.createdBy.imgUrl}
        onNavigateToProfile={() => onNavigateToProfile(post.createdBy.username)}
      />

      {elementsHoverState.userImg && (
        <PostPreviewUserModal
          handleMouseLeave={() => handleMouseLeave("userImg")}
          userPreviewModalPosition={getModalPosition()}
        />
      )}
    </aside>
  );
};
