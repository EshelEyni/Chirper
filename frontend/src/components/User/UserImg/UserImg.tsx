import userService from "../../../services/user.service";
import "./UserImg.scss";

interface UserImgProps {
  imgUrl: string | null | undefined;
  size?: number;
  onNavigateToProfile?: () => void;
}

export const UserImg: React.FC<UserImgProps> = ({ imgUrl, onNavigateToProfile }) => {
  return (
    <div className="user-img-container" onClick={onNavigateToProfile}>
      <img
        className="user-img"
        src={imgUrl || userService.getDefaultUserImgUrl()}
        alt="profile-img"
      />
    </div>
  );
};
