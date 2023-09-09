import { FC } from "react";
import { PollDisplayOptionsList } from "./PollDisplayOptionsList/PollDisplayOptionsList";
import { PollDisplayDetails } from "./PollDisplayDetails/PollDisplayDetails";
import { usePostPreview } from "../../../contexts/PostPreviewContext";
import { useAddPollVote } from "../../../hooks/reactQuery/post/useAddPollVote";

type PollDisplayProps = {
  postStartDate: Date;
};

export const PollDisplay: FC<PollDisplayProps> = ({ postStartDate }) => {
  const { addPollVote } = useAddPollVote();
  const { post } = usePostPreview();

  const poll = post?.poll;
  if (!post || !poll) return null;
  const postId = post.id;

  async function onVote(idx: number) {
    addPollVote({ postId, optionIdx: idx });
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
