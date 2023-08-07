import { AiOutlineRetweet } from "react-icons/ai";
import { FiUpload } from "react-icons/fi";
import { RiBarChartGroupedFill } from "react-icons/ri";
import { FaRegHeart, FaHeart } from "react-icons/fa";
import { FaRegComment } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { AppDispatch } from "../../../../store/types";
import { useDispatch, useSelector } from "react-redux";
import { setNewPostType, setNewPosts } from "../../../../store/actions/new-post.actions";
import { RootState } from "../../../../store/store";
import {
  addLike,
  removeLike,
  removeRepost,
  repostPost,
} from "../../../../store/actions/post.actions";
import { useState } from "react";
import { useModalPosition } from "../../../../hooks/useModalPosition";
import { PostPreviewActionBtn } from "./PostPreviewActionBtn/PostPreviewActionBtn";
import "./PostPreviewActions.scss";
import { NewPostType } from "../../../../store/reducers/new-post.reducer";
import { usePostPreview } from "../../../../contexts/PostPreviewContext";

export type PostPreviewActionBtn = {
  name: string;
  title: string;
  icon: JSX.Element;
  count?: number;
  onClickFunc: () => void;
  isClicked?: boolean;
};

export const PostPreviewActions: React.FC = () => {
  const { post } = usePostPreview();
  const { isReposted, isLiked } = post.loggedInUserActionState;
  const [isRepostModalOpen, setIsRepostModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const navigate = useNavigate();
  const dispatch: AppDispatch = useDispatch();
  const { loggedInUser } = useSelector((state: RootState) => state.auth);

  const { elementRef, isModalAbove, updateModalPosition } = useModalPosition<HTMLButtonElement>({
    modalHeight: 175,
  });

  const btns: PostPreviewActionBtn[] = [
    {
      name: "reply",
      title: "Reply",
      icon: <FaRegComment />,
      count: post.repliesCount,
      onClickFunc: async () => {
        await dispatch(setNewPostType(NewPostType.Reply));
        await dispatch(setNewPosts([], NewPostType.Reply, post));
        navigate("compose", { relative: "path" });
      },
    },
    {
      name: "rechirp",
      title: isReposted ? "Undo Rechirp" : "Rechirp",
      icon: <AiOutlineRetweet />,
      count: post.repostsCount,
      isClicked: isReposted,
      onClickFunc: () => {
        setIsRepostModalOpen(prev => !prev);
      },
    },
    {
      name: "like",
      title: isLiked ? "Unlike" : "Like",
      icon: isLiked ? <FaHeart /> : <FaRegHeart />,
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
      icon: <RiBarChartGroupedFill />,
      count: post.viewsCount,
      onClickFunc: () => {
        navigate(`post-stats/${post.id}`, { relative: "path" });
      },
    },
    {
      name: "share",
      title: "Share",
      icon: <FiUpload />,
      onClickFunc: () => {
        updateModalPosition();
        setIsShareModalOpen(prev => !prev);
      },
    },
  ];

  async function onRepost() {
    const repostedPost = { ...post };
    await dispatch(repostPost(repostedPost));
    setIsRepostModalOpen(prev => !prev);
  }

  async function onRemoveRepost() {
    if (!loggedInUser) return;
    await dispatch(removeRepost(post.id, loggedInUser.id));
    setIsRepostModalOpen(prev => !prev);
  }

  async function onQuotePost() {
    setIsRepostModalOpen(prev => !prev);
    await dispatch(setNewPostType(NewPostType.Quote));
    await dispatch(setNewPosts([], NewPostType.Quote, post));
    navigate("compose", { relative: "path" });
  }

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
