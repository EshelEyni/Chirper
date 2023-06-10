import { userService } from "../../services/user.service";

interface UserImgProps {
  imgUrl: string | null;
  size?: number;
}

export const UserImg: React.FC<UserImgProps> = ({ imgUrl }) => {
  return (
    <div className="user-img-container">
      <img
        className="user-img"
        src={imgUrl || userService.getDefaultUserImgUrl()}
        alt="profile-img"
      />
    </div>
  );
};
