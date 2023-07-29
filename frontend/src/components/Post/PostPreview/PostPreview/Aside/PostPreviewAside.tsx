import { FC } from "react";
import { UserImg } from "../../../../User/UserImg/UserImg";
import {
  UserPreviewModal,
  UserPreviewModalPosition,
} from "../../../../Modals/UserPreviewModal/UserPreviewModal";
import { useModalPosition } from "../../../../../hooks/useModalPosition";
import { useCustomElementHover } from "../../../../../hooks/useCustomElementHover";
import { Post } from "../../../../../../../shared/interfaces/post.interface";
import "./PostPreviewAside.scss";

type PostPreviewAsideProps = {
  post: Post;
  onNavigateToProfile: (username: string) => void;
  onToggleFollow: () => void;
};

export const PostPreviewAside: FC<PostPreviewAsideProps> = ({
  post,
  onNavigateToProfile,
  onToggleFollow,
}) => {
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
        <UserPreviewModal
          user={post.createdBy}
          onToggleFollow={onToggleFollow}
          onNavigateToProfile={() => onNavigateToProfile(post.createdBy.username)}
          handleMouseLeave={() => handleMouseLeave("userImg")}
          userPreviewModalPosition={getModalPosition()}
        />
      )}
    </aside>
  );
};
