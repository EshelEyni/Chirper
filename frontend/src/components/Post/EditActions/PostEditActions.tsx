/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { FC, useState, createContext, useContext, useRef, useEffect } from "react";
import { NewPost, Poll as TypeOfPoll } from "../../../../../shared/interfaces/post.interface";
import { updateNewPost } from "../../../store/slices/postEditSlice";
import { readAsDataURL } from "../../../services/util/utils.service";
import { toast } from "react-hot-toast";
import { UserMsg } from "../../Msg/UserMsg/UserMsg";
import { AppDispatch } from "../../../store/types";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../store/store";
import { UserMsg as TypeOfUserMsg } from "../../../../../shared/interfaces/system.interface";
import { FiImage, FiList } from "react-icons/fi";
import "./PostEditActions.scss";
import { setIsScrollRedirectActive } from "../../../store/slices/systemSlice";
import { useQueryGifs } from "../../../hooks/reactQuery/gif/useQueryGifs";
import { IoArrowBackSharp, IoLocationSharp } from "react-icons/io5";
import { AiOutlineClose } from "react-icons/ai";
import { GifSearchBar } from "../../Gif/GifSearchBar/GifSearchBar";
import { SpinnerLoader } from "../../Loaders/SpinnerLoader/SpinnerLoader";
import { GifList } from "../../Gif/GifList/GifList";
import { ErrorMsg } from "../../Msg/ErrorMsg/ErrorMsg";
import { GifCategoryList } from "../../Gif/GifCategoryList/GifCategoryList";
import { Modal } from "../../Modal/Modal";
import { RiFileGifLine } from "react-icons/ri";
import { Gif as TypeOfGif } from "../../../../../shared/interfaces/gif.interface";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import { BsEmojiSmile } from "react-icons/bs";
import { Emoji as TypeOfEmoji } from "../../../../../shared/interfaces/post.interface";
import { CiCalendarDate } from "react-icons/ci";
import { useNavigate } from "react-router-dom";

type PostEditActionsProps = {
  children: React.ReactNode;
  post: NewPost;
  isPickerShown: boolean | undefined;
  newPostText: string;
  setNewPostText: React.Dispatch<React.SetStateAction<string>>;
};

type PostEditActionsContextType = {
  post: NewPost;
  isPickerShown: boolean | undefined;
  dispatch: AppDispatch;
  navigate: ReturnType<typeof useNavigate>;
  newPostText: string;
  setNewPostText: React.Dispatch<React.SetStateAction<string>>;
  loggedInUser: RootState["auth"]["loggedInUser"];
  newPostType: RootState["postEdit"]["newPostType"];
  sideBar: RootState["postEdit"]["sideBar"];
  homePage: RootState["postEdit"]["homePage"];
};

const PostEditActionsContext = createContext<PostEditActionsContextType | undefined>(undefined);

export const PostEditActions: FC<PostEditActionsProps> & {
  Media: FC;
  Gif: FC;
  Poll: FC;
  Emoji: FC;
  Schedule: FC;
  Location: FC;
} = ({ children, post, isPickerShown, newPostText, setNewPostText }) => {
  const { loggedInUser } = useSelector((state: RootState) => state.auth);
  const { newPostType, sideBar, homePage } = useSelector((state: RootState) => state.postEdit);
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();

  const value = {
    post,
    isPickerShown,
    newPostText,
    setNewPostText,
    dispatch,
    navigate,
    loggedInUser,
    newPostType,
    sideBar,
    homePage,
  };

  return (
    <PostEditActionsContext.Provider value={value}>
      <section className="post-edit-action-btns">{children}</section>
    </PostEditActionsContext.Provider>
  );
};

const Media: FC = () => {
  const { post, isPickerShown, dispatch, newPostType, loggedInUser } =
    useContext(PostEditActionsContext)!;

  const [isMultiple, setIsMultiple] = useState(true);

  const fileRef = useRef<HTMLInputElement>(null);

  const isDisabled = post?.imgs.length === 4 || !!post?.gif || !!post?.poll || !!post?.video;

  function onUploadFiles(e: React.ChangeEvent<HTMLInputElement>) {
    if (!post) return;
    const { files } = e.target;
    if (!files) return;
    const { isValid, type } = validateFiles([...files]);
    if (!isValid) return;
    if (type === "video") onUploadVideo([...files].at(0)!);
    else onUploadImgs([...files]);
    e.target.value = "";
  }

  function validateFiles(files: File[]): { isValid: boolean; type?: string } {
    const fileTypes = [...files].map(file => file.type.slice(0, 5));
    const isValidFileType = fileTypes.every(
      fileType => fileType === "image" || fileType === "video"
    );
    if (!isValidFileType) {
      const msg = {
        type: "info",
        text: "Only images and videos are allowed.",
      } as TypeOfUserMsg;
      toast.success(t => <UserMsg userMsg={msg} onDismiss={() => toast.dismiss(t.id)} />);

      return { isValid: false };
    }
    const isVideoType = fileTypes.some(fileType => fileType === "video");
    if (isVideoType) return validateVideoFile(files);
    else return validateImgFiles(files);
  }

  function validateVideoFile(files: File[]): { isValid: boolean; type?: string } {
    const isMoreThanOneVideoFile = files.length > 1;
    if (isMoreThanOneVideoFile) {
      const msg = {
        type: "info",
        text: "Only one video is allowed.",
      } as TypeOfUserMsg;
      toast.success(t => <UserMsg userMsg={msg} onDismiss={() => toast.dismiss(t.id)} />);

      return { isValid: false };
    }
    const videoFile = [...files].at(0)!;
    const isVideoGreaterThan10MB = videoFile.size > 10000000;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const { isVerified } = loggedInUser!;
    if (!isVerified && isVideoGreaterThan10MB) {
      const msg = {
        type: "info",
        text: "Only verified users can upload videos larger than 10MB.",
      } as TypeOfUserMsg;
      toast.success(t => <UserMsg userMsg={msg} onDismiss={() => toast.dismiss(t.id)} />);

      return { isValid: false };
    }
    return { isValid: true, type: "video" };
  }

  function validateImgFiles(files: File[]): { isValid: boolean; type?: string } {
    const isImagesGreaterThan4 = [...files].length + post!.imgs.length > 4;
    if (isImagesGreaterThan4) {
      const msg = {
        type: "info",
        text: "Please choose either 1 GIF or up to 4 photos.",
      } as TypeOfUserMsg;
      toast.success(t => <UserMsg userMsg={msg} onDismiss={() => toast.dismiss(t.id)} />);

      return { isValid: false };
    }
    return { isValid: true, type: "image" };
  }

  async function onUploadImgs(files: File[]) {
    if (!post) return;
    const newImgs = [...post.imgs];
    files.forEach(async file => {
      try {
        if (file) {
          const currIdx = newImgs.length;
          newImgs.push({ url: "", isLoading: true, file });
          dispatch(updateNewPost({ newPost: { ...post, imgs: [...newImgs] }, newPostType }));
          const dataUrl = await readAsDataURL(file);
          newImgs[currIdx] = { url: dataUrl, isLoading: false, file };
          dispatch(updateNewPost({ newPost: { ...post, imgs: [...newImgs] }, newPostType }));
        }
      } catch (error) {
        console.error("Error reading file:", error);
      }
    });
  }

  async function onUploadVideo(file: File) {
    if (!post) return;
    try {
      const newPostPreLoad = { ...post, video: { url: "", isLoading: true, file } };
      dispatch(updateNewPost({ newPost: newPostPreLoad, newPostType }));
      const dataUrl = await readAsDataURL(file);
      const newPost = { ...post, video: { url: dataUrl, isLoading: false, file } };
      dispatch(updateNewPost({ newPost, newPostType }));
    } catch (error) {
      console.error("Error reading file:", error);
    }
  }

  useEffect(() => {
    if (!post) return;
    if (post.imgs.length < 3) setIsMultiple(true);
    else setIsMultiple(false);
  }, [post?.imgs, post]);

  return (
    <button
      className={"post-edit-action-btn" + (isDisabled ? " disabled" : "")}
      onClick={() => {
        if (fileRef.current && !isDisabled && isPickerShown) fileRef.current.click();
      }}
    >
      <div className="post-edit-action-icon-container">
        <FiImage />
      </div>
      <input
        type="file"
        accept={"image/*,video/*"}
        multiple={isMultiple}
        disabled={post?.imgs.length === 4 || !isPickerShown}
        id={"img-video-upload"}
        onChange={onUploadFiles}
        style={{ display: "none" }}
        ref={fileRef}
      />
    </button>
  );
};

const Gif: FC = () => {
  const { isPickerShown, post, dispatch } = useContext(PostEditActionsContext)!;
  const [searchTerm, setSearchTerm] = useState<string>("");
  const searchBarInputRef = useRef<HTMLInputElement>(null);
  const [openedModalName, setOpenedModalName] = useState("");

  const { gifs, isLoading, isSuccess, isError, isEmpty } = useQueryGifs(searchTerm);

  const isDisabled =
    (post?.imgs.length && post.imgs.length > 0) || !!post?.gif || !!post?.poll || !!post?.video;

  function resetState() {
    setSearchTerm("");
    if (!searchBarInputRef.current) return;
    searchBarInputRef.current.value = "";
  }

  function handleBtnCloseClick() {
    if (searchTerm) return setSearchTerm("");
    dispatch(setIsScrollRedirectActive(true));
    setOpenedModalName("");
    resetState();
  }

  function handleBtnOpenClick() {
    if (!isPickerShown) return;
    dispatch(setIsScrollRedirectActive(false));
    setOpenedModalName("gif-picker");
  }

  useEffect(() => {
    resetState();
  }, [openedModalName]);

  return (
    <Modal
      externalStateControl={{ openedModalName, setOpenedModalName }}
      onClose={() => dispatch(setIsScrollRedirectActive(true))}
    >
      <button
        disabled={isDisabled}
        className={"post-edit-action-btn" + (isDisabled ? " disabled" : "")}
        onClick={handleBtnOpenClick}
      >
        <div className="post-edit-action-icon-container">
          <RiFileGifLine />
        </div>
      </button>

      <Modal.Window name="gif-picker" mainScreenMode="dark" mainScreenZIndex={100}>
        <header className="gif-picker-header">
          <button className="gif-picker-header-btn" onClick={handleBtnCloseClick}>
            {searchTerm ? <IoArrowBackSharp /> : <AiOutlineClose />}
          </button>
          <GifSearchBar
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            SearchBarInputRef={searchBarInputRef}
          />
        </header>

        {searchTerm && (
          <>
            {isLoading && <SpinnerLoader />}
            {isSuccess && !isEmpty && (
              <GifList onToggleElementVisibility={setOpenedModalName} gifs={gifs as TypeOfGif[]} />
            )}
            {isSuccess && isEmpty && <p className="no-res-msg">no gifs to show</p>}
            {isError && <ErrorMsg msg={"Couldn't get gifs. Please try again later."} />}
          </>
        )}

        {!searchTerm && <GifCategoryList setCurrCategory={setSearchTerm} />}
      </Modal.Window>
    </Modal>
  );
};

const Poll: FC = () => {
  const { post, isPickerShown, dispatch, newPostType } = useContext(PostEditActionsContext)!;

  const isDisabled =
    (post?.imgs.length && post.imgs.length > 0) ||
    !!post?.gif ||
    !!post?.poll ||
    !!post?.video ||
    !!post?.schedule ||
    !!post?.quotedPostId;

  function handleBtnClick() {
    if (!isPickerShown || !post) return;
    const defaultPoll: TypeOfPoll = {
      options: [
        { text: "", voteCount: 0, isLoggedInUserVoted: false },
        { text: "", voteCount: 0, isLoggedInUserVoted: false },
      ],
      length: {
        days: 1,
        hours: 0,
        minutes: 0,
      },
      isVotingOff: false,
      createdAt: Date.now(),
    };
    dispatch(updateNewPost({ newPost: { ...post, poll: defaultPoll }, newPostType }));
  }

  return (
    <button
      disabled={isDisabled}
      className={"post-edit-action-btn" + (isDisabled ? " disabled" : "")}
      onClick={handleBtnClick}
    >
      <div className="post-edit-action-icon-container">
        <FiList />
      </div>
    </button>
  );
};

const Emoji: FC = () => {
  const { post, isPickerShown, dispatch, newPostText, setNewPostText } =
    useContext(PostEditActionsContext)!;

  const { newPostType } = useSelector((state: RootState) => state.postEdit);
  const [openedModalName, setOpenedModalName] = useState("");

  function handleBtnClick() {
    if (!isPickerShown) return;
    setOpenedModalName("emoji-picker");
  }

  function onEmojiPicked(emoji: TypeOfEmoji) {
    if (!post) return;
    const nativeEmoji = emoji.native;
    const newText = newPostText + nativeEmoji;
    setNewPostText(newText);
    dispatch(updateNewPost({ newPost: { ...post, text: newText }, newPostType }));
    setOpenedModalName("");
  }

  return (
    <Modal externalStateControl={{ openedModalName, setOpenedModalName }}>
      <Modal.OpenBtn
        modalName="emoji-picker"
        setPositionByRef={true}
        modalHeight={300}
        externalControlFunc={handleBtnClick}
      >
        <button className="post-edit-action-btn">
          <div className="post-edit-action-icon-container">
            <BsEmojiSmile />
          </div>
        </button>
      </Modal.OpenBtn>

      <Modal.Window
        name="emoji-picker"
        mainScreenZIndex={1000}
        includeTippy={true}
        style={{ padding: 0, transform: "translate(-50%, -10px);" }}
      >
        <div className="emoji-picker-container">
          <div className="emoji-post-edit-option-container">
            <Picker data={data} onEmojiSelect={onEmojiPicked} />
          </div>
        </div>
      </Modal.Window>
    </Modal>
  );
};

const Schedule: FC = () => {
  const { post, isPickerShown, navigate, sideBar, homePage } = useContext(PostEditActionsContext)!;

  const isDisabled =
    !!post?.poll || !!homePage.currPostIdx || !!sideBar.currPostIdx || !!post?.quotedPostId;

  function handleBtnScheduleClick() {
    if (!isPickerShown) return;
    navigate("post-schedule", { relative: "path" });
  }

  return (
    <button
      disabled={isDisabled}
      className={"post-edit-action-btn" + (isDisabled ? " disabled" : "")}
      onClick={handleBtnScheduleClick}
    >
      <div className="post-edit-action-icon-container">
        <CiCalendarDate />
      </div>
    </button>
  );
};

const Location: FC = () => {
  const { isPickerShown, navigate, loggedInUser } = useContext(PostEditActionsContext)!;

  const isDisabled = !loggedInUser?.isApprovedLocation;

  function handleBtnLocationClick() {
    if (!isPickerShown) return;
    if (loggedInUser?.isApprovedLocation) {
      navigate("post-location", { relative: "path" });
      return;
    }

    const msg = {
      type: "info",
      text: "Please set your location in your profile first.",
    } as TypeOfUserMsg;
    toast.success(t => <UserMsg userMsg={msg} onDismiss={() => toast.dismiss(t.id)} />);
  }

  return (
    <button
      disabled={isDisabled}
      className={"post-edit-action-btn" + (isDisabled ? " disabled" : "")}
      onClick={handleBtnLocationClick}
    >
      <div className="post-edit-action-icon-container">
        <IoLocationSharp />
      </div>
    </button>
  );
};

PostEditActions.Media = Media;
PostEditActions.Gif = Gif;
PostEditActions.Poll = Poll;
PostEditActions.Emoji = Emoji;
PostEditActions.Schedule = Schedule;
PostEditActions.Location = Location;
