import { PostList } from "../../../components/Post/PostList/PostList";
import { SpinnerLoader } from "../../../components/Loaders/SpinnerLoader/SpinnerLoader";
import { useQueryPosts } from "../../../hooks/post/useQueryPost";
import "./PostListContainer.scss";
import { ErrorMsg } from "../../Msg/ErrorMsg/ErrorMsg";

export const PostListContainer = () => {
  const { posts, isLoading, isSuccess, isError } = useQueryPosts();
  const isPostsEmpty = posts && posts.length === 0;

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
