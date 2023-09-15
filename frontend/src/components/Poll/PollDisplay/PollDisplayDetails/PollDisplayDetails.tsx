import { FC, useEffect, useState } from "react";
import "./PollDisplayDetails.scss";

type PollDisplayDetailsProps = {
  pollVoteCount: number;
  postStartDate: string;
  pollLength: {
    days: number;
    hours: number;
    minutes: number;
  };
};

export const PollDisplayDetails: FC<PollDisplayDetailsProps> = ({
  pollVoteCount,
  postStartDate,
  pollLength,
}) => {
  const [pollTimeRemaining, setPollTimeRemaining] = useState<string>("");

  useEffect(() => {
    const calculatePollTimeRemaining = (): string => {
      const postStartTimestamp = new Date(postStartDate).getTime();
      const nowTimestamp = new Date().getTime();
      const { days, hours, minutes } = pollLength;
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
      return "";
    };

    setPollTimeRemaining(calculatePollTimeRemaining());
  }, [postStartDate, pollLength]);

  return (
    <div className="poll-display-details">
      <span>{pollVoteCount} votes</span>
      <span>·</span>
      <span>{pollTimeRemaining}</span>
    </div>
  );
};
