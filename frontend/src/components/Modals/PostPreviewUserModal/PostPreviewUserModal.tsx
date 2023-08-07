import { FC } from "react";
import { Link } from "react-router-dom";
import "./PostPreviewUserModal.scss";
import { useSelector } from "react-redux";
import { MiniUser } from "../../../../../shared/interfaces/user.interface";
import { formatNumToK } from "../../../services/util/utils.service";
import { RootState } from "../../../store/store";
import { ReactComponent as BlueCheckMark } from "../../../assets/svg/blue-check-mark.svg";
import { BtnToggleFollow } from "../../Btns/BtnToggleFollow/BtnToggleFollow";
import { UserImg } from "../../User/UserImg/UserImg";
import { Logo } from "../../App/Logo/Logo";
import { usePostPreview } from "../../../contexts/PostPreviewContext";

export type UserPreviewModalPosition = {
  top?: string;
  bottom?: string;
  left?: string;
};

type UserPreviewModalProps = {
  userPreviewModalPosition?: any;
  handleMouseLeave: () => void;
};

export const PostPreviewUserModal: FC<UserPreviewModalProps> = ({
  userPreviewModalPosition,
  handleMouseLeave,
}) => {
  const { post, onNavigateToProfile, onToggleFollow } = usePostPreview();
  const user = post.createdBy as MiniUser;
  const { loggedInUser } = useSelector((state: RootState) => state.auth);
  const followingStats = [
    { title: "Followers", count: user.followersCount, link: `/profile/${user.username}/followers` },
    { title: "Following", count: user.followingCount, link: `/profile/${user.username}/following` },
  ];

  return (
    <section
      className="user-preview-modal"
      style={userPreviewModalPosition}
      onMouseLeave={handleMouseLeave}
    >
      <div className="user-preview-modal-header">
        <UserImg
          imgUrl={user.imgUrl}
          onNavigateToProfile={() => onNavigateToProfile(post.createdBy.username)}
        />
        {loggedInUser?.id !== user.id && (
          <BtnToggleFollow user={user} handleBtnClick={onToggleFollow} />
        )}
      </div>

      <div className="user-preview-modal-user-info">
        <div className="post-preview-modal-user-info-title-container">
          <span>{user.fullname}</span>
          {user.isVerified && (
            <BlueCheckMark className="post-preview-modal-user-info-blue-check-mark" />
          )}
          {user.isAdmin && <Logo />}
        </div>
        <span className="post-preview-modal-user-info-username">@{user.username}</span>
        <p className="post-preview-modal-user-info-bio">{user.bio}</p>
      </div>

      <div className="post-preview-modal-user-info-following-stats">
        {followingStats.map((stat, idx) => (
          <div className="post-preview-modal-user-info-following-stats-item" key={idx}>
            <Link to={stat.link}>{`${formatNumToK(stat.count)} ${stat.title}`}</Link>
          </div>
        ))}
      </div>

      <div style={{ backgroundColor: "yellow" }}>
        {" TODO: followers_you_follow link, and following/followers link"}
      </div>
    </section>
  );
};
