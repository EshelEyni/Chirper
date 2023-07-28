import { FC } from "react";
import { AiOutlineRetweet } from "react-icons/ai";
import { useSelector } from "react-redux";
import { RootState } from "../../../../../store/store";
import { repostedByDetails } from "../../../../../../../shared/interfaces/post.interface";
import "./RepostDisplay.scss";

type RepostDisplayProps = {
  repostedBy: repostedByDetails;
  onNavigateToPostDetails: () => void;
  onNavigateToProfile: (username: string) => void;
};

export const RepostDisplay: FC<RepostDisplayProps> = ({
  repostedBy,
  onNavigateToPostDetails,
  onNavigateToProfile,
}) => {
  const { loggedinUser } = useSelector((state: RootState) => state.authModule);

  return (
    <div className="post-preview-repost-container">
      <div className="repost-icon-container" onClick={onNavigateToPostDetails}>
        <AiOutlineRetweet size={18} />
      </div>
      <span
        className="post-preview-repost-user"
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        onClick={() => onNavigateToProfile(repostedBy!.username)}
      >
        {`${repostedBy.id === loggedinUser?.id ? "You" : repostedBy.fullname} Rechiped`}
      </span>
    </div>
  );
};
