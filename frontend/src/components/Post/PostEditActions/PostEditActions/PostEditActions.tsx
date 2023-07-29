import { useEffect, useState, FC } from "react";
import { useNavigate } from "react-router-dom";
import { FiImage, FiList } from "react-icons/fi";
import { RiFileGifLine } from "react-icons/ri";
import { CiCalendarDate } from "react-icons/ci";
import { BsEmojiSmile } from "react-icons/bs";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../../../../store/types";
import { setUserMsg } from "../../../../store/actions/system.actions";
import { Poll, Emoji } from "../../../../../../shared/interfaces/post.interface";
import { updateCurrNewPost } from "../../../../store/actions/new-post.actions";
import { RootState } from "../../../../store/store";
import { IoLocationSharp } from "react-icons/io5";
import "./PostEditActions.scss";
import { PostEditBtnImgAndVideoUpload } from "../PostEditBtnImgVideoUpload/PostEditBtnImgVideoUpload";
import { PostEditBtnEmoji } from "../PostEditBtnEmoji/PostEditBtnEmoji";
import { PostEditActionBtn } from "../PostEditActionBtn/PostEditActionBtn";
import { GifPickerModal } from "../../../Modals/GifPickerModal/GifPickerModal";
import { usePostEdit } from "../../PostEdit/PostEditContext";

export type UIElement = "gifPicker" | "emojiPicker" | "scheduleModal" | "locationModal";
export type PostEditActionBtn = {
  name: string;
  icon: JSX.Element;
  type?: string;
  isDisabled: boolean;
  onClickFn?: () => void;
};

export type ElementVisibility = Record<UIElement, boolean>;

export const PostEditActions: FC = () => {
  const { newPostText, setNewPostText, isPickerShown, currNewPost } = usePostEdit();

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

  const isGifModalShown = elementVisibility.gifPicker && currNewPost;

  const btns: PostEditActionBtn[] = [
    {
      name: "img-video-upload",
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
      onClickFn: handleBtnGifClick,
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
      onClickFn: handleBtnPollClick,
    },
    {
      name: "emoji",
      icon: <BsEmojiSmile />,
      isDisabled: false,
      onClickFn: handleBtnEmojiClick,
    },
    {
      name: "schedule",
      icon: <CiCalendarDate />,
      isDisabled:
        !!currNewPost?.poll ||
        !!homePage.currPostIdx ||
        !!sideBar.currPostIdx ||
        !!currNewPost?.quotedPostId,
      onClickFn: handleBtnScheduleClick,
    },
    {
      name: "location",
      icon: <IoLocationSharp />,
      isDisabled: !loggedinUser?.isApprovedLocation,
      onClickFn: handleBtnLocationClick,
    },
  ];

  function handleBtnGifClick() {
    if (!isPickerShown) return;
    onToggleElementVisibility("gifPicker");
  }

  function handleBtnPollClick() {
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
  }

  function handleBtnEmojiClick() {
    if (!isPickerShown) return;
    onToggleElementVisibility("emojiPicker");
  }

  function handleBtnScheduleClick() {
    if (!isPickerShown) return;
    navigate("post-schedule", { relative: "path" });
  }

  function handleBtnLocationClick() {
    if (!isPickerShown) return;
    if (loggedinUser?.isApprovedLocation) {
      navigate("post-location", { relative: "path" });
      return;
    }
    const msg = "Please set your location in your profile first.";
    dispatch(
      setUserMsg({
        type: "info",
        text: msg,
      })
    );
  }

  function onEmojiPicked(emoji: Emoji) {
    if (!currNewPost) return;
    const nativeEmoji = emoji.native;
    const newText = newPostText + nativeEmoji;
    setNewPostText(newText);
    dispatch(updateCurrNewPost({ ...currNewPost, text: newText }, newPostType));
  }

  function onToggleElementVisibility(elementName: UIElement) {
    setElementVisibility({
      ...elementVisibility,
      [elementName]: !elementVisibility[elementName],
    });
  }

  useEffect(() => {
    if (!currNewPost) return;
    if (currNewPost.imgs.length < 3) setIsMultiple(true);
    else setIsMultiple(false);
  }, [currNewPost?.imgs, currNewPost]);

  return (
    <>
      <section className="post-edit-action-btns">
        {btns.map(btn => {
          if (btn.name === "img-video-upload") {
            return (
              <PostEditBtnImgAndVideoUpload
                btn={btn}
                isMultiple={isMultiple}
                isPickerShown={isPickerShown}
                key={btn.name}
              />
            );
          } else if (btn.name === "emoji") {
            return (
              <PostEditBtnEmoji
                btn={btn}
                elementVisibility={elementVisibility}
                onToggleElementVisibility={onToggleElementVisibility}
                onEmojiPicked={onEmojiPicked}
                key={btn.name}
              />
            );
          } else {
            return <PostEditActionBtn btn={btn} key={btn.name} />;
          }
        })}
      </section>

      {isGifModalShown && <GifPickerModal onToggleElementVisibility={onToggleElementVisibility} />}
    </>
  );
};
