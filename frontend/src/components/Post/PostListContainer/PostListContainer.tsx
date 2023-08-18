import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../store/store";
import { AppDispatch } from "../../../store/types";
import { PostList } from "../../../components/Post/PostList/PostList";
import { SpinnerLoader } from "../../../components/Loaders/SpinnerLoader/SpinnerLoader";
import { setPosts } from "../../../store/slices/postSlice";
import { useQueryPosts } from "../../../hooks/useQueryPost";
import { useEffect } from "react";
import "./PostListContainer.scss";
import { ErrorMsg } from "../../Msg/ErrorMsg/ErrorMsg";

export const PostListContainer = () => {
  const dispatch: AppDispatch = useDispatch();
  const { posts } = useSelector((state: RootState) => state.postModule);
  const { posts: fechedPosts, isLoading, isSuccess, isError } = useQueryPosts();
  const isPostsEmpty = fechedPosts && fechedPosts.length === 0;

  useEffect(() => {
    if (fechedPosts) dispatch(setPosts(fechedPosts));
  }, [fechedPosts, dispatch]);

  return (
    <div className="post-list-container">
      {isLoading && <SpinnerLoader />}
      {isSuccess && !isPostsEmpty && <PostList posts={posts} />}
      {isSuccess && isPostsEmpty && <p className="no-res-msg">no posts to show</p>}
      {isError && <ErrorMsg msg={"Couldn't get post. Please try again later."} />}
    </div>
  );
};

// Path: src\components\Post\PostListContainer\PostListContainer.tsx
