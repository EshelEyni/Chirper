import { FC } from "react";
import { Poll } from "../../../../../shared/interfaces/post.interface";
import { postService } from "../../../services/post.service";
import { PollDisplayOption } from "../PollDisplayOption/PollDisplayOption";
import { PollDisplayOptionResult } from "../PollDisplayResult/PollDisplayResult";
import "./PollDisplay.scss";

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

  function setPollTimeCount() {
    const postStartTimestamp = new Date(postStartDate).getTime();
    const nowTimestamp = new Date().getTime();
    const { days, hours, minutes } = poll.length;
    const pollEndTimestamp =
      postStartTimestamp +
      days * 24 * 60 * 60 * 1000 +
      hours * 60 * 60 * 1000 +
      minutes * 60 * 1000;

    const daysLeft = Math.floor((pollEndTimestamp - nowTimestamp) / (1000 * 60 * 60 * 24));
    const hoursLeft = Math.floor(((pollEndTimestamp - nowTimestamp) / (1000 * 60 * 60)) % 24);
    const minutesLeft = Math.floor(((pollEndTimestamp - nowTimestamp) / (1000 * 60)) % 60);

    if (daysLeft > 0) return `${daysLeft}d`;
    if (hoursLeft > 0) return `${hoursLeft}h`;
    if (minutesLeft > 0) return `${minutesLeft}m`;
    if (nowTimestamp > pollEndTimestamp) return `Final results`;
  }

  return (
    <section className="poll-display">
      <ul className="poll-display-options-list">
        {poll.options.map((option, idx) => {
          return poll.isVotingOff ? (
            <PollDisplayOptionResult key={idx} option={option} pollVoteCount={pollVoteCount} />
          ) : (
            <PollDisplayOption key={idx} option={option} idx={idx} onVote={onVote} />
          );
        })}
      </ul>
      <div className="poll-display-details">
        <span>{pollVoteCount} votes</span>
        <span>·</span>
        <span>{setPollTimeCount()}</span>
      </div>
    </section>
  );
};
