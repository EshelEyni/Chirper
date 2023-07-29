import { FC } from "react";
import { Poll } from "../../../../../shared/interfaces/post.interface";
import  postService from "../../../services/post.service";
import { PollDisplayOptionsList } from "./PollDisplayOptionsList/PollDisplayOptionsList";
import { PollDisplayDetails } from "./PollDisplayDetails/PollDisplayDetails";

type PollDisplayProps = {
  postStartDate: Date;
  postId: string;
  poll: Poll;
  setPoll: React.Dispatch<React.SetStateAction<Poll | null>>;
};

export const PollDisplay: FC<PollDisplayProps> = ({ postStartDate, postId, poll, setPoll }) => {
  async function onVote(idx: number) {
    if (poll.isVotingOff) return;
    const { data: savedOption } = await postService.savePollVote(postId, idx);
    const updatedPoll = {
      ...poll,
      options: poll.options.map((option, i) => (i === idx ? savedOption : option)),
      isVotingOff: true,
    };
    setPoll(updatedPoll);
  }

  const pollVoteCount = poll.options.reduce((acc, option) => acc + option.voteCount, 0) || 0;

  return (
    <>
      <PollDisplayOptionsList
        isVotingOff={poll.isVotingOff}
        pollVoteCount={pollVoteCount}
        options={poll.options}
        onVote={onVote}
      />
      <PollDisplayDetails
        pollVoteCount={pollVoteCount}
        postStartDate={postStartDate}
        pollLength={poll.length}
      />
    </>
  );
};
