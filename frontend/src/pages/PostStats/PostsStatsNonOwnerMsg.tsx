import { FC } from "react";
import "./PostsStatsNonOwnerMsg.scss";

type PostsStatsNonOwnerMsgProps = {
  onGoBack: () => void;
};

export const PostsStatsNonOwnerMsg: FC<PostsStatsNonOwnerMsgProps> = ({ onGoBack }) => {
  return (
    <div className="not-logged-in-user-post-msg">
      <div className="not-logged-in-user-post-msg-text">
        <h1>Views</h1>
        <p>Times this Chirp was seen.</p>
      </div>
      <button className="btn-go-back" onClick={onGoBack}>
        Dismiss
      </button>
    </div>
  );
};
