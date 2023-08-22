import { AiOutlineRetweet } from "react-icons/ai";
import { FiUpload } from "react-icons/fi";
import { RiBarChartGroupedFill } from "react-icons/ri";
import { FaRegHeart, FaHeart } from "react-icons/fa";
import { FaRegComment } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { AppDispatch } from "../../../../store/types";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../../store/store";
import { useState } from "react";
// import { useModalPosition } from "../../../../hooks/app/useModalPosition";
import { PostPreviewActionBtn } from "./PostPreviewActionBtn/PostPreviewActionBtn";
import "./PostPreviewActions.scss";
import { usePostPreview } from "../../../../contexts/PostPreviewContext";
import { NewPostType, setNewPostType, setNewPosts } from "../../../../store/slices/postEditSlice";
import { useCreateRepost } from "../../../../hooks/reactQuery/post/useCreateRepost";
import { useRemoveRepost } from "../../../../hooks/reactQuery/post/useRemoveRepost";
import { useAddLike } from "../../../../hooks/reactQuery/post/useAddLike";
import { useRemoveLike } from "../../../../hooks/reactQuery/post/useRemoveLike";
import { PostShareActionBtn } from "./PostShareActionBtn/PostShareActionBtn";

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
  // const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const navigate = useNavigate();
  const dispatch: AppDispatch = useDispatch();
  const { loggedInUser } = useSelector((state: RootState) => state.auth);
  const { addRepost } = useCreateRepost();
  const { removeRepost } = useRemoveRepost();
  const { addLike } = useAddLike();
  const { removeLike } = useRemoveLike();

  // const { elementRef, isModalAbove, updateModalPosition } = useModalPosition<HTMLButtonElement>({
  //   modalHeight: 175,
  // });

  const btns: PostPreviewActionBtn[] = [
    {
      name: "reply",
      title: "Reply",
      icon: <FaRegComment />,
      count: post.repliesCount,
      onClickFunc: async () => {
        dispatch(setNewPostType(NewPostType.Reply));
        dispatch(setNewPosts({ newPosts: [], newPostType: NewPostType.Reply, post }));
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
        if (isLiked) removeLike(post.id);
        else addLike(post.id);
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
        // updateModalPosition();
        // setIsShareModalOpen(prev => !prev);
      },
    },
  ];

  async function onRepost() {
    const repostedPost = { ...post };
    addRepost(repostedPost);
    setIsRepostModalOpen(prev => !prev);
  }

  async function onRemoveRepost() {
    if (!loggedInUser) return;
    removeRepost(post.id);
    setIsRepostModalOpen(prev => !prev);
  }

  async function onQuotePost() {
    setIsRepostModalOpen(prev => !prev);
    dispatch(setNewPostType(NewPostType.Quote));
    dispatch(setNewPosts({ newPosts: [], newPostType: NewPostType.Quote, post }));
    navigate("compose", { relative: "path" });
  }

  return (
    <div className="post-preview-action-btns">
      {btns.map((btn, idx) => {
        if (btn.name === "share") return <PostShareActionBtn key={idx} btn={btn} post={post} />;

        return (
          <PostPreviewActionBtn
            key={idx}
            btn={btn}
            // btnRef={elementRef}
            isRepostModalOpen={isRepostModalOpen}
            setIsRepostModalOpen={setIsRepostModalOpen}
            onRepost={onRepost}
            onRemoveRepost={onRemoveRepost}
            onQuotePost={onQuotePost}
            isReposted={isReposted}
          />
        );
      })}
    </div>
  );
};
