import { FC } from "react";
import { MiniUser } from "../../../../shared/interfaces/user.interface";
import { UserImg } from "../user/user-img";
import { BtnToggleFollow } from "../btns/btn-toggle-follow";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { Logo } from "../other/logo";
import { ReactComponent as BlueCheckMark } from "../../assets/svg/blue-check-mark.svg";
import { utilService } from "../../services/util.service/utils.service";
import { Link } from "react-router-dom";

export type UserPreviewModalPosition = {
  top?: string;
  bottom?: string;
  left?: string;
};

type UserPreviewModalProps = {
  user: MiniUser;
  userPreviewModalPosition?: any;
  onToggleFollow: () => void;
  onNavigateToProfile?: () => void;
  handleMouseLeave: () => void;
};

export const UserPreviewModal: FC<UserPreviewModalProps> = ({
  user,
  userPreviewModalPosition,
  onToggleFollow,
  onNavigateToProfile,
  handleMouseLeave,
}) => {
  const { loggedinUser } = useSelector((state: RootState) => state.authModule);

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
        <UserImg imgUrl={user.imgUrl} onNavigateToProfile={onNavigateToProfile} />
        {loggedinUser?.id !== user.id && (
          <BtnToggleFollow user={user} onToggleFollow={onToggleFollow} />
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
            <Link to={stat.link}>{`${utilService.formatNumToK(stat.count)} ${stat.title}`}</Link>
          </div>
        ))}
      </div>

      <div style={{ backgroundColor: "yellow" }}>
        {" TODO: followers_you_follow link, and following/followers link"}
      </div>
    </section>
  );
};
