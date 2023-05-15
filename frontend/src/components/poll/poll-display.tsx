import { FC } from "react";
import { Poll } from "../../../../shared/interfaces/post.interface";
import { postService } from "../../services/post.service";
import { AiOutlineCheckCircle } from "react-icons/ai";

type PollDisplayProps = {
  postId: string;
  poll: Poll;
  setPoll: React.Dispatch<React.SetStateAction<Poll | null>>;
};

export const PollDisplay: FC<PollDisplayProps> = ({ postId, poll, setPoll }) => {
  const onVote = async (idx: number) => {
    const { data: savedOption } = await postService.savePollVote(postId, idx);
    console.log(savedOption);
    const updatedPoll = {
      ...poll,
      options: poll.options.map((option, i) => (i === idx ? savedOption : option)),
    };
    setPoll(updatedPoll);
  };

  return (
    <ul className="poll-display">
      {poll.options.map((option, idx) => {
        return (
          <li className="poll-display-option" key={idx} onClick={() => onVote(idx)}>
            <span>{option.text}</span>
            {option.isLoggedinUserVoted && <AiOutlineCheckCircle />}
          </li>
        );
      })}
    </ul>
  );
};
