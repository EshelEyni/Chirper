import { IoEllipsisHorizontalSharp } from "react-icons/io5";
import { ReactComponent as BlueCheckMark } from "../../../assets/svg/blue-check-mark.svg";
import {
  formatDateToCleanString,
  formatDateToRelativeTime,
} from "../../../services/util/utils.service";
import { UserImg } from "../../User/UserImg/UserImg";
import { Logo } from "../../App/Logo/Logo";
import "./PostPreviewHeader.scss";
import { usePostPreview } from "../../../contexts/PostPreviewContext";
import { Modal } from "../../Modal/Modal";
import { Tooltip } from "react-tooltip";

type PostPreviewHeaderProps = {
  isMiniPreview?: boolean;
};

export const PostPreviewHeader: React.FC<PostPreviewHeaderProps> = ({ isMiniPreview = false }) => {
  const { post, onNavigateToProfile, onNavigateToPostDetails } = usePostPreview();

  const user = post.createdBy;
  const logoOptions = { staticLogo: true, autoAnimate: false, width: 18, height: 18 };
  return (
    <header className="post-preview-header">
      <div className="post-preview-header-main">
        <Modal>
          <div className="post-preview-header-user-info">
            {isMiniPreview && <UserImg imgUrl={user.imgUrl} />}
            <Modal.ModalHoverOpen modalName="userPreview/fullname" modalHeight={200}>
              <div
                className="post-preview-header-details-container"
                onClick={() => onNavigateToProfile(user.username)}
              >
                <span className="post-preview-header-full-name">{user.fullname}</span>
                {user.isVerified && <BlueCheckMark className="post-preview-blue-check-mark" />}
                {user.isAdmin && <Logo options={logoOptions} />}
              </div>
            </Modal.ModalHoverOpen>
            <Modal.ModalHoverOpen modalName="userPreview/fullname" modalHeight={200}>
              <span
                className="post-preview-header-username"
                onClick={() => onNavigateToProfile(user.username)}
              >
                @{user.username}
              </span>
            </Modal.ModalHoverOpen>
          </div>

          <Modal.Window
            name="userPreview/fullname"
            className="user-preview-modal"
            hoverControl={true}
          >
            <Modal.PostPreviewUserModalContent />
          </Modal.Window>
        </Modal>
        <span>·</span>
        <div className="post-time">
          <span
            onClick={onNavigateToPostDetails}
            data-tooltip-id={`postTime-${post.id}`}
            data-tooltip-content={formatDateToCleanString(post.createdAt)}
            data-tooltip-place="bottom"
          >
            {formatDateToRelativeTime(post.createdAt)}
          </span>
          <Tooltip
            id={`postTime-${post.id}`}
            offset={5}
            noArrow={true}
            style={{ fontSize: "14px", backgroundColor: "rgba(0, 0, 0, 0.5)" }}
          />
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
