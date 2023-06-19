import { FC } from "react";
import { MiniUser } from "../../../../shared/interfaces/user.interface";
import { UserImg } from "../user/user-img";
import { BtnToggleFollow } from "../btns/btn-toggle-follow";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { Logo } from "../other/logo";
import { ReactComponent as BlueCheckMark } from "../../assets/svg/blue-check-mark.svg";
import { utilService } from "../../services/util.service/utils.service";

type UserPreviewModalProps = {
  user: MiniUser;
  userPreviewModalPosition?: any;
  onToggleFollow: () => void;
  onNavigateToProfile?: () => void;
};

export const UserPreviewModal: FC<UserPreviewModalProps> = ({
  user,
  userPreviewModalPosition,
  onToggleFollow,
  onNavigateToProfile,
}) => {
  const { loggedinUser } = useSelector((state: RootState) => state.authModule);

  const followingStats = [
    { title: "Followers", count: user.followersCount },
    { title: "Following", count: user.followingCount },
  ];

  return (
    <section className="user-preview-modal" style={userPreviewModalPosition}>
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
          <div key={idx}>
            <p className="post-preview-modal-user-info-following-stats-text">
              <span className="post-preview-modal-user-info-following-stats-item-count ">
                {utilService.formatNumToK(stat.count)}
              </span>
              <span className="post-preview-modal-user-info-following-stats-item-title">
                {stat.title}
              </span>
            </p>
          </div>
        ))}
      </div>

      <div style={{ backgroundColor: "yellow" }}>
        {" TODO: add user's that loggedinUser follows that also follow this user"}
      </div>
    </section>
  );
};
