import { useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { AppDispatch } from "../../../store/types";
import { setNewPostType } from "../../../store/actions/new-post.actions";
import "./BtnCreatePost.scss";

interface BtnCreatePostProps {
  isSideBarBtn: boolean;
  isDisabled: boolean;
  onAddPost?: () => void;
  btnText?: string;
}

export const BtnCreatePost: React.FC<BtnCreatePostProps> = ({
  isSideBarBtn,
  isDisabled = false,
  onAddPost = null,
  btnText = "Chirp",
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch: AppDispatch = useDispatch();
  async function onClickBtn() {
    if (isSideBarBtn) {
      await dispatch(setNewPostType("side-bar"));
      const currPathName = location.pathname === "/" ? "" : location.pathname;
      navigate(`${currPathName}/compose`);
    } else {
      onAddPost && onAddPost();
    }
  }

  return (
    <button
      className={"btn-create-post" + (!isSideBarBtn && isDisabled ? " disabled" : "")}
      onClick={onClickBtn}
      disabled={isDisabled}
    >
      {btnText}
    </button>
  );
};
