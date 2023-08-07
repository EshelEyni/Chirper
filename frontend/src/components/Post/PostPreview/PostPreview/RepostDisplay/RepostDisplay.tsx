import { FC } from "react";
import { AiOutlineRetweet } from "react-icons/ai";
import { useSelector } from "react-redux";
import { RootState } from "../../../../../store/store";
import "./RepostDisplay.scss";
import { useCustomElementHover } from "../../../../../hooks/useCustomElementHover";
import {
  PostPreviewUserModal,
  UserPreviewModalPosition,
} from "../../../../Modals/PostPreviewUserModal/PostPreviewUserModal";
import { useModalPosition } from "../../../../../hooks/useModalPosition";
import { usePostPreview } from "../../../../../contexts/PostPreviewContext";

export const RepostDisplay: FC = () => {
  const { post, onNavigateToPostDetails, onNavigateToProfile } = usePostPreview();
  const { repostedBy } = post;
  const { loggedInUser } = useSelector((state: RootState) => state.auth);

  const { elementRef, isModalAbove, updateModalPosition } = useModalPosition<HTMLDivElement>({
    modalHeight: 300,
  });

  const { elementsHoverState, handleMouseEnter, handleMouseLeave } = useCustomElementHover({
    respostDetails: false,
  });

  function onHandleMouseEnter() {
    updateModalPosition();
    handleMouseEnter("respostDetails");
  }

  const getModalPosition = (): UserPreviewModalPosition => {
    return isModalAbove
      ? {
          left: "20%",
          top: "unset",
          bottom: "35px",
        }
      : {
          left: "20%",
          bottom: "unset",
          top: "35px",
        };
  };

  if (!repostedBy) return null;
  return (
    <div
      className={"post-preview-repost-container" + (isModalAbove ? " modal-above" : " modal-below")}
      onMouseLeave={() => handleMouseLeave("respostDetails")}
    >
      <div className="repost-icon-container" onClick={onNavigateToPostDetails}>
        <AiOutlineRetweet size={18} />
      </div>
      <span
        className="post-preview-repost-user"
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        onClick={() => onNavigateToProfile(repostedBy!.username)}
        onMouseEnter={() => onHandleMouseEnter()}
        ref={elementRef}
      >
        {`${repostedBy.id === loggedInUser?.id ? "You" : repostedBy.fullname} Rechiped`}
      </span>
      {elementsHoverState.respostDetails && (
        <PostPreviewUserModal
          handleMouseLeave={() => handleMouseLeave("respostDetails")}
          userPreviewModalPosition={getModalPosition()}
        />
      )}
    </div>
  );
};
