import { FC } from "react";
import { PollOption } from "../../../../../shared/types/post";
import "./PollDisplayOption.scss";

interface PollDisplayOptionProps {
  option: PollOption;
  idx: number;
  onVote: (idx: number) => void;
}

export const PollDisplayOption: FC<PollDisplayOptionProps> = ({ option, idx, onVote }) => {
  return (
    <li
      className="poll-display-option"
      onClick={() => onVote(idx)}
      data-testid="poll-display-option"
    >
      <span>{option.text}</span>
    </li>
  );
};
