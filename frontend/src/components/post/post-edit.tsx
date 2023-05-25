import { ReactElement, useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { FaGlobeAmericas } from "react-icons/fa";
import { BtnCreatePost } from "../btns/btn-create-post";
import { PostEditActionBtns } from "../btns/post-edit-action-btns";
import { TextIndicator } from "../other/text-indicator";
import { AiOutlinePlus } from "react-icons/ai";
import { NewPost, Poll } from "../../../../shared/interfaces/post.interface";
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

  const [text, setText] = useState<string>("");
  const [imgs, setImgs] = useState<{ url: string; isLoading: boolean; file: File }[]>([]);
  const [video, setVideo] = useState<{ url: string; isLoading: boolean; file: File | null } | null>(
    null
  );
  const [gif, setGif] = useState<GifType | null>(null);
  const [isPickerShown, setIsPickerShown] = useState<boolean>(!isHomePage);
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

  const [isBtnCreatePostDisabled, setIsBtnCreatePostDisabled] = useState<boolean>(true);
  const [postSaveInProgress, setPostSaveInProgress] = useState<boolean>(false);
  const [isVideoRemoved, setIsVideoRemoved] = useState<boolean>(false);

  useEffect(() => {
    if ((text.length > 0 && text.length <= 247) || imgs.length > 0 || gif || video) {
      setIsBtnCreatePostDisabled(false);
    } else {
      setIsBtnCreatePostDisabled(true);
    }
  }, [text, imgs, gif, video]);

  const detectURL = useRef(
    utilService.debounce(async (text: string, isVideoRemoved: boolean) => {
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      const urls = text.match(urlRegex);
      let youtubeURL = "";
      if (urls) {
        for (let i = urls.length - 1; i >= 0; i--) {
          if (urls[i].includes("youtube.com/watch")) {
            youtubeURL = urls[i];
            break;
          }
        }
      }

      if (youtubeURL && !isVideoRemoved) {
        setVideo({ url: youtubeURL, isLoading: false, file: null });
      } else {
        setVideo(null);
      }
    }, 500)
  );

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const inputValue = e.target.value;
    setText(inputValue);
    detectURL.current(inputValue, isVideoRemoved);
    e.target.style.height = "auto";
    e.target.style.height = e.target.scrollHeight + "px";
  };

  const onAddPost = async () => {
    try {
      setPostSaveInProgress(true);
      if (!loggedinUser) return;

      if (text) {
        newPost.text = text;
      }

      if (imgs.length > 0) {
        const prms = imgs.map(async (img, idx) => {
          const currImgUrl = await uploadFileToCloudinary(img.file, "image");
          return { url: currImgUrl, sortOrder: idx };
        });
        const savedImgUrl = await Promise.all(prms);
        newPost.imgs = savedImgUrl.filter(img => img.url);
      }

      if (video) {
        if (video.file) {
          const videoUrl = await uploadFileToCloudinary(video.file, "video");
          newPost.videoUrl = videoUrl;
        } else {
          newPost.videoUrl = video.url;
        }
      }

      if (gif) newPost.gif = gif;
      if (poll) newPost.poll = { ...poll };
      await dispatch(addPost(newPost));

      dispatch(
        setNewPost({
          text: "",
          audience: "everyone",
          repliersType: "everyone",
          isPublic: true,
        } as NewPost)
      );

      setIsPickerShown(false);
      setText("");
      setImgs([]);
      setVideo(null);
      setGif(null);
      setPoll(null);
      setPostSaveInProgress(false);
      setIsBtnCreatePostDisabled(true);
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
            value={text}
            onChange={handleTextChange}
            ref={textAreaRef}
          />
          {imgs.length > 0 && <PostEditImg imgs={imgs} setImgs={setImgs} />}
          {video && (
            <PostEditVideo
              video={video}
              setVideo={setVideo}
              setIsVideoRemoved={setIsVideoRemoved}
            />
          )}
          {gif && <GifEdit gif={gif} setGif={setGif} />}
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
            <PostEditActionBtns
              imgs={imgs}
              setImgs={setImgs}
              video={video}
              setVideo={setVideo}
              gif={gif}
              setGif={setGif}
              isPickerShown={isPickerShown}
              poll={poll}
              setPoll={setPoll}
            />
            <div className="secondary-action-container">
              {text.length > 0 && (
                <div className="indicator-thread-btn-container">
                  <TextIndicator textLength={text.length} />
                  <hr className="vertical" />
                  <button className="btn-add-thread">
                    <AiOutlinePlus className="btn-add-thread-icon" />
                  </button>
                </div>
              )}
              <BtnCreatePost
                isLinkToNestedPage={false}
                isDisabled={isBtnCreatePostDisabled}
                onAddPost={onAddPost}
              />
            </div>
          </div>
        </main>
      </div>
    </section>
  );
};
