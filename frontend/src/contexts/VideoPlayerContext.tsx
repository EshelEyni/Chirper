import { createContext, useContext, useState } from "react";

type VideoPlayerContextType = {
  isPlaying: boolean;
  setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>;
  isMuted: boolean;
  setIsMuted: React.Dispatch<React.SetStateAction<boolean>>;
  volume: number;
  setVolume: (volume: number) => void;
  progress: number;
  setProgress: (progress: number) => void;
  playedSeconds: number;
  setPlayedSeconds: (playedSeconds: number) => void;
  duration: number;
  setDuration: (duration: number) => void;
  isLooping: boolean;
  setIsLooping: React.Dispatch<React.SetStateAction<boolean>>;
  playbackRate: number;
  setPlaybackRate: (playbackRate: number) => void;
};

const VideoPlayerContext = createContext<VideoPlayerContextType | undefined>(undefined);

function VideoPlayerProvider({ children }: { children: React.ReactNode }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [volume, setVolume] = useState(0.5);
  const [progress, setProgress] = useState(0);
  const [playedSeconds, setPlayedSeconds] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLooping, setIsLooping] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);

  const value = {
    isPlaying,
    setIsPlaying,
    isMuted,
    setIsMuted,
    volume,
    setVolume,
    progress,
    setProgress,
    playedSeconds,
    setPlayedSeconds,
    duration,
    setDuration,
    isLooping,
    setIsLooping,
    playbackRate,
    setPlaybackRate,
  };
  return <VideoPlayerContext.Provider value={value}>{children}</VideoPlayerContext.Provider>;
}

function useVideoPlayer() {
  const context = useContext(VideoPlayerContext);
  if (context === undefined) {
    throw new Error("useVideoPlayer must be used within a VideoPlayerProvider");
  }
  return context;
}

export { VideoPlayerProvider, useVideoPlayer };
