import React, { useEffect } from "react";
import { AiOutlineClose } from "react-icons/ai";
import { postService } from "../../services/post.service";
import { Gif } from "@giphy/react-components";
import { GifList } from "../gif/gif-list";

interface PostEditgifPickerProps {
  gifUrl: string;
  setgifUrl: (url: string) => void;
  setIsgifPickerShown: (isShown: boolean) => void;
}

export const PostEditgifPickerModal: React.FC<PostEditgifPickerProps> = ({
  gifUrl,
  setgifUrl,
  setIsgifPickerShown,
}) => {
  const [gifs, setgifs] = React.useState<any[]>([]);

  useEffect(() => {
    getgifs("cats");
  }, []);

  const getgifs = async (searchTerm: string) => {
    const gifs = await postService.getGifsBySearchTerm(searchTerm);
    console.log(gifs);
    setgifs(gifs);
  };

  return (
    <React.Fragment>
      <div
        className="main-screen dark"
        onClick={() => setIsgifPickerShown(false)}
      ></div>
      <div className="post-edit-gif-picker">
        <header className="post-edit-gif-picker-header">
          <button
            className="post-edit-gif-picker-header-close"
            onClick={() => setIsgifPickerShown(false)}
          >
            <AiOutlineClose />
          </button>
        </header>
        {/* {gifs.length > 0 && <Gif gif={gifs[0]} width={200} />} */}
        <GifList />
      </div>
    </React.Fragment>
  );
};
