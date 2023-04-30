import { AiOutlineSchedule } from "react-icons/ai";
import { FC } from "react";
interface PostDateTitleProps {
  date: Date;
}

export const PostDateTitle: FC<PostDateTitleProps> = ({ date }) => {
  const formatDate = (date: Date) => {
    const dayOfWeek = new Intl.DateTimeFormat("en-US", {
      weekday: "short",
    }).format(date);
    const month = new Intl.DateTimeFormat("en-US", { month: "short" }).format(
      date
    );
    const day = date.getDate();
    const year = date.getFullYear();

    const timeOptions: {
      hour: "numeric" | "2-digit" | undefined;
      minute: "numeric" | "2-digit" | undefined;
      hour12: boolean;
    } = { hour: "2-digit", minute: "2-digit", hour12: true };
    const time = new Intl.DateTimeFormat("en-US", timeOptions).format(date);

    return `Will send on ${dayOfWeek}, ${month} ${day}, ${year} at ${time}`;
  };

  return (
    <div className="post-schedule-date-title-container">
      <AiOutlineSchedule className="post-schedule-date-icon" />
      <div className="post-schedule-date-title">{formatDate(date)}</div>
    </div>
  );
};
