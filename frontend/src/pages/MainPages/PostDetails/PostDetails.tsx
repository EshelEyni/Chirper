import { Outlet, useParams } from "react-router-dom";
import { useQueryPostById } from "../../../hooks/reactQuery/post/useQueryPostById";
import { PostPreview } from "../../../components/Post/PostPreview/PostPreview/PostPreview";
import { PostPreviewProvider } from "../../../contexts/PostPreviewContext";

const PostDetails = () => {
  const params = useParams<{ id: string }>();
  const { post, isLoading, isSuccess, isError } = useQueryPostById(params.id || "");

  return (
    <div style={{ width: "600px", overflow: "hidden" }}>
      <h1>Post Details Page</h1>
      {isLoading && <p>Loading...</p>}
      {isSuccess && post && (
        <PostPreviewProvider post={post} key={`${post.id}-${post.createdAt}`}>
          <PostPreview />
        </PostPreviewProvider>
      )}
      {isError && <p>Something went wrong</p>}
      <Outlet />
    </div>
  );
};

export default PostDetails;
