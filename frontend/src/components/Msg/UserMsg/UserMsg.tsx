import { FC } from "react";
import { Link } from "react-router-dom";
import { UserMsg as TypeOfUserMsg } from "../../../../../shared/interfaces/system.interface";
import "./UserMsg.scss";

type UserMsgProps = {
  userMsg: TypeOfUserMsg;
  onDissmisToast?: () => void;
};

export const UserMsg: FC<UserMsgProps> = ({ userMsg, onDissmisToast }) => {
  if (!userMsg) return null;
  const { text, type, link, btn } = userMsg;

  return (
    <div className={"user-msg " + type}>
      <p>{text}</p>
      {link && (
        <Link to={link.url} className="user-msg-link" onClick={onDissmisToast}>
          {link.text || "View"}
        </Link>
      )}
      {btn && (
        <button
          className="user-msg-btn"
          onClick={() => {
            btn.fn();
            onDissmisToast?.();
          }}
        >
          {btn.text}
        </button>
      )}
    </div>
  );
};
