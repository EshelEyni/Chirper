import { Link } from "react-router-dom";
import { repliedPostDetails } from "../../../../../shared/interfaces/post.interface";

type PostRepliedToUsersListProps = {
  repliedPostDetails: repliedPostDetails[];
};

export const PostRepliedToUsersList: React.FC<PostRepliedToUsersListProps> = ({
  repliedPostDetails,
}) => {
  const usernames = new Set();
  const uniqueRepliedPostDetails = repliedPostDetails.filter(item => {
    if (!usernames.has(item.postOwner.username)) {
      usernames.add(item.postOwner.username);
      return true;
    }
    return false;
  });

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
