import { Post } from "../../../../shared/interfaces/post.interface";
import { AiOutlineRetweet } from "react-icons/ai";
import { FiUpload } from "react-icons/fi";
import { RiBarChartGroupedFill } from "react-icons/ri";
import { FaRegHeart, FaHeart } from "react-icons/fa";
import { FaRegComment } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import { AppDispatch } from "../../store/types";
import { useDispatch, useSelector } from "react-redux";
import { setNewPostType, setNewPosts } from "../../store/actions/new-post.actions";
import { RootState } from "../../store/store";
import { addLike, removeLike, removeRepost, repostPost } from "../../store/actions/post.actions";
import { useState } from "react";
import { useModalPosition } from "../../hooks/useModalPosition";
import { PostPreviewActionBtn } from "./post-preview-action-btn";

interface PostPreviewActionsProps {
  post: Post;
}

export type PostPreviewActionBtn = {
  name: string;
  title: string;
  icon: JSX.Element;
  count?: number;
  onClickFunc: () => void;
  isClicked?: boolean;
};

export const PostPreviewActions: React.FC<PostPreviewActionsProps> = ({ post }) => {
  // Props
  const { isReposted, isLiked } = post.loggedinUserActionState;

  // State
  const { loggedinUser } = useSelector((state: RootState) => state.authModule);
  const [isRepostModalOpen, setIsRepostModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Hooks
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch: AppDispatch = useDispatch();

  const { elementRef, isModalAbove, updateModalPosition } = useModalPosition<HTMLButtonElement>({
    modalHeight: 175,
  });

  const iconClassName = "icon";
  const btns: PostPreviewActionBtn[] = [
    {
      name: "reply",
      title: "Reply",
      icon: <FaRegComment className={iconClassName} />,
      count: post.repliesCount,
      onClickFunc: async () => {
        await dispatch(setNewPostType("reply"));
        await dispatch(setNewPosts([], "reply", post));
        const currPathName = location.pathname === "/" ? "" : location.pathname;
        navigate(`${currPathName}/compose`);
      },
    },
    {
      name: "rechirp",
      title: isReposted ? "Undo Rechirp" : "Rechirp",
      icon: <AiOutlineRetweet className={iconClassName} />,
      count: post.repostsCount,
      isClicked: isReposted,
      onClickFunc: () => {
        setIsRepostModalOpen(prev => !prev);
      },
    },
    {
      name: "like",
      title: isLiked ? "Unlike" : "Like",
      icon: isLiked ? (
        <FaHeart className={iconClassName} />
      ) : (
        <FaRegHeart className={iconClassName} />
      ),
      count: post.likesCount,
      isClicked: isLiked,
      onClickFunc: () => {
        if (isLiked) {
          dispatch(removeLike(post.id));
        } else {
          dispatch(addLike(post.id));
        }
      },
    },
    {
      name: "view",
      title: "View",
      icon: <RiBarChartGroupedFill className={iconClassName} />,
      count: post.viewsCount,
      onClickFunc: () => {
        navigate(`/post-stats/${post.id}`);
      },
    },
    {
      name: "share",
      title: "Share",
      icon: <FiUpload className={iconClassName} />,
      onClickFunc: () => {
        updateModalPosition();
        setIsShareModalOpen(prev => !prev);
      },
    },
  ];

  const onRepost = async () => {
    const repostedPost = { ...post };
    await dispatch(repostPost(repostedPost));
    setIsRepostModalOpen(prev => !prev);
  };

  const onRemoveRepost = async () => {
    if (!loggedinUser) return;
    await dispatch(removeRepost(post.id, loggedinUser.id));
    setIsRepostModalOpen(prev => !prev);
  };

  const onQuotePost = async () => {
    setIsRepostModalOpen(prev => !prev);
    await dispatch(setNewPostType("quote"));
    await dispatch(setNewPosts([], "quote", post));
    const currPathName = location.pathname === "/" ? "" : location.pathname;
    navigate(`${currPathName}/compose`);
  };

  return (
    <div className="post-preview-action-btns">
      {btns.map((btn, idx) => {
        return (
          <PostPreviewActionBtn
            key={idx}
            btn={btn}
            btnRef={elementRef}
            post={post}
            isRepostModalOpen={isRepostModalOpen}
            setIsRepostModalOpen={setIsRepostModalOpen}
            isShareModalOpen={isShareModalOpen}
            setIsShareModalOpen={setIsShareModalOpen}
            onRepost={onRepost}
            onRemoveRepost={onRemoveRepost}
            onQuotePost={onQuotePost}
            isReposted={isReposted}
            isModalAbove={isModalAbove}
          />
        );
      })}
    </div>
  );
};
