import { FC, useState } from "react";
import { ContentLoader } from "../loaders/content-loader";
import { Gif } from "../../../../shared/interfaces/gif.interface";
import Switch from "@mui/material/Switch";
import { UIElement } from "../post/post-edit-actions/post-edit-actions";
import { AppDispatch } from "../../store/types";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { NewPost } from "../../../../shared/interfaces/post.interface";
import { updateCurrNewPost } from "../../store/actions/new-post.actions";
import { gifPlaceholderBcg } from "../../services/gif.service";

interface GifListProps {
  currNewPost: NewPost;
  gifs: Gif[];
  onToggleElementVisibility: (element: UIElement) => void;
}

export const GifList: FC<GifListProps> = ({ currNewPost, gifs, onToggleElementVisibility }) => {
  const dispatch: AppDispatch = useDispatch();
  const { newPostType } = useSelector((state: RootState) => state.newPostModule);

  const [isPlaying, setIsPlaying] = useState<boolean>(true);

  function handleGifClick(gif: Gif) {
    const newPost = { ...currNewPost, gif };
    dispatch(updateCurrNewPost(newPost, newPostType));
    onToggleElementVisibility("gifPicker");
  }

  function handleChange() {
    setIsPlaying(prevState => !prevState);
  }

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
      <ul className="gif-list-main-container">
        {gifs.length === 0 && <ContentLoader />}
        {gifs.length > 0 &&
          gifs.map((gif, idx) => {
            const ratio = gif.size.width / gif.size.height;
            const width = 120 * ratio + "px";
            return (
              <li
                className="gif-list-item"
                key={gif.id}
                onClick={() => handleGifClick(gif)}
                style={{
                  backgroundColor: gifPlaceholderBcg[idx % gifPlaceholderBcg.length],
                  width: width,
                }}
              >
                <img
                  src={isPlaying ? gif.placeholderUrl : gif.staticPlaceholderUrl}
                  alt={gif.description}
                  loading="lazy"
                />
              </li>
            );
          })}
      </ul>
    </div>
  );
};
