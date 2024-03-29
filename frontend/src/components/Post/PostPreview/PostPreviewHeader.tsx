import { useRef, useState } from "react";
import {
  IoEllipsisHorizontalSharp,
  IoVolumeHighOutline,
  IoVolumeMuteOutline,
} from "react-icons/io5";
import { BsTrash } from "react-icons/bs";
import { FaRobot } from "react-icons/fa";
import { Tooltip } from "react-tooltip";
import { ReactComponent as BlueCheckMark } from "../../../assets/svg/blue-check-mark.svg";
import {
  formatDateToCleanString,
  formatDateToRelativeTime,
  getToolTipStyles,
} from "../../../services/util/utilService";
import { UserImg } from "../../User/UserImg/UserImg";
import { Logo } from "../../App/Logo/Logo";
import { usePostPreview } from "../../../contexts/PostPreviewContext";
import { Modal } from "../../Modal/Modal";
import { useUniqueID } from "../../../hooks/useIDRef";
import { useSelector } from "react-redux";
import { BiUserPlus, BiUserX } from "react-icons/bi";
import { CgUnblock, CgBlock } from "react-icons/cg";
import { RiBarChartGroupedFill, RiPushpin2Line } from "react-icons/ri";
import { useRemovePost } from "../../../hooks/useRemovePost";
import { useUpdatePost } from "../../../hooks/useUpdatePost";
import useRemoveBlock from "../../../hooks/useRemoveBlock";
import useAddBlock from "../../../hooks/useAddBlock";
import useRemoveMute from "../../../hooks/useRemoveMute";
import useAddMute from "../../../hooks/useAddMute";
import "./PostPreviewHeader.scss";
import postUtilService from "../../../services/post/postUtilService";
import { RootState } from "../../../types/app";

type PostPreviewHeaderProps = {
  isMiniPreview?: boolean;
};

export const PostPreviewHeader: React.FC<PostPreviewHeaderProps> = ({ isMiniPreview = false }) => {
  const [openedModalName, setOpenedModalName] = useState("");

  const { loggedInUser } = useSelector((state: RootState) => state.auth);
  const {
    post,
    onNavigateToProfile,
    onNavigateToPostDetails,
    onToggleFollow,
    onNavigateToPostStats,
  } = usePostPreview();

  const { removePost } = useRemovePost();
  const { updatePost } = useUpdatePost();
  const { addBlock } = useAddBlock();
  const { removeBlock } = useRemoveBlock();
  const { removeMute } = useRemoveMute();
  const { addMute } = useAddMute();

  const { id: btnId } = useUniqueID();
  const tooltipStyle = useRef(getToolTipStyles()).current;

  if (!postUtilService.isPost(post)) return null;
  const user = post.createdBy;

  function handleBtnToggleFollow() {
    onToggleFollow();
  }

  function handleBtnToggleMute() {
    if (!postUtilService.isPost(post)) return;
    if (post.createdBy.isMuted) removeMute({ userId: post.createdBy.id, postId: post.id });
    else addMute({ userId: post.createdBy.id, postId: post.id });
  }

  function handleBtnToggleBlock() {
    if (!postUtilService.isPost(post)) return;
    if (post.createdBy.isBlocked) removeBlock({ userId: post.createdBy.id, postId: post.id });
    else addBlock({ userId: post.createdBy.id, postId: post.id });
  }

  function handleBtnDeletePost(postId: string) {
    removePost(postId);
  }

  function handleBtnPinPost() {
    if (!postUtilService.isPost(post)) return;
    updatePost({ ...post, isPinned: !post.isPinned });
  }

  function handleBtnViewPostStats() {
    onNavigateToPostStats();
  }

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
                {user.isAdmin && <Logo staticLogo={true} size={{ height: 18, width: 18 }} />}
                {user.isBot && <FaRobot size={20} color="var(--color-primary)" />}
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
          <Tooltip id={`postTime-${post.id}`} offset={5} noArrow={true} style={tooltipStyle} />
        </div>
      </div>
      {!isMiniPreview && (
        <Modal externalStateControl={{ openedModalName, setOpenedModalName }}>
          <Modal.OpenBtn
            modalName="postPreview/moreOptions"
            setPositionByRef={true}
            modalHeight={400}
            externalControlFunc={() => setOpenedModalName("postPreview/moreOptions")}
          >
            <div
              className="post-preview-more-options-btn"
              data-tooltip-id={btnId}
              data-tooltip-content={"More"}
              data-tooltip-place="bottom"
            >
              <IoEllipsisHorizontalSharp />
              <Tooltip id={btnId} offset={5} noArrow={true} delayShow={200} style={tooltipStyle} />
            </div>
          </Modal.OpenBtn>

          <Modal.Window
            name="postPreview/moreOptions"
            className="post-preview-more-options"
            style={{
              transform: "translate(-95%,-25%)",
            }}
          >
            {!loggedInUser || loggedInUser.id !== post.createdBy.id ? (
              <>
                {loggedInUser && loggedInUser.isAdmin && (
                  <button
                    className="post-preview-delete-option"
                    onClick={() => setOpenedModalName("postPreview/deletePost")}
                  >
                    <BsTrash size={18} color="var(--color-danger)" />
                    <span>Delete</span>
                  </button>
                )}
                <Modal.CloseBtn onClickFn={handleBtnToggleFollow}>
                  <button>
                    {post.createdBy.isFollowing ? (
                      <div>
                        <BiUserX size={24} />
                        <span>{`Unfollow @${post.createdBy.username}`}</span>
                      </div>
                    ) : (
                      <div>
                        <BiUserPlus size={24} />
                        <span>{`Follow @${post.createdBy.username}`}</span>
                      </div>
                    )}
                  </button>
                </Modal.CloseBtn>
                <Modal.CloseBtn onClickFn={handleBtnToggleMute}>
                  <button>
                    {post.createdBy.isFollowing ? (
                      <div>
                        <IoVolumeMuteOutline size={24} />
                        <span>{`Unmute @${post.createdBy.username}`}</span>
                      </div>
                    ) : (
                      <div>
                        <IoVolumeHighOutline size={24} />
                        <span>{`Mute @${post.createdBy.username}`}</span>
                      </div>
                    )}
                  </button>
                </Modal.CloseBtn>
                <Modal.CloseBtn onClickFn={handleBtnToggleBlock}>
                  <button>
                    {post.createdBy.isFollowing ? (
                      <div>
                        <CgUnblock size={24} />
                        <span>{`Unblock @${post.createdBy.username}`}</span>
                      </div>
                    ) : (
                      <div>
                        <CgBlock size={24} />
                        <span>{`Block @${post.createdBy.username}`}</span>
                      </div>
                    )}
                  </button>
                </Modal.CloseBtn>
              </>
            ) : (
              <>
                <button
                  className="post-preview-delete-option"
                  onClick={() => setOpenedModalName("postPreview/deletePost")}
                >
                  <BsTrash size={18} color="var(--color-danger)" />
                  <span>Delete</span>
                </button>
                <Modal.CloseBtn onClickFn={handleBtnPinPost}>
                  <button className="post-preview-pin-option">
                    <RiPushpin2Line size={24} />
                    <span>{post.isPinned ? "Unpin from your Profile" : "Pin to your Profile"}</span>
                  </button>
                </Modal.CloseBtn>
                <Modal.CloseBtn onClickFn={handleBtnViewPostStats}>
                  <button className="post-preview-pin-option">
                    <RiBarChartGroupedFill size={24} />
                    <span>View Post Analytics</span>
                  </button>
                </Modal.CloseBtn>
              </>
            )}
          </Modal.Window>
        </Modal>
      )}
      <Modal
        externalStateControl={{ openedModalName, setOpenedModalName }}
        onAfterClose={() => setOpenedModalName("postPreview/moreOptions")}
      >
        <Modal.Window
          name="postPreview/deletePost"
          className="confirm-delete-msg"
          mainScreenMode="dark"
          mainScreenZIndex={4000}
        >
          <div className="modal-header">
            <span className="modal-title">Delete Chirp?</span>
            <p className="modal-description">This can’t be undone and you’ll lose your draft.</p>
          </div>

          <div className="modal-btns-container">
            <button
              className="btn btn-delete"
              onClick={() => {
                setOpenedModalName("");
                handleBtnDeletePost(post.id);
              }}
            >
              <span>Delete</span>
            </button>
            <Modal.CloseBtn>
              <button className="btn btn-close-modal">
                <span>Cancel</span>
              </button>
            </Modal.CloseBtn>
          </div>
        </Modal.Window>
      </Modal>
    </header>
  );
};
