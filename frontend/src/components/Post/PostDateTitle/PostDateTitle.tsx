import { AiOutlineSchedule } from "react-icons/ai";
import { FC } from "react";
import { useNavigate } from "react-router-dom";
import "./PostDateTitle.scss";

interface PostDateTitleProps {
  date: Date;
  isLink?: boolean;
}

export const PostDateTitle: FC<PostDateTitleProps> = ({ date, isLink = false }) => {
  const navigate = useNavigate();
  const formatDate = (date: Date) => {
    const dayOfWeek = new Intl.DateTimeFormat("en-US", {
      weekday: "short",
    }).format(date);
    const month = new Intl.DateTimeFormat("en-US", { month: "short" }).format(date);
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

  const onGoToPostScheduler = () => {
    if (!isLink) return;
    navigate("/post-schedule");
  };

  return (
    <div
      className={"post-schedule-date-title-container" + (isLink ? " link-active" : "")}
      onClick={onGoToPostScheduler}
    >
      <AiOutlineSchedule className="post-schedule-date-icon" />
      <div className="post-schedule-date-title">{formatDate(date)}</div>
    </div>
  );
};
