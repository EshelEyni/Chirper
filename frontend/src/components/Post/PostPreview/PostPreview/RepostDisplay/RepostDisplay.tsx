import { FC } from "react";
import { AiOutlineRetweet } from "react-icons/ai";
import { useSelector } from "react-redux";
import { RootState } from "../../../../../store/store";
import "./RepostDisplay.scss";
import { usePostPreview } from "../../../../../contexts/PostPreviewContext";
import { Modal } from "../../../../Modals/Modal/Modal";
import { PostPreviewUserModal } from "../../../../Modals/PostPreviewUserModal/PostPreviewUserModal";

export const RepostDisplay: FC = () => {
  const { post, onNavigateToPostDetails, onNavigateToProfile } = usePostPreview();
  const { repostedBy } = post;
  const { loggedInUser } = useSelector((state: RootState) => state.auth);

  if (!repostedBy) return null;
  return (
    <Modal>
      <div className="repost-display">
        <Modal.ModalHoverOpen modalName="respostDetails">
          <div className="repost-display-details-container">
            <div className="repost-icon-container" onClick={onNavigateToPostDetails}>
              <AiOutlineRetweet size={18} />
            </div>
            <span
              className="post-preview-repost-user"
              onClick={() => onNavigateToProfile(repostedBy.username)}
            >
              {`${repostedBy.id === loggedInUser?.id ? "You" : repostedBy.fullname} Rechiped`}
            </span>
          </div>
        </Modal.ModalHoverOpen>
      </div>

      <Modal.Window name="respostDetails" closeOnHover={true}>
        <PostPreviewUserModal
          handleMouseLeave={() => {
            console.log("handleMouseLeave");
          }}
        />
      </Modal.Window>
    </Modal>
  );
};
