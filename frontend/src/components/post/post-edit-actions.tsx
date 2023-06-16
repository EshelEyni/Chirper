import { FiImage, FiList } from "react-icons/fi";
import { RiFileGifLine } from "react-icons/ri";
import { CiCalendarDate } from "react-icons/ci";
import { BsEmojiSmile } from "react-icons/bs";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../../store/types";
import { setUserMsg } from "../../store/actions/system.actions";
import { useEffect, useState, useRef, FC, Fragment } from "react";
import { GifPickerModal } from "../modals/gif-picker-modal";
import { Poll, Emoji, NewPost } from "../../../../shared/interfaces/post.interface";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import { useNavigate } from "react-router-dom";
import { RootState } from "../../store/store";
import { IoLocationSharp } from "react-icons/io5";
import { updateCurrNewPost } from "../../store/actions/new-post.actions";

interface PostEditActionsProps {
  currNewPost: NewPost | null;
  isPickerShown: boolean;
  inputTextValue: string;
  setInputTextValue: React.Dispatch<React.SetStateAction<string>>;
}

export type UIElement = "gifPicker" | "emojiPicker" | "scheduleModal" | "locationModal";

type ElementVisibility = Record<UIElement, boolean>;

export const PostEditActions: FC<PostEditActionsProps> = ({
  currNewPost,
  isPickerShown,
  inputTextValue,
  setInputTextValue,
}) => {
  const { loggedinUser } = useSelector((state: RootState) => state.authModule);
  const { sideBar, homePage, newPostType } = useSelector((state: RootState) => state.newPostModule);
  const navigate = useNavigate();
  const dispatch: AppDispatch = useDispatch();
  const [isMultiple, setIsMultiple] = useState(true);

  const [elementVisibility, setElementVisibility] = useState<ElementVisibility>({
    gifPicker: false,
    emojiPicker: false,
    scheduleModal: true,
    locationModal: false,
  });

  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!currNewPost) return;
    if (currNewPost.imgs.length < 3) setIsMultiple(true);
    else setIsMultiple(false);
  }, [currNewPost?.imgs]);

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
      isDisabled:
        currNewPost?.imgs.length === 4 ||
        !!currNewPost?.gif ||
        !!currNewPost?.poll ||
        !!currNewPost?.video,
    },
    {
      name: "gif-upload",
      icon: <RiFileGifLine />,
      isDisabled:
        (currNewPost?.imgs.length && currNewPost.imgs.length > 0) ||
        !!currNewPost?.gif ||
        !!currNewPost?.poll ||
        !!currNewPost?.video,
      onClickFn: () => {
        if (!isPickerShown) return;
        onToggleElementVisibility("gifPicker");
      },
    },
    {
      name: "poll",
      icon: <FiList />,
      isDisabled:
        (currNewPost?.imgs.length && currNewPost.imgs.length > 0) ||
        !!currNewPost?.gif ||
        !!currNewPost?.poll ||
        !!currNewPost?.video ||
        !!currNewPost?.schedule ||
        !!currNewPost?.quotedPostId,
      onClickFn: () => {
        if (!isPickerShown || !currNewPost) return;
        const defaultPoll: Poll = {
          options: [
            { text: "", voteCount: 0, isLoggedinUserVoted: false },
            { text: "", voteCount: 0, isLoggedinUserVoted: false },
          ],
          length: {
            days: 1,
            hours: 0,
            minutes: 0,
          },
          isVotingOff: false,
          createdAt: Date.now(),
        };
        const newPost = { ...currNewPost, poll: defaultPoll };
        dispatch(updateCurrNewPost(newPost, newPostType));
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
      isDisabled:
        !!currNewPost?.poll ||
        !!homePage.currPostIdx ||
        !!sideBar.currPostIdx ||
        !!currNewPost?.quotedPostId,
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
    if (!currNewPost) return;
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

    const isImagesGreaterThan4 = [...files].length + currNewPost.imgs.length > 4;

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
    if (!currNewPost) return;
    const newImgs = [...currNewPost.imgs];
    for (let i = 0; i < files.length; i++) {
      try {
        const file = files[i];

        if (file) {
          const currIdx = newImgs.length;
          newImgs.push({ url: "", isLoading: true, file });
          dispatch(updateCurrNewPost({ ...currNewPost, imgs: [...newImgs] }, newPostType));
          const dataUrl = await readAsDataURL(file);
          newImgs[currIdx] = { url: dataUrl, isLoading: false, file };
          dispatch(updateCurrNewPost({ ...currNewPost, imgs: [...newImgs] }, newPostType));
        }
      } catch (error) {
        console.error("Error reading file:", error);
      }
    }
  };

  const onUploadVideo = async (file: File) => {
    if (!currNewPost) return;
    try {
      const newPostPreLoad = { ...currNewPost, video: { url: "", isLoading: true, file } };
      dispatch(updateCurrNewPost(newPostPreLoad, newPostType));
      const dataUrl = await readAsDataURL(file);
      const newPost = { ...currNewPost, video: { url: dataUrl, isLoading: false, file } };
      dispatch(updateCurrNewPost(newPost, newPostType));
    } catch (error) {
      console.error("Error reading file:", error);
    }
  };

  const onEmojiPicked = (emoji: Emoji) => {
    if (!currNewPost) return;
    const nativeEmoji = emoji.native;
    const newPostText = inputTextValue + nativeEmoji;
    setInputTextValue(newPostText);
    dispatch(updateCurrNewPost({ ...currNewPost, text: newPostText }, newPostType));
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
    <Fragment>
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
                <div className="post-edit-action-icon-container">{btn.icon}</div>
                <input
                  type={btn.type}
                  accept={"image/*,video/*"}
                  multiple={isMultiple}
                  disabled={currNewPost?.imgs.length === 4 || !isPickerShown}
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
                  disabled={btn.isDisabled}
                  onClick={btn.onClickFn}
                >
                  <div className="post-edit-action-icon-container">{btn.icon}</div>
                </button>
                {elementVisibility.emojiPicker && (
                  <div className="emoji-picker-container">
                    <div
                      className="main-screen"
                      onClick={() => onToggleElementVisibility("emojiPicker")}
                    />
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
                disabled={btn.isDisabled}
                className={"post-edit-action-btn" + (btn.isDisabled ? " disabled" : "")}
                onClick={btn.onClickFn}
              >
                <div className="post-edit-action-icon-container">{btn.icon}</div>
              </button>
            );
          }
        })}
      </div>

      {elementVisibility.gifPicker && currNewPost && (
        <GifPickerModal
          currNewPost={currNewPost}
          onToggleElementVisibility={onToggleElementVisibility}
        />
      )}
    </Fragment>
  );
};
