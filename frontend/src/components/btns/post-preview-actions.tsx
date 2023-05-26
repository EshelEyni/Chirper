import { Post } from "../../../../shared/interfaces/post.interface";
import { AiOutlineRetweet } from "react-icons/ai";
import { FiUpload } from "react-icons/fi";
import { RiBarChartGroupedFill } from "react-icons/ri";
import { FaRegHeart } from "react-icons/fa";
import { utilService } from "../../services/util.service/utils.service";
import { FaRegComment } from "react-icons/fa";

interface PostPreviewActionsProps {
  post: Post;
}

export const PostPreviewActions: React.FC<PostPreviewActionsProps> = ({ post }) => {
  const iconClassName = "icon";
  const btns = [
    {
      name: "comment",
      icon: <FaRegComment className={iconClassName} />,
      count: post.commentSum,
    },
    {
      name: "rechirp",
      icon: <AiOutlineRetweet className={iconClassName} />,
      count: post.rechirps,
    },
    {
      name: "like",
      icon: <FaRegHeart className={iconClassName} />,
      count: post.likes,
    },
    {
      name: "view",
      icon: <RiBarChartGroupedFill className={iconClassName} />,
      count: post.views,
    },
    {
      name: "share",
      icon: <FiUpload className={iconClassName} />,
      count: 0,
    },
  ];
  return (
    <div className="post-preview-action-btns">
      {btns.map((btn, idx) => {
        const { name, icon, count } = btn;
        return (
          <button key={idx} className={"btn-action " + name}>
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
