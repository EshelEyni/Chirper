import { useNavigate } from "react-router-dom";
import { PostEdit } from "../../components/post/post-edit";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../../store/types";
import { setNewPostType, setNewPosts } from "../../store/actions/new-post.actions";
import { RootState } from "../../store/store";

export const ComposePage = () => {
  const navigate = useNavigate();
  const dispatch: AppDispatch = useDispatch();
  const { newPostType } = useSelector((state: RootState) => state.newPostModule);

  const onGoBack = async () => {
    if (newPostType === "side-bar") {
      await dispatch(setNewPosts([], "side-bar"));
      await dispatch(setNewPostType("home-page"));
    } else {
      await dispatch(setNewPosts([], "home-page"));
    }
    navigate(-1);
  };

  return (
    <main className="compose">
      <div className="main-screen dark" onClick={onGoBack}></div>
      <PostEdit onClickBtnClose={onGoBack} />
    </main>
  );
};
