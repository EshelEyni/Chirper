/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { FC, useState, createContext, useContext, useRef, useEffect } from "react";
import { NewPost, Post, Poll as TypeOfPoll } from "../../../../../shared/interfaces/post.interface";
import {
  NewPostType,
  setNewPostType,
  setNewPosts,
  updateNewPost,
} from "../../../store/slices/postEditSlice";
import {
  copyToClipboard,
  formatNumToK,
  getToolTipStyles,
  readAsDataURL,
} from "../../../services/util/utils.service";
import { toast } from "react-hot-toast";
import { UserMsg } from "../../Msg/UserMsg/UserMsg";
import { AppDispatch } from "../../../store/types";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../store/store";
import { UserMsg as TypeOfUserMsg } from "../../../../../shared/interfaces/system.interface";
import { FiImage, FiList, FiUpload } from "react-icons/fi";
import { setIsScrollRedirectActive } from "../../../store/slices/systemSlice";
import { useQueryGifs } from "../../../hooks/reactQuery/gif/useQueryGifs";
import { IoArrowBackSharp, IoLocationSharp } from "react-icons/io5";
import { AiOutlineClose, AiOutlineLink, AiOutlineRetweet } from "react-icons/ai";
import { GifSearchBar } from "../../Gif/GifSearchBar/GifSearchBar";
import { Modal } from "../../Modal/Modal";
import { RiBarChartGroupedFill, RiFileGifLine } from "react-icons/ri";
import { GifCategory, Gif as TypeOfGif } from "../../../../../shared/interfaces/gif.interface";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import { BsEmojiSmile } from "react-icons/bs";
import { Emoji as TypeOfEmoji } from "../../../../../shared/interfaces/post.interface";
import { CiCalendarDate } from "react-icons/ci";
import { useNavigate } from "react-router-dom";
import "./PostActions.scss";
import { Tooltip } from "react-tooltip";
import { useUniqueID } from "../../../hooks/app/useIDRef";
import { FaHeart, FaRegComment, FaRegHeart } from "react-icons/fa";
import { useCreateRepost } from "../../../hooks/reactQuery/post/useCreateRepost";
import { useRemoveRepost } from "../../../hooks/reactQuery/post/useRemoveRepost";
import { HiOutlinePencilAlt } from "react-icons/hi";
import { useRemoveLike } from "../../../hooks/reactQuery/post/useRemoveLike";
import { useAddLike } from "../../../hooks/reactQuery/post/useAddLike";
import { useRemoveBookmark } from "../../../hooks/reactQuery/post/useRemoveBookmark";
import { useAddBookmark } from "../../../hooks/reactQuery/post/useAddBookmark";
import postService from "../../../services/post.service";
import { MdOutlineBookmarkAdd, MdOutlineBookmarkRemove } from "react-icons/md";
import { useQueryGifCategories } from "../../../hooks/reactQuery/gif/useQueryGifCategories";
import { AsyncList } from "../../App/AsyncList/AsyncList";
import { GifCategoryPreview } from "../../Gif/GifCategoryPreview/GifCategoryPreview";
import { GifPreview } from "../../Gif/GifPreview/GifPreview";
import { BtnSwitchPlay } from "../../Btns/BtnSwitchPlay/BtnSwitchPlay";

type PostEditActionsProps = {
  children: React.ReactNode;
  newPost?: NewPost;
  post?: Post;
  isPickerShown?: boolean;
  newPostText?: string;
  setNewPostText?: React.Dispatch<React.SetStateAction<string>>;
  className?: string;
};

type PostEditActionsContextType = {
  newPost?: NewPost;
  post?: Post;
  isPickerShown?: boolean;
  dispatch: AppDispatch;
  navigate: ReturnType<typeof useNavigate>;
  newPostText?: string;
  setNewPostText?: React.Dispatch<React.SetStateAction<string>>;
  loggedInUser: RootState["auth"]["loggedInUser"];
  newPostType: RootState["postEdit"]["newPostType"];
  sideBar: RootState["postEdit"]["sideBar"];
  homePage: RootState["postEdit"]["homePage"];
  tooltipStyle: React.CSSProperties;
};

const PostEditActionsContext = createContext<PostEditActionsContextType | undefined>(undefined);

export const PostActions: FC<PostEditActionsProps> & {
  Media: FC;
  Gif: FC;
  Poll: FC;
  Emoji: FC;
  Schedule: FC;
  Location: FC;
  Reply: FC;
  Repost: FC;
  Like: FC;
  View: FC;
  Share: FC;
} = ({ children, newPost, post, isPickerShown, newPostText, setNewPostText, className }) => {
  const { loggedInUser } = useSelector((state: RootState) => state.auth);
  const { newPostType, sideBar, homePage } = useSelector((state: RootState) => state.postEdit);
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();

  const tooltipStyle = useRef(getToolTipStyles()).current;

  const value = {
    newPost,
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
    tooltipStyle,
  };

  return (
    <PostEditActionsContext.Provider value={value}>
      <section className={`post-actions ${className}`}>{children}</section>
    </PostEditActionsContext.Provider>
  );
};

const Media: FC = () => {
  const {
    newPost: post,
    isPickerShown,
    dispatch,
    newPostType,
    loggedInUser,
    tooltipStyle,
  } = useContext(PostEditActionsContext)!;

  const [isMultiple, setIsMultiple] = useState(true);
  const { id: btnId } = useUniqueID();

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
      toast.success(<UserMsg userMsg={msg} />);

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
      toast.success(<UserMsg userMsg={msg} />);

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
      toast.success(<UserMsg userMsg={msg} />);

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
      toast.success(<UserMsg userMsg={msg} />);

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
    <>
      <button
        className={"post-edit-action-btn" + (isDisabled ? " disabled" : "")}
        onClick={() => {
          if (fileRef.current && !isDisabled && isPickerShown) fileRef.current.click();
        }}
        data-tooltip-id={btnId}
        data-tooltip-content={"Media"}
        data-tooltip-place="bottom"
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
      <Tooltip
        id={btnId}
        offset={5}
        noArrow={true}
        delayShow={200}
        delayHide={200}
        style={tooltipStyle}
      />
    </>
  );
};

const Gif: FC = () => {
  const {
    isPickerShown,
    newPost: post,
    newPostType,
    dispatch,
    tooltipStyle,
  } = useContext(PostEditActionsContext)!;

  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const searchBarInputRef = useRef<HTMLInputElement>(null);
  const [openedModalName, setOpenedModalName] = useState("");
  const { id: btnId } = useUniqueID();

  const { gifCategories, isLoading, isSuccess, isError, isEmpty } = useQueryGifCategories();

  const {
    gifs,
    isLoading: isLoadingGif,
    isSuccess: isSuccessGif,
    isError: isErrorGif,
    isEmpty: isEmptyGif,
  } = useQueryGifs(searchTerm);

  const isDisabled =
    (post?.imgs.length && post.imgs.length > 0) || !!post?.gif || !!post?.poll || !!post?.video;

  async function handleCategoryClick(category: string) {
    setSearchTerm(category);
  }

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

  function handleGifClick(gif: TypeOfGif) {
    if (!post) return;
    dispatch(updateNewPost({ newPost: { ...post, gif }, newPostType }));
    setOpenedModalName("");
  }

  function handleChange() {
    setIsPlaying(prev => !prev);
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
        data-tooltip-id={btnId}
        data-tooltip-content={"GIF"}
        data-tooltip-place="bottom"
      >
        <div className="post-edit-action-icon-container">
          <RiFileGifLine />
        </div>
      </button>
      <Tooltip
        id={btnId}
        offset={5}
        noArrow={true}
        delayShow={200}
        delayHide={200}
        style={tooltipStyle}
      />

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
            <BtnSwitchPlay isPlaying={isPlaying} handleChange={handleChange} />
            <AsyncList
              items={gifs as TypeOfGif[]}
              isLoading={isLoadingGif}
              isSuccess={isSuccessGif}
              isError={isErrorGif}
              isEmpty={isEmptyGif as boolean}
              entityName="gifs"
              className="gif-list"
              render={(gif: TypeOfGif, idx: number) => {
                const ratio = gif.size.width / gif.size.height;
                const width = 120 * ratio + "px";
                return (
                  <GifPreview
                    key={gif.id}
                    gif={gif}
                    idx={idx}
                    width={width}
                    isPlaying={isPlaying}
                    handleGifClick={handleGifClick}
                  />
                );
              }}
            />
          </>
        )}

        {!searchTerm && (
          <AsyncList
            items={gifCategories as GifCategory[]}
            isLoading={isLoading}
            isSuccess={isSuccess}
            isError={isError}
            isEmpty={isEmpty as boolean}
            entityName="gif categories"
            className="gif-category-list"
            render={(gifCategory: GifCategory, idx: number, arr: GifCategory[]) => {
              const isLast = idx === arr.length - 1;
              return (
                <GifCategoryPreview
                  key={gifCategory.id}
                  gifCategory={gifCategory}
                  handleCategoryClick={handleCategoryClick}
                  isLast={isLast}
                />
              );
            }}
          />
        )}
      </Modal.Window>
    </Modal>
  );
};

const Poll: FC = () => {
  const {
    newPost: post,
    isPickerShown,
    dispatch,
    newPostType,
    tooltipStyle,
  } = useContext(PostEditActionsContext)!;
  const { id: btnId } = useUniqueID();
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
      updatedAt: Date.now(),
    };
    dispatch(updateNewPost({ newPost: { ...post, poll: defaultPoll }, newPostType }));
  }

  return (
    <>
      <button
        disabled={isDisabled}
        className={"post-edit-action-btn" + (isDisabled ? " disabled" : "")}
        onClick={handleBtnClick}
        data-tooltip-id={btnId}
        data-tooltip-content={"Poll"}
        data-tooltip-place="bottom"
      >
        <div className="post-edit-action-icon-container">
          <FiList />
        </div>
      </button>
      <Tooltip
        id={btnId}
        offset={5}
        noArrow={true}
        delayShow={200}
        delayHide={200}
        style={tooltipStyle}
      />
    </>
  );
};

const Emoji: FC = () => {
  const {
    newPost: post,
    isPickerShown,
    dispatch,
    newPostText,
    setNewPostText,
    tooltipStyle,
  } = useContext(PostEditActionsContext)!;

  const { newPostType } = useSelector((state: RootState) => state.postEdit);
  const [openedModalName, setOpenedModalName] = useState("");
  const { id: btnId } = useUniqueID();

  function handleBtnClick() {
    if (!isPickerShown) return;
    setOpenedModalName("emoji-picker");
  }

  function onEmojiPicked(emoji: TypeOfEmoji) {
    if (!post || !newPostText || !setNewPostText) return;
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
        <button
          className="post-edit-action-btn"
          data-tooltip-id={btnId}
          data-tooltip-content={"Emoji"}
          data-tooltip-place="bottom"
        >
          <div className="post-edit-action-icon-container">
            <BsEmojiSmile />
          </div>
        </button>
      </Modal.OpenBtn>
      <Tooltip
        id={btnId}
        offset={5}
        noArrow={true}
        delayShow={200}
        delayHide={200}
        style={tooltipStyle}
      />

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
  const {
    newPost: post,
    isPickerShown,
    navigate,
    sideBar,
    homePage,
    tooltipStyle,
  } = useContext(PostEditActionsContext)!;

  const { id: btnId } = useUniqueID();

  const isDisabled =
    !!post?.poll || !!homePage.currPostIdx || !!sideBar.currPostIdx || !!post?.quotedPostId;

  function handleBtnScheduleClick() {
    if (!isPickerShown) return;
    navigate("post-schedule", { relative: "path" });
  }

  return (
    <>
      <button
        disabled={isDisabled}
        className={"post-edit-action-btn" + (isDisabled ? " disabled" : "")}
        onClick={handleBtnScheduleClick}
        data-tooltip-id={btnId}
        data-tooltip-content={"Schedule"}
        data-tooltip-place="bottom"
      >
        <div className="post-edit-action-icon-container">
          <CiCalendarDate />
        </div>
      </button>
      <Tooltip
        id={btnId}
        offset={5}
        noArrow={true}
        delayShow={200}
        delayHide={200}
        style={tooltipStyle}
      />
    </>
  );
};

const Location: FC = () => {
  const { isPickerShown, navigate, loggedInUser, tooltipStyle } =
    useContext(PostEditActionsContext)!;

  const { id: btnId } = useUniqueID();
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
    toast.success(<UserMsg userMsg={msg} />);
  }

  return (
    <>
      <button
        disabled={isDisabled}
        className={"post-edit-action-btn" + (isDisabled ? " disabled" : "")}
        onClick={handleBtnLocationClick}
        data-tooltip-id={btnId}
        data-tooltip-content={"Location"}
        data-tooltip-place="bottom"
      >
        <div className="post-edit-action-icon-container">
          <IoLocationSharp />
        </div>
      </button>
      <Tooltip
        id={btnId}
        offset={5}
        noArrow={true}
        delayShow={200}
        delayHide={200}
        style={tooltipStyle}
      />
    </>
  );
};

const Reply: FC = () => {
  const { post, dispatch, navigate, tooltipStyle } = useContext(PostEditActionsContext)!;
  const { id: btnId } = useUniqueID();

  function handleBtnClick() {
    dispatch(setNewPostType(NewPostType.Reply));
    dispatch(setNewPosts({ newPosts: [], newPostType: NewPostType.Reply, post }));
    navigate("compose", { relative: "path" });
  }

  if (!post) return null;
  return (
    <>
      <div className="btn-action-container reply">
        <button className="btn-action" onClick={handleBtnClick}>
          <div
            className="icon-container"
            data-tooltip-id={btnId}
            data-tooltip-content="Reply"
            data-tooltip-place="bottom"
          >
            <FaRegComment />
          </div>
          <span className="count">
            {post.repliesCount > 0 ? formatNumToK(post.repliesCount) : ""}
          </span>
        </button>
      </div>
      <Tooltip
        id={btnId}
        offset={5}
        noArrow={true}
        delayShow={200}
        delayHide={200}
        style={tooltipStyle}
      />
    </>
  );
};

const Repost: FC = () => {
  const { post, loggedInUser, dispatch, navigate, tooltipStyle } =
    useContext(PostEditActionsContext)!;
  const { addRepost } = useCreateRepost();
  const { removeRepost } = useRemoveRepost();
  const { id: btnId } = useUniqueID();
  const isReposted = post?.loggedInUserActionState.isReposted;

  async function onQuotePost() {
    dispatch(setNewPostType(NewPostType.Quote));
    dispatch(setNewPosts({ newPosts: [], newPostType: NewPostType.Quote, post }));
    navigate("compose", { relative: "path" });
  }

  async function onRepost() {
    if (!loggedInUser || !post) return;
    const repostedPost = { ...post };
    addRepost(repostedPost);
  }

  async function onRemoveRepost() {
    if (!loggedInUser || !post) return;
    removeRepost(post.id);
  }

  if (!post) return null;
  return (
    <Modal>
      <Modal.OpenBtn modalName="repost" setPositionByRef={true}>
        <div>
          <div className="btn-action-container repost">
            <button className={"btn-action " + (isReposted ? " clicked" : "")}>
              <div
                className="icon-container"
                data-tooltip-id={btnId}
                data-tooltip-content={"Repost"}
                data-tooltip-place="bottom"
              >
                <AiOutlineRetweet />
              </div>
              <span className="count">
                {post.repostsCount > 0 ? formatNumToK(post.repostsCount) : ""}
              </span>
            </button>
          </div>
          <Tooltip id={btnId} offset={5} noArrow={true} delayShow={200} style={tooltipStyle} />
        </div>
      </Modal.OpenBtn>
      <Modal.Window
        name="repost"
        className="repost-options"
        mainScreenMode="transparent"
        mainScreenZIndex={1000}
        style={{ transform: "translate(-50%,-50%)" }}
      >
        <Modal.CloseBtn onClickFn={isReposted ? onRemoveRepost : onRepost}>
          <button className="btn-repost-option">
            <AiOutlineRetweet size={20} />
            <span>{isReposted ? "undo rechirp" : "rechirp"}</span>
          </button>
        </Modal.CloseBtn>
        <Modal.CloseBtn onClickFn={onQuotePost}>
          <button className="btn-repost-option">
            <HiOutlinePencilAlt size={20} /> <span>quote rechirp</span>
          </button>
        </Modal.CloseBtn>
      </Modal.Window>
    </Modal>
  );
};

const Like: FC = () => {
  const { post, loggedInUser, tooltipStyle } = useContext(PostEditActionsContext)!;
  const { addLike } = useAddLike();
  const { removeLike } = useRemoveLike();

  const { id: btnId } = useUniqueID();

  const isLiked = post?.loggedInUserActionState.isLiked;

  function handleBtnClick() {
    if (!loggedInUser || !post) return;
    if (isLiked) removeLike(post.id);
    else addLike(post.id);
  }

  if (!post) return null;
  return (
    <>
      <div className="btn-action-container like">
        <button className={"btn-action " + (isLiked ? " clicked" : "")} onClick={handleBtnClick}>
          <div
            className="icon-container"
            data-tooltip-id={btnId}
            data-tooltip-content={isLiked ? "Unlike" : "Like"}
            data-tooltip-place="bottom"
          >
            {isLiked ? <FaHeart /> : <FaRegHeart />}
          </div>
          <span className="count">{post.likesCount > 0 ? formatNumToK(post.likesCount) : ""}</span>
        </button>
      </div>
      <Tooltip
        id={btnId}
        offset={5}
        noArrow={true}
        delayHide={200}
        delayShow={200}
        style={tooltipStyle}
      />
    </>
  );
};

const View: FC = () => {
  const { post, navigate, tooltipStyle } = useContext(PostEditActionsContext)!;

  const { id: btnId } = useUniqueID();

  function handleBtnClick() {
    if (!post) return;
    navigate(`post-stats/${post.id}`, { relative: "path" });
  }

  if (!post) return null;
  return (
    <>
      <div className="btn-action-container biew">
        <button className="btn-action" onClick={handleBtnClick}>
          <div
            className="icon-container"
            data-tooltip-id={btnId}
            data-tooltip-content="View"
            data-tooltip-place="bottom"
          >
            <RiBarChartGroupedFill />
          </div>
          <span className="count">{post.viewsCount > 0 ? formatNumToK(post.viewsCount) : ""}</span>
        </button>
      </div>
      <Tooltip
        id={btnId}
        offset={5}
        noArrow={true}
        delayShow={200}
        delayHide={200}
        style={tooltipStyle}
      />
    </>
  );
};

const Share: FC = () => {
  const { post, tooltipStyle } = useContext(PostEditActionsContext)!;
  const isBookmarked = post?.loggedInUserActionState.isBookmarked;

  const { id: btnId } = useUniqueID();
  const { removeBookmark } = useRemoveBookmark();
  const { addBookmark } = useAddBookmark();

  const url = `${location.origin}/post/${post!.id}`;

  function handleBtnCopyLinkClick() {
    if (!post) return;
    postService.updatePostStats(post.id, { isPostLinkCopied: true });
    copyToClipboard(url);
    const msg = {
      type: "info",
      text: "Copied to clipboard",
    } as TypeOfUserMsg;
    toast.success(<UserMsg userMsg={msg} />);
  }

  function handleBtnShareClick() {
    if (!post) return;
    postService.updatePostStats(post.id, { isPostShared: true });
    navigator
      .share({ title: "Chirp", text: post.text, url })
      // eslint-disable-next-line no-console
      .then(() => console.log("Successful share"))
      // eslint-disable-next-line no-console
      .catch(error => console.log("Error sharing", error));
  }

  function handleBtnBookmarkClick() {
    if (!post) return;
    if (isBookmarked) removeBookmark(post.id);
    else addBookmark(post.id);
  }

  return (
    <Modal>
      <Modal.OpenBtn modalName="share" setPositionByRef={true}>
        <div>
          <div className="btn-action-container share">
            <button className="btn-action">
              <div
                className="icon-container"
                data-tooltip-id={btnId}
                data-tooltip-content="Share"
                data-tooltip-place="bottom"
              >
                <FiUpload />
              </div>
            </button>
          </div>
          <Tooltip id={btnId} offset={5} noArrow={true} delayShow={200} style={tooltipStyle} />
        </div>
      </Modal.OpenBtn>
      <Modal.Window
        name="share"
        className="post-share-options"
        mainScreenMode="transparent"
        mainScreenZIndex={1000}
        style={{ transform: "translate(-90%,-30%)" }}
      >
        <Modal.CloseBtn onClickFn={handleBtnCopyLinkClick}>
          <button className="btn-share-option">
            <AiOutlineLink size={20} /> <span>Copy link to Chirp</span>
          </button>
        </Modal.CloseBtn>
        <Modal.CloseBtn onClickFn={handleBtnShareClick}>
          <button className="btn-share-option">
            <FiUpload size={20} /> <span>Share Chirp via...</span>
          </button>
        </Modal.CloseBtn>
        <Modal.CloseBtn onClickFn={handleBtnBookmarkClick}>
          <button className="btn-share-option">
            {isBookmarked ? (
              <MdOutlineBookmarkRemove size={20} />
            ) : (
              <MdOutlineBookmarkAdd size={20} />
            )}{" "}
            <span>{isBookmarked ? "Remove Chirp from Bookmarks" : "Bookmark"}</span>
          </button>
        </Modal.CloseBtn>
      </Modal.Window>
    </Modal>
  );
};

PostActions.Media = Media;
PostActions.Gif = Gif;
PostActions.Poll = Poll;
PostActions.Emoji = Emoji;
PostActions.Schedule = Schedule;
PostActions.Location = Location;
PostActions.Reply = Reply;
PostActions.Repost = Repost;
PostActions.Like = Like;
PostActions.View = View;
PostActions.Share = Share;
