import {
  IoEllipsisHorizontalSharp,
  IoVolumeHighOutline,
  IoVolumeMuteOutline,
} from "react-icons/io5";
import { ReactComponent as BlueCheckMark } from "../../../assets/svg/blue-check-mark.svg";
import {
  formatDateToCleanString,
  formatDateToRelativeTime,
  getToolTipStyles,
} from "../../../services/util/utils.service";
import { UserImg } from "../../User/UserImg/UserImg";
import { Logo } from "../../App/Logo/Logo";
import "./PostPreviewHeader.scss";
import { usePostPreview } from "../../../contexts/PostPreviewContext";
import { Modal } from "../../Modal/Modal";
import { Tooltip } from "react-tooltip";
import { useUniqueID } from "../../../hooks/app/useIDRef";
import { useRef } from "react";
import { RootState } from "../../../store/store";
import { useSelector } from "react-redux";
import { BiUserPlus, BiUserX } from "react-icons/bi";
import { CgUnblock, CgBlock } from "react-icons/cg";
import { BsTrash } from "react-icons/bs";
import { RiPushpin2Line } from "react-icons/ri";
import { BtnToggleRepliers } from "../../Btns/BtnToggleRepliers/BtnToggleRepliers";

type PostPreviewHeaderProps = {
  isMiniPreview?: boolean;
};

export const PostPreviewHeader: React.FC<PostPreviewHeaderProps> = ({ isMiniPreview = false }) => {
  const { loggedInUser } = useSelector((state: RootState) => state.auth);
  const { post, onNavigateToProfile, onNavigateToPostDetails, onToggleFollow } = usePostPreview();
  const { id: btnId } = useUniqueID();

  const user = post.createdBy;
  const logoOptions = { staticLogo: true, autoAnimate: false, width: 18, height: 18 };

  const tooltipStyle = useRef(getToolTipStyles()).current;

  function handleBtnToggleFollow() {
    onToggleFollow();
  }

  function handleBtnToggleMute() {
    //TODO: needs to be implemented
    // eslint-disable-next-line no-console
    console.log("handleBtnToggleMute");
  }

  function handleBtnToggleBlock() {
    // TODO: needs to be implemented
    // eslint-disable-next-line no-console
    console.log("handleBtnBlockUser");
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
          <Tooltip id={`postTime-${post.id}`} offset={5} noArrow={true} style={tooltipStyle} />
        </div>
      </div>
      {!isMiniPreview && (
        <Modal>
          <Modal.OpenBtn
            modalName="postPreview/moreOptions"
            setPositionByRef={true}
            modalHeight={400}
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
            style={{ transform: "translate(-95%,-25%)" }}
          >
            {!loggedInUser || loggedInUser.id !== post.createdBy.id ? (
              <>
                <Modal.CloseBtn>
                  <button onClick={handleBtnToggleFollow}>
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
                <Modal.CloseBtn>
                  <button onClick={handleBtnToggleMute}>
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
                <Modal.CloseBtn>
                  <button onClick={handleBtnToggleBlock}>
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
                <Modal.CloseBtn>
                  <button className="post-preview-delete-option">
                    <BsTrash size={18} color="var(--color-danger)" />
                    <span>Delete</span>
                  </button>
                </Modal.CloseBtn>
                <Modal.CloseBtn>
                  <button onClick={handleBtnToggleFollow}>
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
                <Modal.CloseBtn>
                  <button onClick={handleBtnToggleFollow} className="post-preview-pin-option">
                    <RiPushpin2Line size={24} />
                    <span>
                      {post.createdBy.username ? "Unpin from your Profile" : "Pin to your Profile"}
                    </span>
                  </button>
                </Modal.CloseBtn>
                <Modal.CloseBtn>
                  <div>
                    <BtnToggleRepliers post={post} isPostEdit={false} />
                  </div>
                </Modal.CloseBtn>
              </>
            )}
          </Modal.Window>
        </Modal>
      )}
    </header>
  );
};
