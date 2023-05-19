import { FiImage, FiList } from "react-icons/fi";
import { RiFileGifLine } from "react-icons/ri";
import { CiCalendarDate } from "react-icons/ci";
import { BsEmojiSmile } from "react-icons/bs";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../../store/types";
import { setUserMsg } from "../../store/actions/system.actions";
import React, { useEffect, useState, useRef } from "react";
import { GifPickerModal } from "../modals/gif-picker-modal";
import { Gif as GifType } from "../../../../shared/interfaces/gif.interface";
import { Poll, Emoji } from "../../../../shared/interfaces/post.interface";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import { useNavigate } from "react-router-dom";
import { RootState } from "../../store/store";
import { setNewPost } from "../../store/actions/post.actions";
import { IoLocationSharp } from "react-icons/io5";

interface PostEditActionBtnsProps {
  imgs: { url: string; isLoading: boolean; file: File }[];
  setImgs: (urls: { url: string; isLoading: boolean; file: File }[]) => void;
  video: { url: string; isLoading: boolean; file: File } | null;
  setVideo: React.Dispatch<
    React.SetStateAction<{ url: string; isLoading: boolean; file: File } | null>
  >;
  gif: GifType | null;
  setGif: (url: GifType | null) => void;
  isPickerShown: boolean;
  poll: Poll | null;
  setPoll: React.Dispatch<React.SetStateAction<Poll | null>>;
}

export type UIElement = "gifPicker" | "emojiPicker" | "scheduleModal" | "locationModal";

type ElementVisibility = Record<UIElement, boolean>;

export const PostEditActionBtns: React.FC<PostEditActionBtnsProps> = ({
  imgs,
  setImgs,
  video,
  setVideo,
  gif,
  setGif,
  isPickerShown,
  poll,
  setPoll,
}) => {
  const navigate = useNavigate();
  const dispatch: AppDispatch = useDispatch();
  const [isMultiple, setIsMultiple] = useState(true);
  const { newPost } = useSelector((state: RootState) => state.postModule);
  const { loggedinUser } = useSelector((state: RootState) => state.authModule);

  const [elementVisibility, setElementVisibility] = useState<ElementVisibility>({
    gifPicker: false,
    emojiPicker: false,
    scheduleModal: true,
    locationModal: false,
  });

  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (imgs.length < 3) setIsMultiple(true);
    else setIsMultiple(false);
  }, [imgs]);

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
      isDisabled: imgs.length === 4 || !!gif || !!poll || !!video,
    },
    {
      name: "gif-upload",
      icon: <RiFileGifLine />,
      isDisabled: imgs.length > 0 || !!gif || !!poll || !!video,
      onClickFn: () => {
        if (!isPickerShown) return;
        onToggleElementVisibility("gifPicker");
      },
    },
    {
      name: "poll",
      icon: <FiList />,
      isDisabled: imgs.length > 0 || !!gif || !!poll || !!video || !!newPost.schedule,
      onClickFn: () => {
        if (!isPickerShown) return;
        const defaultPoll: Poll = {
          options: [
            { text: "", voteSum: 0, isLoggedinUserVoted: false },
            { text: "", voteSum: 0, isLoggedinUserVoted: false },
          ],
          length: {
            days: 1,
            hours: 0,
            minutes: 0,
          },
          isVotingOff: false,
          createdAt: Date.now(),
        };
        setPoll(defaultPoll);
      },
    },
    {
      name: "emoji",
      icon: <BsEmojiSmile />,
      isDisabled: false,
      onClickFn: () => {
        if (!isPickerShown) return;
        onToggleElementVisibility("emojiPicker");
      },
    },
    {
      name: "schedule",
      icon: <CiCalendarDate />,
      isDisabled: !!poll,
      onClickFn: () => {
        if (!isPickerShown) return;
        onOpenPostScedule();
      },
    },
    {
      name: "location",
      icon: <IoLocationSharp />,
      isDisabled: !loggedinUser?.isApprovedLocation,
      onClickFn: () => {
        if (!isPickerShown) return;
        onOpenPostLocation();
      },
    },
  ];

  const onUploadFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target;
    if (!files) return;
    const fileTypes = [...files].map(file => file.type.slice(0, 5));
    const isValidFileType = fileTypes.every(
      fileType => fileType === "image" || fileType === "video"
    );
    if (!isValidFileType) {
      dispatch(
        setUserMsg({
          type: "info",
          text: "Only images and videos are allowed.",
        })
      );
      return;
    }
    const isVideoType = fileTypes.some(fileType => fileType === "video");
    const isMoreThanOneVideoFile = isVideoType && files.length > 1;

    if (isMoreThanOneVideoFile) {
      dispatch(
        setUserMsg({
          type: "info",
          text: "Only one video is allowed.",
        })
      );
      return;
    }

    const isImagesGreaterThan4 = [...files].length + imgs.length > 4;

    if (isImagesGreaterThan4) {
      dispatch(
        setUserMsg({
          type: "info",
          text: "Please choose either 1 GIF or up to 4 photos.",
        })
      );
      return;
    }

    if (isVideoType) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const videoFile = [...files].at(0)!;

      const isVideoGreaterThan10MB = videoFile.size > 10000000;

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const { isVerified } = loggedinUser!;
      if (!isVerified && isVideoGreaterThan10MB) {
        dispatch(
          setUserMsg({
            type: "info",
            text: "Only verified users can upload videos larger than 10MB.",
          })
        );
        return;
      }

      onUploadVideo(videoFile);
    } else {
      onUploadImgs([...files]);
    }

    e.target.value = "";
  };

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

  const onUploadImgs = async (files: File[]) => {
    const newImgs = [...imgs];
    for (let i = 0; i < files.length; i++) {
      try {
        const file = files[i];

        if (file) {
          const currIdx = newImgs.length;
          newImgs.push({ url: "", isLoading: true, file });
          setImgs([...newImgs]);

          const dataUrl = await readAsDataURL(file);
          newImgs[currIdx] = { url: dataUrl, isLoading: false, file };
          setImgs([...newImgs]);
        }
      } catch (error) {
        console.error("Error reading file:", error);
      }
    }
  };

  const onUploadVideo = async (file: File) => {
    try {
      const dataUrl = await readAsDataURL(file);
      setVideo({ url: dataUrl, isLoading: false, file });
    } catch (error) {
      console.error("Error reading file:", error);
    }
  };

  const onEmojiPicked = (emoji: Emoji) => {
    const nativeEmoji = emoji.native;
    const newPostText = newPost.text + nativeEmoji;
    dispatch(setNewPost({ ...newPost, text: newPostText }));
  };

  const onToggleElementVisibility = (elementName: UIElement) => {
    setElementVisibility({
      ...elementVisibility,
      [elementName]: !elementVisibility[elementName],
    });
  };

  const onOpenPostScedule = () => {
    if (!isPickerShown) return;
    navigate("/post-schedule");
  };

  const onOpenPostLocation = () => {
    if (!loggedinUser?.isApprovedLocation) {
      const msg = "Please set your location in your profile first.";
      dispatch(
        setUserMsg({
          type: "info",
          text: msg,
        })
      );
      return;
    }
    if (!isPickerShown) return;
    navigate("/post-location");
  };

  return (
    <React.Fragment>
      <div className="post-edit-action-btns">
        {btns.map((btn, idx) => {
          if (btn.name === "img-upload") {
            return (
              <button
                key={idx}
                className={"post-edit-action-btn" + (btn.isDisabled ? " disabled" : "")}
                onClick={() => {
                  if (fileRef.current && !btn.isDisabled && isPickerShown) fileRef.current.click();
                }}
              >
                <div
                  className="post-edit-action-icon-container"
                  // style={{ pointerEvents: isPickerShown ? "all" : "none" }}
                  // htmlFor={btn.name}
                >
                  {btn.icon}
                </div>
                <input
                  type={btn.type}
                  accept={"image/*,video/*"}
                  multiple={isMultiple}
                  disabled={imgs.length === 4 || !isPickerShown}
                  id={btn.name}
                  onChange={onUploadFile}
                  style={{ display: "none" }}
                  ref={fileRef}
                />
              </button>
            );
          } else if (btn.name === "emoji") {
            return (
              <div className="emoji-button-container" key={idx}>
                <button
                  className={"post-edit-action-btn" + (btn.isDisabled ? " disabled" : "")}
                  onClick={btn.onClickFn}
                >
                  <div className="post-edit-action-icon-container">{btn.icon}</div>
                </button>
                {elementVisibility.emojiPicker && (
                  <div className="emoji-picker-container">
                    <div
                      className="main-screen"
                      onClick={() => onToggleElementVisibility("emojiPicker")}
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
                className={"post-edit-action-btn" + (btn.isDisabled ? " disabled" : "")}
                onClick={btn.onClickFn}
              >
                <div className="post-edit-action-icon-container">{btn.icon}</div>
              </button>
            );
          }
        })}
      </div>
      {elementVisibility.gifPicker && (
        <GifPickerModal
          gif={gif}
          setGif={setGif}
          onToggleElementVisibility={onToggleElementVisibility}
        />
      )}
    </React.Fragment>
  );
};
