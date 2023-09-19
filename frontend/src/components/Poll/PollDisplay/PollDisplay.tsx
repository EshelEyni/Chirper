import { FC } from "react";
import { PollDisplayOptionsList } from "./PollDisplayOptionsList";
import { PollDisplayDetails } from "./PollDisplayDetails";
import { usePostPreview } from "../../../contexts/PostPreviewContext";
import { useAddPollVote } from "../../../hooks/useAddPollVote";

export const PollDisplay: FC = () => {
  const { addPollVote } = useAddPollVote();
  const { post } = usePostPreview();

  const poll = post?.poll;
  if (!post || !poll) return null;
  const postId = post.id;
  const postStartDate = post.schedule ? post.schedule : post.createdAt;

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
