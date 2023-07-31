import { FC, useEffect, useState, useCallback } from "react";
import "./VideoTimer.scss";
import { useVideoPlayer } from "../../../contexts/VideoPlayerContext";

type VideoTimerProps = {
  isCountDown?: boolean;
};

type TimeUnits = {
  hours: number;
  minutes: number;
  seconds: number;
};

export const VideoTimer: FC<VideoTimerProps> = ({ isCountDown }) => {
  const { playedSeconds, duration } = useVideoPlayer();
  const [timeStr, setTimeStr] = useState("");

  function extractTimeUnits(secs: number) {
    const hours = Math.floor(secs / 3600);
    const minutes = Math.floor((secs - hours * 3600) / 60);
    const seconds = Math.floor(secs - hours * 3600 - minutes * 60);
    return { hours, minutes, seconds };
  }

  const getTimeDisplayString = useCallback(({ hours, minutes, seconds }: TimeUnits): string => {
    const formatNumber = (number: number) => (number < 10 ? `0${number}` : number);
    if (hours > 0)
      return `${formatNumber(hours)}:${formatNumber(minutes)}:${formatNumber(seconds)}`;
    return `${minutes}:${formatNumber(seconds)}`;
  }, []);

  const getTimeStr = useCallback(
    (timeStamp: number): string => {
      const timeUnits = extractTimeUnits(timeStamp);
      return getTimeDisplayString(timeUnits);
    },
    [getTimeDisplayString]
  );

  useEffect(() => {
    let str;
    if (isCountDown) {
      const countDownTimer = Math.round(duration - playedSeconds);
      str = getTimeStr(countDownTimer);
    } else {
      str = getTimeStr(playedSeconds);
    }
    setTimeStr(str);
  }, [playedSeconds, duration, isCountDown, getTimeStr]);

  return (
    <section className="video-timer">
      {isCountDown ? (
        <span className="count-down-timer">{timeStr}</span>
      ) : (
        <div className="default-timer">
          <span>{timeStr}</span>
          <span>/</span>
          <span>{getTimeStr(duration)}</span>
        </div>
      )}
    </section>
  );
};
