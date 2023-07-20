import { FC } from "react";
import "./VideoTimer.scss";

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

  const setDefaultTimer = (playedSeconds: number, duration: number) => {
    const hours = Math.floor(playedSeconds / 3600);
    const minutes = Math.floor((playedSeconds - hours * 3600) / 60);
    const seconds = Math.floor(playedSeconds - hours * 3600 - minutes * 60);

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
        <span className="count-down-timer">{setCountDownTimer(playedSeconds, duration)}</span>
      ) : (
        <div className="default-timer">
          <span>{setDefaultTimer(playedSeconds, duration)}</span>
          <span>/</span>
          <span>{setDefaultTimer(duration, duration)}</span>
        </div>
      )}
    </section>
  );
};
