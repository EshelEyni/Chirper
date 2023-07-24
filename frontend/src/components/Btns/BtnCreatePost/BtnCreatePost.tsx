import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
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
  const dispatch: AppDispatch = useDispatch();

  async function onClickBtn() {
    if (isSideBarBtn) {
      await dispatch(setNewPostType("side-bar"));
      navigate("compose", { relative: "path" });
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
