import { useEffect } from "react";
import { Outlet, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../../../store/types";
import { getPost } from "../../../store/actions/post.actions";
import { RootState } from "../../../store/store";

const PostDetails = () => {
  const { post } = useSelector((state: RootState) => state.postModule);
  const params = useParams<{ id: string }>();
  const dispatch: AppDispatch = useDispatch();

  useEffect(() => {
    const { id } = params;
    if (!id) return;
    dispatch(getPost(id));
  }, [dispatch, params]);

  return (
    <div style={{ width: "600px", overflow: "hidden" }}>
      <h1>Post Details Page</h1>
      {post && <pre>{JSON.stringify(post, null, 2)}</pre>}
      <Outlet />
    </div>
  );
};

export default PostDetails;
