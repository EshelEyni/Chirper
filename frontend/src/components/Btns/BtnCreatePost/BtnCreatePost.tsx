import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { AppDispatch } from "../../../store/types";
import { setNewPostType } from "../../../store/actions/new-post.actions";
import "./BtnCreatePost.scss";
import { NewPostType } from "../../../store/reducers/new-post.reducer";

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

  async function onClickBtn() {
    if (isSideBarBtn) {
      await dispatch(setNewPostType(NewPostType.SideBar));
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
