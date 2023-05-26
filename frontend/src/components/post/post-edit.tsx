import { ReactElement, useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { FaGlobeAmericas } from "react-icons/fa";
import { BtnCreatePost } from "../btns/btn-create-post";
import { PostEditActions } from "../btns/post-edit-actions";
import { TextIndicator } from "../other/text-indicator";
import { AiOutlinePlus } from "react-icons/ai";
import { NewPost, NewPostImg, Poll } from "../../../../shared/interfaces/post.interface";
import { AppDispatch } from "../../store/types";
import { addPost, setNewPost } from "../../store/actions/post.actions";
import { PostEditImg } from "./post-edit-img";
import { Gif as GifType } from "../../../../shared/interfaces/gif.interface";
import { GifEdit } from "../gif/gif-edit";
import { BtnClose } from "../btns/btn-close";
import { UserImg } from "../user/user-img";
import { BtnToggleAudience } from "../btns/btn-toggle-audience";
import { BtnToggleRepliers } from "../btns/btn-toggle-repliers";
import { PollEdit } from "../poll/poll-edit";
import { PostDateTitle } from "../other/post-date-title";
import { IoLocationSharp } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { uploadFileToCloudinary } from "../../services/upload.service";
import { PostEditVideo } from "./post-edit-video";
import { utilService } from "../../services/util.service/utils.service";

interface PostEditProps {
  isHomePage?: boolean;
  onClickBtnClose?: () => void;
}

interface audienceSettings {
  title: string;
  value: string;
}

interface repliersSetting {
  title: string;
  icon: ReactElement;
  value: string;
}
export interface postSettings {
  audience: audienceSettings;
  repliersType: repliersSetting;
}

export const PostEdit: React.FC<PostEditProps> = ({ isHomePage = false, onClickBtnClose }) => {
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const { loggedinUser } = useSelector((state: RootState) => state.authModule);
  const { newPost }: { newPost: NewPost } = useSelector((state: RootState) => state.postModule);
  const [isPickerShown, setIsPickerShown] = useState<boolean>(!isHomePage);
  const [isPostValid, setIsPostValid] = useState<boolean>(true);
  const [postSaveInProgress, setPostSaveInProgress] = useState<boolean>(false);
  const [isVideoRemoved, setIsVideoRemoved] = useState<boolean>(false);

  const [poll, setPoll] = useState<Poll | null>(null);

  const [postSettings, setPostSettings] = useState<{
    audience: audienceSettings;
    repliersType: repliersSetting;
  }>({
    audience: {
      title: "Everyone",
      value: "everyone",
    },
    repliersType: {
      title: "Everyone",
      icon: <FaGlobeAmericas />,
      value: "everyone",
    },
  });

  useEffect(() => {
    if (
      (newPost.text.length > 0 && newPost.text.length <= 247) ||
      newPost.imgs.length > 0 ||
      newPost.gif ||
      newPost.video ||
      poll?.options.some(option => !option.text)
    ) {
      setIsPostValid(true);
    } else {
      setIsPostValid(false);
    }
  }, [newPost.text, newPost.imgs, newPost.gif, newPost.video]);

  const detectURL = useRef(
    utilService.debounce(async (newPost: NewPost, text: string, isVideoRemoved: boolean) => {
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      const urls = text.match(urlRegex);
      let youtubeURL = "";
      if (urls) {
        for (let i = urls.length - 1; i >= 0; i--) {
          if (urls[i].includes("https://www.youtube.com/watch")) {
            youtubeURL = urls[i];
            break;
          }
        }
      }

      if (youtubeURL && !isVideoRemoved) {
        dispatch(
          setNewPost({
            ...newPost,
            text,
            video: { url: youtubeURL, isLoading: false, file: null },
          })
        );
      } else if (newPost.video) {
        dispatch(setNewPost({ ...newPost, text, video: null }));
      }
    }, 500)
  );

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const inputValue = e.target.value;
    dispatch(setNewPost({ ...newPost, text: inputValue }));
    detectURL.current(newPost, inputValue, isVideoRemoved);
    e.target.style.height = "auto";
    e.target.style.height = e.target.scrollHeight + "px";
  };

  const onAddPost = async () => {
    try {
      setPostSaveInProgress(true);
      if (!loggedinUser) return;

      if (newPost.imgs.length > 0) {
        const prms = newPost.imgs.map(async (img, idx) => {
          const currImgUrl = await uploadFileToCloudinary(img.file, "image");
          return { url: currImgUrl, sortOrder: idx };
        });
        const savedImgUrl = await Promise.all(prms);
        newPost.imgs = savedImgUrl.filter(img => img.url) as unknown as NewPostImg[];
      }

      if (newPost.video) {
        if (newPost.video.file) {
          const videoUrl = await uploadFileToCloudinary(newPost.video.file, "video");
          newPost.videoUrl = videoUrl;
        } else {
          newPost.videoUrl = newPost.video.url;
        }
        delete newPost.video;
      }

      if (poll) newPost.poll = { ...poll };
      await dispatch(addPost(newPost));

      dispatch(
        setNewPost({
          text: "",
          audience: "everyone",
          repliersType: "everyone",
          isPublic: true,
          imgs: [],
          video: null,
          gif: null,
        } as unknown as NewPost)
      );

      setPoll(null);
      setIsPickerShown(false);
      setPostSaveInProgress(false);
      setIsPostValid(false);
      textAreaRef.current!.style.height = "auto";
    } catch (err) {
      setPostSaveInProgress(false);
    }
  };

  const openPicker = () => {
    if (isHomePage && !isPickerShown) {
      setIsPickerShown(true);
      textAreaRef.current?.focus();
    }
  };

  const onGoToLocationPage = () => {
    if (!isPickerShown) return;
    navigate("post-location");
  };

  const onAddPostToThread = () => {
    if (!isPickerShown) return;
    if (isHomePage) navigate("/compose");
  };

  const onRemoveVideo = () => {
    const videoUrl = newPost.video?.url;
    dispatch(setNewPost({ ...newPost, video: null }));
    setIsVideoRemoved(true);
  };
  return (
    <section
      className={"post-edit" + (postSaveInProgress ? " save-mode" : "")}
      onClick={openPicker}
    >
      {onClickBtnClose && <BtnClose onClickBtn={onClickBtnClose} />}
      {postSaveInProgress && <span className="progress-bar"></span>}

      <div className="content-container">
        {loggedinUser && <UserImg imgUrl={loggedinUser?.imgUrl} />}

        <main className={"main-content" + (isHomePage && !isPickerShown ? " gap-0" : "")}>
          {isPickerShown && (
            <BtnToggleAudience postSettings={postSettings} setPostSettings={setPostSettings} />
          )}
          {newPost.schedule && <PostDateTitle date={newPost.schedule} isLink={isPickerShown} />}
          <textarea
            className={
              "post-edit-text-area" +
              (isHomePage ? " home-page-height" : "") +
              (isHomePage && !isPickerShown ? " pt-10" : "")
            }
            placeholder={poll ? "Ask a question..." : "What's happening?"}
            value={newPost.text}
            onChange={handleTextChange}
            ref={textAreaRef}
          />
          {newPost.imgs.length > 0 && <PostEditImg />}
          {newPost.video && <PostEditVideo onRemoveVideo={onRemoveVideo} />}
          {newPost.gif && <GifEdit />}
          {poll && <PollEdit poll={poll} setPoll={setPoll} />}

          <div className="btn-replires-location-container">
            {isPickerShown && (
              <BtnToggleRepliers postSettings={postSettings} setPostSettings={setPostSettings} />
            )}
            {newPost.location && (
              <div className="post-edit-location-title" onClick={onGoToLocationPage}>
                <IoLocationSharp /> {newPost.location.name}
              </div>
            )}
          </div>
          <div className={"btns-container" + (isPickerShown ? " border-show" : "")}>
            <PostEditActions isPickerShown={isPickerShown} poll={poll} setPoll={setPoll} />
            <div className="secondary-action-container">
              {isPostValid && (
                <div className="indicator-thread-btn-container">
                  <TextIndicator textLength={newPost.text.length} />
                  <hr className="vertical" />
                  <button className="btn-add-thread" onClick={onAddPostToThread}>
                    <AiOutlinePlus className="btn-add-thread-icon" />
                  </button>
                </div>
              )}
              <BtnCreatePost
                isLinkToNestedPage={false}
                isDisabled={!isPostValid}
                onAddPost={onAddPost}
              />
            </div>
          </div>
        </main>
      </div>
    </section>
  );
};
