import { useState } from "react";
import { ContentLoader } from "../loaders/content-loader";
import { Gif, GifUrl } from "../../../../shared/interfaces/gif.interface";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";

interface GifListProps {
  gifs: Gif[];
  setGifUrl: (url: GifUrl | null) => void;
  setIsgifPickerShown: (isShown: boolean) => void;
}

export const GifList: React.FC<GifListProps> = ({
  gifs,
  setGifUrl,
  setIsgifPickerShown,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(true);

  const handleGifClick = (gif: Gif) => {
    setGifUrl({ url: gif.gif, staticUrl: gif.img });
    console.log(gif);
    setIsgifPickerShown(false);
  };

  const handleChange = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="gif-list">
      <div className="play-btn-container">
        <span>Auto-play GIFs</span>
        <Switch
          checked={isPlaying}
          onChange={handleChange}
          sx={{
            "&.MuiSwitch-root .MuiSwitch-thumb": {
              backgroundColor: isPlaying ? "var(--color-primary)" : "white",
            },
            "&.MuiSwitch-root .Mui-checked + .MuiSwitch-track": {
              backgroundColor: "var(--color-primary-light)",
            },
            "& .MuiSwitch-track": {
              width: "40px",
            },
            "& .MuiSwitch-switchBase.Mui-checked": {
              transform: "translateX(24px)",
            },
          }}
        />
      </div>
      <div className="gif-list-main-container">
        {gifs.length === 0 && <ContentLoader />}
        {gifs.length > 0 &&
          gifs.map((gif, idx) => {
            return (
              <div
                className="gif-list-item"
                key={idx}
                onClick={() => handleGifClick(gif)}
              >
                {isPlaying ? (
                  <img src={gif.gif} alt="gif" />
                ) : (
                  <img src={gif.img} alt="img" />
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
};
