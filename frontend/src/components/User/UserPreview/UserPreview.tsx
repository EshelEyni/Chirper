import { User } from "../../../../../shared/interfaces/user.interface";
import { IoEllipsisHorizontal } from "react-icons/io5";
import "./UserPreview.scss";

interface UserPreviewProps {
  user: User;
  isEllipsisShown?: boolean;
  onClickFunc?: () => void;
}

export const UserPreview: React.FC<UserPreviewProps> = ({ user, isEllipsisShown, onClickFunc }) => {
  if (!user) return <div></div>;
  return (
    <div className="user-preview" onClick={onClickFunc ? onClickFunc : undefined}>
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
