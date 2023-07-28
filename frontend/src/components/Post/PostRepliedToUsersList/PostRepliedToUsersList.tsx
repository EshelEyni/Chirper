import { Link } from "react-router-dom";
import { repliedPostDetails } from "../../../../../shared/interfaces/post.interface";
import "./PostRepliedToUsersList.scss";
import { useMemo } from "react";

type PostRepliedToUsersListProps = {
  repliedPostDetails: repliedPostDetails[];
};

export const PostRepliedToUsersList: React.FC<PostRepliedToUsersListProps> = ({
  repliedPostDetails,
}) => {
  const uniqueRepliedPostDetails = useMemo(() => {
    const usernames = new Set();
    return repliedPostDetails.filter(item => {
      if (usernames.has(item.postOwner.username)) return false;
      usernames.add(item.postOwner.username);
      return true;
    });
  }, [repliedPostDetails]);

  return (
    <div className="replying-to-list-container">
      <span>Replying to </span>
      {uniqueRepliedPostDetails.map(details => {
        const { postOwner } = details;
        return (
          <Link
            to={`/profile/${postOwner.userId}`}
            key={postOwner.userId}
            className="reply-to-user-link"
          >
            {`@${postOwner.username}`}
          </Link>
        );
      })}
    </div>
  );
};
