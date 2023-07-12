import { FC, useState } from "react";
import { MiniUser } from "../../../../shared/interfaces/user.interface";

type BtnToggleFollowProps = {
  user: MiniUser;
  onToggleFollow: () => void;
};

export const BtnToggleFollow: FC<BtnToggleFollowProps> = ({ user, onToggleFollow }) => {
  const [isHoverBtn, setIsHoverBtn] = useState(false);
  const { isFollowing } = user;
  const btnText = isFollowing ? (isHoverBtn ? "Unfollow" : "Following") : "Follow";
  return (
    <button
      className={
        "btn-toggle-follow" +
        (isFollowing ? " btn-toggle-follow-following" : "") +
        (isHoverBtn ? " btn-toggle-follow-hover" : "")
      }
      onClick={onToggleFollow}
      onMouseEnter={() => setIsHoverBtn(true)}
      onMouseLeave={() => setIsHoverBtn(false)}
    >
      {btnText}
    </button>
  );
};
