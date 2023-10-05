import { Outlet, useParams } from "react-router-dom";
import { PostPreview } from "../../components/Post/PostPreview/PostPreview";
import { PostPreviewProvider } from "../../contexts/PostPreviewContext";
import { useQueryPostById } from "../../hooks/useQueryPostById";

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
