import { FC, useEffect, useState } from "react";
import { VideoProgressBar } from "./video-progress-bar";

type VideoCustomControlsProps = {
  timer: number;
  setTimer: (timer: number) => void;
  videoPlayerRef: any;
};

export const VideoCustomControls: FC<VideoCustomControlsProps> = ({
  timer,
  setTimer,
  videoPlayerRef,
}) => {
  return (
    <section className="video-cutom-controls">
      <VideoProgressBar timer={timer} setTimer={setTimer} videoPlayerRef={videoPlayerRef} />
    </section>
  );
};
