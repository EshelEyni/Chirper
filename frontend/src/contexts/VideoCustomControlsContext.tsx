import { createContext, useContext, useState } from "react";

type VideoPlayerContextType = {
  isVolumeHover: boolean;
  setIsVolumeHover: React.Dispatch<React.SetStateAction<boolean>>;
  isFullScreen: boolean;
  setIsFullScreen: React.Dispatch<React.SetStateAction<boolean>>;
};

const VideoCustomControlsContext = createContext<VideoPlayerContextType | undefined>(undefined);

function VideoCustomControlsProvider({ children }: { children: React.ReactNode }) {
  const [isVolumeHover, setIsVolumeHover] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);

  const value = {
    isVolumeHover,
    setIsVolumeHover,
    isFullScreen,
    setIsFullScreen,
  };
  return (
    <VideoCustomControlsContext.Provider value={value}>
      {children}
    </VideoCustomControlsContext.Provider>
  );
}

function useVideoCustomControls() {
  const context = useContext(VideoCustomControlsContext);
  if (context === undefined) {
    throw new Error("useVideoCustomControls must be used within a VideoCustomControlsProvider");
  }
  return context;
}

export { VideoCustomControlsProvider, useVideoCustomControls };
