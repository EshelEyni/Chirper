import { FC } from "react";

type VideoTimerProps = {
  playedSeconds: number;
  duration: number;
  isCountDown?: boolean;
};

export const VideoTimer: FC<VideoTimerProps> = ({ playedSeconds, duration, isCountDown }) => {
  const setCountDownTimer = (playedSeconds: number, duration: number) => {
    const countDownTimer = Math.round(duration - playedSeconds);
    const hours = Math.floor(countDownTimer / 3600);
    const minutes = Math.floor((countDownTimer - hours * 3600) / 60);
    const seconds = countDownTimer - hours * 3600 - minutes * 60;

    const formmatNumber = (number: number) => {
      return number < 10 ? `0${number}` : number;
    };

    if (hours > 0) {
      return `${formmatNumber(hours)}:${formmatNumber(minutes)}:${formmatNumber(seconds)}`;
    }
    return `${minutes}:${formmatNumber(seconds)}`;
  };

  return (
    <section className="video-timer">
      {isCountDown ? (
        <span>{setCountDownTimer(playedSeconds, duration)}</span>
      ) : (
        <span>
          {Math.floor(playedSeconds / 60)}:{Math.floor(playedSeconds % 60)}
        </span>
      )}
    </section>
  );
};
