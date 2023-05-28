import { useNavigate } from "react-router-dom";
import { PostEdit } from "../../components/post/post-edit";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../../store/types";
import { setNewPostType, setNewPosts } from "../../store/actions/post.actions";
import { RootState } from "../../store/store";
import { NewPostType } from "../../store/reducers/post.reducer";

export const ComposePage = () => {
  const navigate = useNavigate();
  const dispatch: AppDispatch = useDispatch();
  const {
    newPostType,
  }: {
    newPostType: NewPostType;
  } = useSelector((state: RootState) => state.postModule.newPostState);

  const onGoBack = () => {
    navigate(-1);
    setTimeout(() => {
      if (newPostType === "side-bar") {
        dispatch(setNewPosts([], "side-bar"));
        dispatch(setNewPostType("home-page"));
      } else {
        dispatch(setNewPosts([], "home-page"));
      }
    }, 250);
  };

  return (
    <main className="compose">
      <div className="main-screen dark" onClick={onGoBack}></div>
      <PostEdit onClickBtnClose={onGoBack} />
    </main>
  );
};
