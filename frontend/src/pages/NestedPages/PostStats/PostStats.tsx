import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../../store/store";
import { SpinnerLoader } from "../../../components/Loaders/SpinnerLoader/SpinnerLoader";
import { PostStatsPreviewContent } from "../../../components/Post/PostPreview/MiniPostPreview/PostStatsPreviewContent/PostStatsPreviewContent";
import { MiniPostPreview } from "../../../components/Post/PostPreview/MiniPostPreview/MiniPostPreview";
import { BtnClose } from "../../../components/Btns/BtnClose/BtnClose";
import { MainScreen } from "../../../components/App/MainScreen/MainScreen";
import { PostsStatsNonOwnerMsg } from "./NonOwnerMsg/PostsStatsNonOwnerMsg";
import { useQueryPostById } from "../../../hooks/post/useQueryPostById";
import { PostStatsDetails } from "./PostStatsDetails/PostStatsDetails";
import { ErrorMsg } from "../../../components/Msg/ErrorMsg/ErrorMsg";
import "./PostStats.scss";
import { useOutsideClick } from "../../../hooks/app/useOutsideClick";
import { useGoBack } from "../../../hooks/app/useGoBack";

const PostStatsPage = () => {
  const [isLoggedInUserPost, setIsLoggedInUserPost] = useState(false);

  const { loggedInUser } = useSelector((state: RootState) => state.auth);

  const params = useParams();
  const { id } = params as { id: string };
  const { post, isLoading, isSuccess, isError } = useQueryPostById(params.id || "");
  const { outsideClickRef } = useOutsideClick<HTMLElement>(onGoBack);
  const { goBack } = useGoBack("post-stats");

  function onGoBack() {
    goBack();
  }

  useEffect(() => {
    if (loggedInUser && post) {
      const isLoggedInUserPost = loggedInUser.id === post.createdBy.id;
      setIsLoggedInUserPost(isLoggedInUserPost);
    }
  }, [post, loggedInUser]);

  return (
    <section className="post-stats">
      <MainScreen mode="dark" />
      <main className="post-stats-body" ref={outsideClickRef}>
        <BtnClose onClickBtn={onGoBack} />
        <div className="post-stats-main-container">
          {isLoading && <SpinnerLoader />}
          {isError && <ErrorMsg msg="Couldn't get post. Please try again later." />}
          {isSuccess && !isLoggedInUserPost && <PostsStatsNonOwnerMsg onGoBack={onGoBack} />}
          {isSuccess && isLoggedInUserPost && (
            <div className="post-stats-content">
              <MiniPostPreview post={post!} type="post-stats-preview">
                <PostStatsPreviewContent post={post!} />
              </MiniPostPreview>
              <PostStatsDetails postId={id} />
            </div>
          )}
        </div>
      </main>
    </section>
  );
};

export default PostStatsPage;
