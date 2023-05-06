import { Dispatch, SetStateAction, FC } from "react";
import { Poll } from "../../../../shared/interfaces/post.interface";
import { PollOptionsInput } from "./poll-options-input";
import { PollLengthInputs } from "./poll-length-inputs";

interface PollEditProps {
  poll: Poll;
  setPoll: Dispatch<SetStateAction<Poll | null>>;
}

export const PollEdit: FC<PollEditProps> = ({ poll, setPoll }) => {
  const onRemovePoll = () => {
    setPoll(null);
  };

  return (
    <div className="poll-edit">
      <PollOptionsInput poll={poll} setPoll={setPoll} />
      <PollLengthInputs poll={poll} setPoll={setPoll} />
      <button className="btn-remove-poll" onClick={onRemovePoll}>
        Remove poll
      </button>
    </div>
  );
};
