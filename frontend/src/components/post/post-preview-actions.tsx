import { Post } from "../../../../shared/interfaces/post.interface";
import { AiOutlineRetweet } from "react-icons/ai";
import { FiUpload } from "react-icons/fi";
import { RiBarChartGroupedFill } from "react-icons/ri";
import { FaRegHeart } from "react-icons/fa";
import { utilService } from "../../services/util.service/utils.service";
import { FaRegComment } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import { AppDispatch } from "../../store/types";
import { useDispatch, useSelector } from "react-redux";
import { setNewPostType, setNewPosts } from "../../store/actions/new-post.actions";
import { RootState } from "../../store/store";
import { removeRepost, repostPost } from "../../store/actions/post.actions";
import { useState } from "react";
import { RepostOptionsModal } from "../modals/repost-options-modal";

interface PostPreviewActionsProps {
  post: Post;
}

type Btn = {
  name: string;
  icon: JSX.Element;
  count: number;
  onClickFunc: () => void;
  isClicked?: boolean;
};

export const PostPreviewActions: React.FC<PostPreviewActionsProps> = ({ post }) => {
  const { loggedinUser } = useSelector((state: RootState) => state.authModule);

  const navigate = useNavigate();
  const location = useLocation();
  const dispatch: AppDispatch = useDispatch();
  const { isReposted } = post.loggedinUserActionState;

  const [isRepostModalOpen, setIsRepostModalOpen] = useState(false);

  const iconClassName = "icon";
  const btns: Btn[] = [
    {
      name: "reply",
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
      icon: <AiOutlineRetweet className={iconClassName} />,
      count: post.repostsCount,
      isClicked: isReposted,
      onClickFunc: async () => {
        setIsRepostModalOpen(prev => !prev);
      },
    },
    {
      name: "like",
      icon: <FaRegHeart className={iconClassName} />,
      count: post.likesCount,
      onClickFunc: () => {
        console.log("like");
      },
    },
    {
      name: "view",
      icon: <RiBarChartGroupedFill className={iconClassName} />,
      count: post.viewsCount,
      onClickFunc: () => {
        console.log("view");
      },
    },
    {
      name: "share",
      icon: <FiUpload className={iconClassName} />,
      count: 0,
      onClickFunc: () => {
        console.log("share");
      },
    },
  ];

  const onRepost = async () => {
    const repostedPost = { ...post };
    await dispatch(repostPost(repostedPost));
    setIsRepostModalOpen(prev => !prev);
  };

  const onRemoveRepost = async () => {
    if (!loggedinUser) return console.log("no loggedin user");
    const repostedPost = { ...post };
    await dispatch(removeRepost(repostedPost, loggedinUser.id));
    setIsRepostModalOpen(prev => !prev);
  };

  return (
    <div className="post-preview-action-btns">
      {btns.map((btn, idx) => {
        const { name, icon, count, onClickFunc } = btn;
        return (
          <div className="btn-action-container" key={idx}>
            <button
              className={"btn-action " + name + (btn.isClicked ? " clicked" : "")}
              onClick={onClickFunc}
            >
              <div className="icon-container">{icon}</div>
              {name != "share" && (
                <span className="count">{count > 0 ? utilService.formatCount(count) : ""}</span>
              )}
            </button>

            {name === "rechirp" && isRepostModalOpen && (
              <RepostOptionsModal
                onToggleModal={() => setIsRepostModalOpen(prev => !prev)}
                onRepost={onRepost}
                onRemoveRepost={onRemoveRepost}
                isReposted={isReposted}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};
