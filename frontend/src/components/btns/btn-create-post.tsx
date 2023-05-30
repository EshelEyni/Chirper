import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { AppDispatch } from "../../store/types";
import { setNewPostType } from "../../store/actions/post.actions";

interface BtnCreatePostProps {
  isSideBarBtn: boolean;
  isDisabled: boolean;
  onAddPost?: () => void;
  btnText?: string;
}

export const BtnCreatePost: React.FC<BtnCreatePostProps> = ({
  isSideBarBtn,
  isDisabled,
  onAddPost = null,
  btnText = "Chirp",
}) => {
  const navigate = useNavigate();
  const dispatch: AppDispatch = useDispatch();
  const onClickBtn = () => {
    if (isSideBarBtn) {
      dispatch(setNewPostType("side-bar"));
      navigate("/compose");
    } else {
      if (isDisabled) return;
      onAddPost && onAddPost();
    }
  };

  return (
    <button
      className={"btn-create-post" + (!isSideBarBtn && isDisabled ? " disabled" : "")}
      onClick={onClickBtn}
    >
      {btnText}
    </button>
  );
};
