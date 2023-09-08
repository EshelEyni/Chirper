import { FC, useState } from "react";
import { User } from "../../../../../shared/types/user.interface";
import "./BtnToggleFollow.scss";

type BtnToggleFollowProps = {
  user: User;
  handleBtnClick: () => void;
};

export const BtnToggleFollow: FC<BtnToggleFollowProps> = ({ user, handleBtnClick }) => {
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
      onClick={handleBtnClick}
      onMouseEnter={() => setIsHoverBtn(true)}
      onMouseLeave={() => setIsHoverBtn(false)}
    >
      {btnText}
    </button>
  );
};
