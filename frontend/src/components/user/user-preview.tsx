import { MiniUser } from "../../../../shared/interfaces/user.interface";
import { IoEllipsisHorizontal } from "react-icons/io5";

interface UserPreviewProps {
  user: MiniUser;
  isEllipsisShown?: boolean;
}

export const UserPreview: React.FC<UserPreviewProps> = ({ user, isEllipsisShown }) => {
  if (!user) return <div></div>;
  return (
    <div className="user-preview">
      <div className="user-preview-main-container">
        <img src={user.imgUrl} alt="user-img" className="user-preview-img" />
        <div className="user-preview-info">
          <h3>{user.fullname}</h3>
          <p>@{user.username}</p>
        </div>
      </div>
      {isEllipsisShown && <IoEllipsisHorizontal />}
    </div>
  );
};
