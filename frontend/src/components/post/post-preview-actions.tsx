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

interface PostPreviewActionsProps {
  post: Post;
}

type Btn = {
  name: string;
  icon: JSX.Element;
  count: number;
  onClickFunc: () => void;
};

export const PostPreviewActions: React.FC<PostPreviewActionsProps> = ({ post }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch: AppDispatch = useDispatch();

  const iconClassName = "icon";
  const btns: Btn[] = [
    {
      name: "comment",
      icon: <FaRegComment className={iconClassName} />,
      count: post.commentSum,
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
      count: post.rechirps,
      onClickFunc: () => {
        console.log("rechirp");
      },
    },
    {
      name: "like",
      icon: <FaRegHeart className={iconClassName} />,
      count: post.likes,
      onClickFunc: () => {
        console.log("like");
      },
    },
    {
      name: "view",
      icon: <RiBarChartGroupedFill className={iconClassName} />,
      count: post.views,
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
  return (
    <div className="post-preview-action-btns">
      {btns.map((btn, idx) => {
        const { name, icon, count, onClickFunc } = btn;
        return (
          <button key={idx} className={"btn-action " + name} onClick={onClickFunc}>
            <div className="icon-container">{icon}</div>
            {name != "share" && (
              <span className="count">{count > 0 ? utilService.formatCount(count) : ""}</span>
            )}
          </button>
        );
      })}
    </div>
  );
};
