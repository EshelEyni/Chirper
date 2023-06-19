import { FC, useState } from "react";
import { MiniUser } from "../../../../shared/interfaces/user.interface";

type BtnToggleFollowProps = {
  user: MiniUser;
  onToggleFollow: () => void;
};

export const BtnToggleFollow: FC<BtnToggleFollowProps> = ({ user, onToggleFollow }) => {
  const [isHoverBtn, setIsHoverBtn] = useState(false);

  return (
    <button
      className={
        "btn-toggle-follow" +
        (user.isFollowing ? " btn-toggle-follow-following" : "") +
        (isHoverBtn ? " btn-toggle-follow-hover" : "")
      }
      onClick={onToggleFollow}
      onMouseEnter={() => setIsHoverBtn(true)}
      onMouseLeave={() => setIsHoverBtn(false)}
    >
      {user.isFollowing ? (isHoverBtn ? "Unfollow" : "Following") : "Follow"}
    </button>
  );
};
