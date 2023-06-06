import { FC, useMemo } from "react";
import { PollOption } from "../../../../shared/interfaces/post.interface";
import { AiOutlineCheckCircle } from "react-icons/ai";

type PollDisplayOptionResultProps = {
  option: PollOption;
  pollVoteCount: number;
};

export const PollDisplayOptionResult: FC<PollDisplayOptionResultProps> = ({
  option,
  pollVoteCount,
}) => {
  const percentage = useMemo(() => {
    const count = pollVoteCount || 1;
    return Number(((option.voteCount / count) * 100).toFixed(1));
  }, [option.voteCount, pollVoteCount]);

  return (
    <li className="poll-display-option-result">
      <div
        className="poll-display-option-result-progress-bar"
        style={{ width: `${Math.max(percentage, 1)}%` }}
      ></div>
      <div className="poll-option-content">
        <span>{option.text}</span>
        {option.isLoggedinUserVoted && <AiOutlineCheckCircle />}
      </div>
      <span className="poll-option-percentage">{percentage + "%"}</span>
    </li>
  );
};
