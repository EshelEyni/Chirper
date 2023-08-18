import { Outlet, useParams } from "react-router-dom";
import { useQueryPostById } from "../../../hooks/post/useQueryPostById";

const PostDetails = () => {
  const params = useParams<{ id: string }>();
  const { post, isLoading, isSuccess, isError } = useQueryPostById(params.id || "");

  return (
    <div style={{ width: "600px", overflow: "hidden" }}>
      <h1>Post Details Page</h1>
      {isLoading && <p>Loading...</p>}
      {isSuccess && post && <pre>{JSON.stringify(post, null, 2)}</pre>}
      {isError && <p>Something went wrong</p>}
      <Outlet />
    </div>
  );
};

export default PostDetails;
