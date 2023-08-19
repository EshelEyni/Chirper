import React from "react";
import "./PostImgPage.scss";
import { useParams } from "react-router-dom";
import { useQueryPostById } from "../../../hooks/post/useQueryPostById";
import { useGoBack } from "../../../hooks/app/useGoBack";

const PostImgPage = () => {
  const params = useParams();
  const idx = Number(params.idx);
  const [currImgIdx, setCurrImgIdx] = React.useState(idx || 0);
  const { post, isLoading, isSuccess, isError } = useQueryPostById(params.id || "");
  const { goBack } = useGoBack("post");

  return (
    <>
      <main className="post-img-page" onClick={goBack}>
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
