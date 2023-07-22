import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Post, PostStats } from "../../../../../shared/interfaces/post.interface";
import { RootState } from "../../../store/store";
import { AppDispatch } from "../../../store/types";
import { clearPost, getPost } from "../../../store/actions/post.actions";
import { postService } from "../../../services/post.service";
import { FaRegComment, FaRegHeart } from "react-icons/fa";
import { AiOutlineRetweet } from "react-icons/ai";
import { GoInfo } from "react-icons/go";
import "./PostStats.scss";
import { ContentLoader } from "../../../components/Loaders/ContentLoader/ContentLoader";
import { PostStatsInfoModal } from "../../../components/Modals/PostStatInfoModal/PostStatInfoModal";
import { PostStatsPreviewContent } from "../../../components/Post/MiniPostPreview/PostStatsPreviewContent/PostStatsPreviewContent";
import { MiniPostPreview } from "../../../components/Post/MiniPostPreview/MiniPostPreview/MiniPostPreview";
import { BtnClose } from "../../../components/Btns/BtnClose/BtnClose";
import { MainScreen } from "../../../components/App/MainScreen/MainScreen";

export const PostStatsPage = () => {
  // State
  const { loggedinUser } = useSelector((state: RootState) => state.authModule);
  const { post } = useSelector((state: RootState) => state.postModule);
  const [postStats, setPostStats] = useState<PostStats | null>(null);
  const [isLoggedinUserPost, setIsLoggedinUserPost] = useState(false);
  const [openedModal, setOpenedModal] = useState<string>("");

  // Hooks
  const navigate = useNavigate();
  const params = useParams();
  const dispatch: AppDispatch = useDispatch();
  const { id } = params as { id: string };

  const postActionStats = [
    { name: "replies", icon: <FaRegComment />, count: postStats?.repliesCount },
    { name: "reposts", icon: <AiOutlineRetweet />, count: postStats?.repostCount },
    { name: "likes", icon: <FaRegHeart />, count: postStats?.likesCount },
  ];

  const postStatsData = [
    {
      name: "Impressions",
      count: postStats?.isViewedCount,
      grid: { row: 1, column: 1 },
      desc: "Times this Chirp was seen on Chirper",
    },
    {
      name: "Engagements",
      count: postStats?.engagementCount,
      grid: { row: 1, column: 2 },
      desc: "Total number of times a user has interacted with a Chirp. This includes all clicks anywhere on the Chirp (including hashtags, links, avatar, username, and Chirp expansion), reChirps, replies, follows, and likes.",
    },
    {
      name: "New followers",
      count: postStats?.isFollowedFromPostCount,
      grid: { row: 1, column: 3 },
      desc: "Follows gained directly from this Chirp",
    },
    {
      name: "Link clicks",
      count: postStats?.isLinkClickedCount,
      grid: { row: 2, column: 2 },
      desc: "Number of clicks on any URL in this Chirp",
    },
    {
      name: "Detail expands",
      count: postStats?.isDetailedViewedCount,
      grid: { row: 2, column: 3 },
      desc: "Times people viewed the details about this Chirp",
    },
    {
      name: "Profile visits",
      count: postStats?.isProfileViewedCount,
      grid: { row: 3, column: 2 },
      desc: "Number of profile views from this Chirp",
    },
  ];

  useEffect(() => {
    if (post?.id !== id) dispatch(getPost(id));

    return () => {
      setOpenedModal("");
    };
  }, []);

  useEffect(() => {
    if (loggedinUser && post) {
      const isLoggedinUserPost = loggedinUser.id === post.createdBy.id;
      setIsLoggedinUserPost(isLoggedinUserPost);
      if (isLoggedinUserPost) fetchPostStats();
    }
  }, [post]);

  const fetchPostStats = async () => {
    const stats = await postService.getPostStats(id);
    setPostStats(stats);
  };

  const onGoBack = () => {
    dispatch(clearPost());
    navigate("/");
  };

  const onOpenModal = (name: string) => {
    setOpenedModal(name);
  };

  const onCloseModal = () => {
    setOpenedModal("");
  };

  return (
    <section className="post-stats">
      <MainScreen onClickFn={onGoBack} mode="dark" />
      <main className="post-stats-body">
        <BtnClose onClickBtn={onGoBack} />
        <div className="post-stats-main-container">
          {!post ? (
            <ContentLoader />
          ) : !isLoggedinUserPost ? (
            <div className="not-logged-in-user-post-msg">
              <div className="not-logged-in-user-post-msg-text">
                <h1>Views</h1>
                <p>Times this Chirp was seen.</p>
              </div>
              <button className="btn-go-back" onClick={onGoBack}>
                Dismiss
              </button>
            </div>
          ) : (
            <div className="post-stats-content">
              <MiniPostPreview post={post!} type="post-stats-preview">
                {({ post }: { post: Post }) => <PostStatsPreviewContent post={post} />}
              </MiniPostPreview>
              {postStats ? (
                <>
                  <div className="post-action-stats">
                    {postActionStats.map(action => (
                      <div className="post-action-stats-item" key={action.name}>
                        {action.icon}
                        <span className="post-action-stats-item-count">{action.count}</span>
                      </div>
                    ))}
                  </div>
                  <div className="post-stats-data">
                    {postStatsData.map(data => {
                      const { name, count, desc, grid } = data;
                      const { row, column } = grid;
                      return (
                        <div
                          className="post-stats-data-item"
                          key={name}
                          style={{ gridColumn: column, gridRow: row }}
                        >
                          <div className="post-stats-data-item-title">
                            <span className="post-stats-data-item-name">{name}</span>
                            <div className="btn-post-stats-data-item-info-container">
                              {openedModal === name && (
                                <PostStatsInfoModal
                                  onCloseModal={onCloseModal}
                                  name={name}
                                  desc={desc}
                                />
                              )}
                              <GoInfo onClick={() => onOpenModal(name)} />
                            </div>
                          </div>
                          <h1 className="post-stats-data-item-count">{count}</h1>
                        </div>
                      );
                    })}
                  </div>
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
