import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { AppDispatch } from "../../../store/types";
import "./BtnCreatePost.scss";
import { NewPostType, setNewPostType } from "../../../store/slices/postEditSlice";

export type BtnCreatePostTitle = "Chirp" | "Chirp All" | "Schedule" | "Reply";

interface BtnCreatePostProps {
  isSideBarBtn: boolean;
  isDisabled: boolean;
  onAddPost?: () => void;
  title?: BtnCreatePostTitle;
}

export const BtnCreatePost: React.FC<BtnCreatePostProps> = ({
  isSideBarBtn,
  isDisabled = false,
  onAddPost = null,
  title = "Chirp",
}) => {
  const navigate = useNavigate();
  const dispatch: AppDispatch = useDispatch();

  function onClickBtn() {
    if (isSideBarBtn) {
      dispatch(setNewPostType(NewPostType.SideBar));
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
      {title}
    </button>
  );
};
