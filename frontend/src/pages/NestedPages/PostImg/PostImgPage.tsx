import React from "react";
import "./PostImgPage.scss";
import { useNavigate, useParams } from "react-router-dom";
import { useQueryPostById } from "../../../hooks/reactQuery/post/useQueryPostById";

const PostImgPage = () => {
  const params = useParams();
  const idx = Number(params.idx);
  const [currImgIdx, setCurrImgIdx] = React.useState(idx || 0);
  const { post, isLoading, isSuccess, isError } = useQueryPostById(params.id || "");
  const navigate = useNavigate();

  function onGoBack() {
    navigate(-1);
  }

  return (
    <>
      <main className="post-img-page" onClick={onGoBack}>
        {isLoading && <p>Loading...</p>}
        {isSuccess && post && (
          <div className="post-img-container">
            <img className="post-img" src={post.imgs[currImgIdx - 1].url} alt="post-img" />
          </div>
        )}
        {isError && <p>Something went wrong</p>}
      </main>
    </>
  );
};

export default PostImgPage;
