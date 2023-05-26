import { FC, useState } from "react";
import { ContentLoader } from "../loaders/content-loader";
import { Gif } from "../../../../shared/interfaces/gif.interface";
import Switch from "@mui/material/Switch";
import { UIElement } from "../btns/post-edit-actions";
import { AppDispatch } from "../../store/types";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { NewPost } from "../../../../shared/interfaces/post.interface";
import { setNewPost } from "../../store/actions/post.actions";

interface GifListProps {
  gifs: Gif[];
  onToggleElementVisibility: (element: UIElement) => void;
}

export const GifList: FC<GifListProps> = ({ gifs, onToggleElementVisibility }) => {
  const dispatch: AppDispatch = useDispatch();
  const { newPost }: { newPost: NewPost } = useSelector((state: RootState) => state.postModule);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);

  const handleGifClick = (gif: Gif) => {
    dispatch(setNewPost({ ...newPost, gif }));
    onToggleElementVisibility("gifPicker");
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
              <div className="gif-list-item" key={idx} onClick={() => handleGifClick(gif)}>
                <img
                  src={isPlaying ? gif.url : gif.staticUrl}
                  alt={gif.description}
                  loading="lazy"
                />
              </div>
            );
          })}
      </div>
    </div>
  );
};
