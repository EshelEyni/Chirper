import { FC } from "react";
import { PollOption } from "../../../../../shared/types/post";
import { PollDisplayOptionResult } from "./PollDisplayOptionResult";
import { PollDisplayOption } from "./PollDisplayOption";
import "./PollDisplayOptionsList.scss";

type PollDisplayOptionsListProps = {
  isVotingOff: boolean;
  pollVoteCount: number;
  options: PollOption[];
  onVote: (idx: number) => void;
};

export const PollDisplayOptionsList: FC<PollDisplayOptionsListProps> = ({
  isVotingOff,
  pollVoteCount,
  options,
  onVote,
}) => {
  return (
    <ul className="poll-display-options-list">
      {options.map((option, idx) => {
        return isVotingOff ? (
          <PollDisplayOptionResult key={idx} option={option} pollVoteCount={pollVoteCount} />
        ) : (
          <PollDisplayOption key={idx} option={option} idx={idx} onVote={onVote} />
        );
      })}
    </ul>
  );
};
