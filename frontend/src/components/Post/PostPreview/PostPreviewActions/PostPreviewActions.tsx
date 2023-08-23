import { AiOutlineRetweet } from "react-icons/ai";
import { FiUpload } from "react-icons/fi";
import { RiBarChartGroupedFill } from "react-icons/ri";
import { FaRegHeart, FaHeart } from "react-icons/fa";
import { FaRegComment } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { AppDispatch } from "../../../../store/types";
import { useDispatch } from "react-redux";
import { PostPreviewActionBtn } from "./PostPreviewActionBtn/PostPreviewActionBtn";
import { usePostPreview } from "../../../../contexts/PostPreviewContext";
import { NewPostType, setNewPostType, setNewPosts } from "../../../../store/slices/postEditSlice";
import { useAddLike } from "../../../../hooks/reactQuery/post/useAddLike";
import { useRemoveLike } from "../../../../hooks/reactQuery/post/useRemoveLike";
import { PostShareActionBtn } from "./PostShareActionBtn/PostShareActionBtn";
import { RepostActionBtn } from "./RepostActionBtn/RepostActionBtn";
import "./PostPreviewActions.scss";

export type PostPreviewActionBtn = {
  name: string;
  title: string;
  icon: JSX.Element;
  count?: number;
  onClickFunc?: () => void;
  isClicked?: boolean;
};

export const PostPreviewActions: React.FC = () => {
  const { post } = usePostPreview();
  const { isReposted, isLiked } = post.loggedInUserActionState;

  const navigate = useNavigate();
  const dispatch: AppDispatch = useDispatch();

  const { addLike } = useAddLike();
  const { removeLike } = useRemoveLike();

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
    },
  ];

  return (
    <div className="post-preview-action-btns">
      {btns.map((btn, idx) => {
        if (btn.name === "share") return <PostShareActionBtn key={idx} btn={btn} post={post} />;

        if (btn.name === "rechirp") return <RepostActionBtn key={idx} btn={btn} post={post} />;

        return <PostPreviewActionBtn key={idx} btn={btn} />;
      })}
    </div>
  );
};
