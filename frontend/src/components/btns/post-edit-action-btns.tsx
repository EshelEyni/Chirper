import { FiImage, FiList } from "react-icons/fi";
import { RiFileGifLine } from "react-icons/ri";
import { CiCalendarDate } from "react-icons/ci";
import { BsEmojiSmile } from "react-icons/bs";
import { HiOutlineLocationMarker } from "react-icons/hi";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../store/types";
import { setUserMsg } from "../../store/actions/system.actions";
import React, { useEffect, useState, useRef } from "react";
import { GifPickerModal } from "../modals/gif-picker-modal";
import { GifUrl } from "../../../../shared/interfaces/gif.interface";
import { NewPost, Poll,Emoji } from "../../../../shared/interfaces/post.interface";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";

interface PostEditActionBtnsProps {
  post: NewPost;
  setPost: React.Dispatch<React.SetStateAction<NewPost>>;
  imgUrls: { url: string; isLoading: boolean }[];
  setImgUrls: (urls: { url: string; isLoading: boolean }[]) => void;
  gifUrl: GifUrl | null;
  setGifUrl: (url: GifUrl | null) => void;
  isPickerShown: boolean;
  poll: Poll | null;
  setPoll: React.Dispatch<React.SetStateAction<Poll | null>>;
}

export const PostEditActionBtns: React.FC<PostEditActionBtnsProps> = ({
  post,
  setPost,
  imgUrls,
  setImgUrls,
  gifUrl,
  setGifUrl,
  isPickerShown,
  poll,
  setPoll,
}) => {
  const dispatch: AppDispatch = useDispatch();
  const [isMultiple, setIsMultiple] = useState(true);
  const [isGifPickerShown, setIsGifPickerShown] = useState(false);
  const [isEmojiPickerShown, setIsEmojiPickerShown] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (imgUrls.length < 3) setIsMultiple(true);
    else setIsMultiple(false);
  }, [imgUrls]);

  const btns: {
    name: string;
    icon: JSX.Element;
    type?: string;
    isDisabled: boolean;
    onClickFn?: () => void;
  }[] = [
    {
      name: "img-upload",
      icon: <FiImage />,
      type: "file",
      isDisabled: imgUrls.length === 4 || !!gifUrl || !!poll,
    },
    {
      name: "gif-upload",
      icon: <RiFileGifLine />,
      isDisabled: imgUrls.length > 0 || !!gifUrl || !!poll,
      onClickFn: () => {
        if (!isPickerShown) return;
        setIsGifPickerShown(true);
      },
    },
    {
      name: "poll",
      icon: <FiList />,
      isDisabled: imgUrls.length > 0 || !!gifUrl || !!poll,
      onClickFn: () => {
        if (!isPickerShown) return;
        setPoll({
          choices: ["", ""],
          length: {
            days: 1,
            hours: 0,
            minutes: 0,
          },
          createdAt: Date.now(),
        });
      },
    },
    {
      name: "emoji",
      icon: <BsEmojiSmile />,
      isDisabled: false,
      onClickFn: () => {
        if (!isPickerShown) return;
        setIsEmojiPickerShown(true);
      },
    },
    {
      name: "schedule",
      icon: <CiCalendarDate />,
      isDisabled: false,
    },
    {
      name: "location",
      icon: <HiOutlineLocationMarker />,
      isDisabled: false,
    },
  ];

  const readAsDataURL = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result && typeof reader.result === "string") {
          resolve(reader.result);
        } else {
          reject(new Error("Failed to read file."));
        }
      };
      reader.readAsDataURL(file);
    });

  const onUploadImgs = async (ev: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = ev.target;
    if (!files) return;

    let newImgUrls = [...imgUrls];

    const msg = "Please choose either 1 GIF or up to 4 photos.";
    if (files.length > 4 || files.length + imgUrls.length > 4) {
      dispatch(setUserMsg(msg));
      return;
    }

    for (let i = 0; i < files.length; i++) {
      try {
        const file = files[i];

        if (file) {
          const currIdx = newImgUrls.length;
          newImgUrls.push({ url: "", isLoading: true });
          setImgUrls([...newImgUrls]);

          const dataUrl = await readAsDataURL(file);
          newImgUrls[currIdx] = { url: dataUrl, isLoading: false };
          setImgUrls([...newImgUrls]);
        }
      } catch (error) {
        console.error("Error reading file:", error);
      }
    }
  };

  const onEmojiPicked = (emoji: Emoji) => {
    const nativeEmoji = emoji.native;
    const newPostText = post.text + nativeEmoji;
    setPost({ ...post, text: newPostText });
  };

  return (
    <React.Fragment>
      <div className="post-edit-action-btns">
        {btns.map((btn, idx) => {
          if (btn.name === "img-upload") {
            return (
              <button
                key={idx}
                className={
                  "post-edit-action-btn" + (btn.isDisabled ? " disabled" : "")
                }
                onClick={() => {
                  if (fileRef.current && !btn.isDisabled && isPickerShown)
                    fileRef.current.click();
                }}
              >
                <label
                  className="post-edit-action-icon-container"
                  style={{ pointerEvents: isPickerShown ? "all" : "none" }}
                  htmlFor={btn.name}
                >
                  {btn.icon}
                </label>
                <input
                  type={btn.type}
                  multiple={isMultiple}
                  disabled={imgUrls.length === 4 || !isPickerShown}
                  id={btn.name}
                  onChange={onUploadImgs}
                  style={{ display: "none" }}
                  ref={fileRef}
                />
              </button>
            );
          } else if (btn.name === "emoji") {
            return (
              <div className="emoji-button-container" key={idx}>
                <button
                  className={
                    "post-edit-action-btn" + (btn.isDisabled ? " disabled" : "")
                  }
                  onClick={btn.onClickFn}
                >
                  <div className="post-edit-action-icon-container">
                    {btn.icon}
                  </div>
                </button>
                {isEmojiPickerShown && (
                  <div className="emoji-picker-container">
                    <div
                      className="main-screen"
                      onClick={() => setIsEmojiPickerShown(false)}
                    ></div>
                    <div className="emoji-picker-modal-container">
                      <Picker data={data} onEmojiSelect={onEmojiPicked} />
                    </div>
                  </div>
                )}
              </div>
            );
          } else {
            return (
              <button
                key={idx}
                className={
                  "post-edit-action-btn" + (btn.isDisabled ? " disabled" : "")
                }
                onClick={btn.onClickFn}
              >
                <div className="post-edit-action-icon-container">
                  {btn.icon}
                </div>
              </button>
            );
          }
        })}
      </div>
      {isGifPickerShown && (
        <GifPickerModal
          gifUrl={gifUrl}
          setGifUrl={setGifUrl}
          setIsgifPickerShown={setIsGifPickerShown}
        />
      )}
    </React.Fragment>
  );
};
