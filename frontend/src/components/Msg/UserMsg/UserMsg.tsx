import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../store/store";
import { AppDispatch } from "../../../store/types";
import "./UserMsg.scss";

export const UserMsg = () => {
  // State
  const { userMsg } = useSelector((state: RootState) => state.systemModule);

  // Hooks
  const dispatch: AppDispatch = useDispatch();
  if (!userMsg) return null;
  const { text, type, link } = userMsg;
  const handleLinkClick = () => {
    dispatch({ type: "SET_USER_MSG", userMsg: null });
  };
  return (
    <div className={"user-msg " + type}>
      <p>{text}</p>
      {link && (
        <Link to={link} className="user-msg-link" onClick={handleLinkClick}>
          View
        </Link>
      )}
    </div>
  );
};
