import { FC } from "react";
import postService from "../../../services/post.service";
import { PollDisplayOptionsList } from "./PollDisplayOptionsList/PollDisplayOptionsList";
import { PollDisplayDetails } from "./PollDisplayDetails/PollDisplayDetails";
import { usePostPreview } from "../../../contexts/PostPreviewContext";

type PollDisplayProps = {
  postStartDate: Date;
};

export const PollDisplay: FC<PollDisplayProps> = ({ postStartDate }) => {
  const { post, poll, setPoll } = usePostPreview();
  if (!post || !poll) return null;
  const postId = post.id;

  async function onVote(idx: number) {
    if (!poll || poll.isVotingOff) return;
    const savedOption = await postService.savePollVote(postId, idx);
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
