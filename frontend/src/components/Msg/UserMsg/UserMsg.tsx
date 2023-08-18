import { FC } from "react";
import { Link } from "react-router-dom";
import { UserMsg as TypeOfUserMsg } from "../../../../../shared/interfaces/system.interface";
import "./UserMsg.scss";

type UserMsgProps = {
  userMsg: TypeOfUserMsg;
  onDismiss?: () => void;
};

export const UserMsg: FC<UserMsgProps> = ({ userMsg, onDismiss }) => {
  if (!userMsg) return null;
  const { text, type, link } = userMsg;

  return (
    <div className={"user-msg " + type}>
      <p>{text}</p>
      {link && (
        <Link to={link} className="user-msg-link" onClick={onDismiss}>
          View
        </Link>
      )}
    </div>
  );
};
