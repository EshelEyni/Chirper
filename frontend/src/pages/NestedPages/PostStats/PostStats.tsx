import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { PostStats } from "../../../../../shared/interfaces/post.interface";
import { RootState } from "../../../store/store";
import { AppDispatch } from "../../../store/types";
import { clearPost, getPost } from "../../../store/actions/post.actions";
import postService from "../../../services/post.service";
import "./PostStats.scss";
import { ContentLoader } from "../../../components/Loaders/ContentLoader/ContentLoader";
import { PostStatsPreviewContent } from "../../../components/Post/PostPreview/MiniPostPreview/PostStatsPreviewContent/PostStatsPreviewContent";
import { MiniPostPreview } from "../../../components/Post/PostPreview/MiniPostPreview/MiniPostPreview";
import { BtnClose } from "../../../components/Btns/BtnClose/BtnClose";
import { MainScreen } from "../../../components/App/MainScreen/MainScreen";
import { getBasePathName } from "../../../services/util/utils.service";
import { PostsStatsNonOwnerMsg } from "./NonOwnerMsg/PostsStatsNonOwnerMsg";
import { PostStatsActionStatsList } from "./ActionStatsList/PostStatsActionStatsList";
import { PostStatsDataStatsList } from "./DataStatsList/PostStatsDataStatsList";

const PostStatsPage = () => {
  const [postStats, setPostStats] = useState<PostStats | null>(null);
  const [isLoggedinUserPost, setIsLoggedinUserPost] = useState(false);
  const [openedModal, setOpenedModal] = useState<string>("");

  const { loggedinUser } = useSelector((state: RootState) => state.authModule);
  const { post } = useSelector((state: RootState) => state.postModule);

  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();
  const dispatch: AppDispatch = useDispatch();
  const { id } = params as { id: string };

  const fetchPostStats = useCallback(async () => {
    const stats = await postService.getPostStats(id);
    setPostStats(stats);
  }, [id]);

  function onGoBack() {
    dispatch(clearPost());
    const basePath = getBasePathName(location.pathname, "post-stats");
    navigate(basePath);
  }

  useEffect(() => {
    if (post?.id !== id) dispatch(getPost(id));
    return () => {
      setOpenedModal("");
    };
  }, [dispatch, id, post?.id]);

  useEffect(() => {
    if (loggedinUser && post) {
      const isLoggedinUserPost = loggedinUser.id === post.createdBy.id;
      setIsLoggedinUserPost(isLoggedinUserPost);
      if (isLoggedinUserPost) fetchPostStats();
    }
  }, [post, loggedinUser, dispatch, fetchPostStats]);

  return (
    <section className="post-stats">
      <MainScreen onClickFn={onGoBack} mode="dark" />
      <main className="post-stats-body">
        <BtnClose onClickBtn={onGoBack} />
        <div className="post-stats-main-container">
          {!post ? (
            <ContentLoader />
          ) : !isLoggedinUserPost ? (
            <PostsStatsNonOwnerMsg onGoBack={onGoBack} />
          ) : (
            <div className="post-stats-content">
              <MiniPostPreview post={post!} type="post-stats-preview">
                <PostStatsPreviewContent post={post} />
              </MiniPostPreview>
              {postStats ? (
                <>
                  <PostStatsActionStatsList postStats={postStats} />
                  <PostStatsDataStatsList
                    postStats={postStats}
                    openedModal={openedModal}
                    setOpenedModal={setOpenedModal}
                  />
                </>
              ) : (
                <ContentLoader />
              )}
            </div>
          )}
        </div>
      </main>
    </section>
  );
};

export default PostStatsPage;
