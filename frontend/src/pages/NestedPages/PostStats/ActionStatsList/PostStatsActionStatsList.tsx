import { FC } from "react";
import { AiOutlineRetweet } from "react-icons/ai";
import { FaRegComment, FaRegHeart } from "react-icons/fa";
import { PostStats } from "../../../../../../shared/types/post.interface";
import "./PostStatsActionStatsList.scss";

type PostStatsActionStatsListProps = {
  postStats: PostStats;
};

export const PostStatsActionStatsList: FC<PostStatsActionStatsListProps> = ({ postStats }) => {
  const postActionStats = [
    { name: "replies", icon: <FaRegComment />, count: postStats.repliesCount },
    { name: "reposts", icon: <AiOutlineRetweet />, count: postStats.repostCount },
    { name: "likes", icon: <FaRegHeart />, count: postStats.likesCount },
  ];

  return (
    <div className="post-action-stats">
      {postActionStats.map(action => (
        <div className="post-action-stats-item" key={action.name}>
          {action.icon}
          <span className="post-action-stats-item-count">{action.count}</span>
        </div>
      ))}
    </div>
  );
};
