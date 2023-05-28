import { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { BtnCreatePost } from "../btns/btn-create-post";
import { PostEditActions } from "./post-edit-actions";
import { TextIndicator } from "../other/text-indicator";
import { AiOutlinePlus } from "react-icons/ai";
import { NewPost, NewPostImg } from "../../../../shared/interfaces/post.interface";
import { AppDispatch } from "../../store/types";
import { addPost, setNewPosts, updateCurrNewPost } from "../../store/actions/post.actions";
import { PostEditImg } from "./post-edit-img";
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
import { NewPostState } from "../../store/reducers/post.reducer";

interface PostEditProps {
  isHomePage?: boolean;
  onClickBtnClose?: () => void;
}

export const PostEdit: React.FC<PostEditProps> = ({ isHomePage = false, onClickBtnClose }) => {
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const { loggedinUser } = useSelector((state: RootState) => state.authModule);
  const { newPostState }: { newPostState: NewPostState } = useSelector(
    (state: RootState) => state.postModule
  );
  const { newPostType } = newPostState;
  const newPostTypeRef = useRef(newPostState.newPostType);

  const getCurrPost = (): NewPost => {
    const { homePage, sideBar } = newPostState;
    if (newPostTypeRef.current === "home-page") return homePage.posts[homePage.currPostIdx];
    else return sideBar.posts[sideBar.currPostIdx];
  };
  const [currNewPost, setCurrNewPost] = useState<NewPost>(getCurrPost());
  const [isPickerShown, setIsPickerShown] = useState<boolean>(!isHomePage);
  const [isPostValid, setIsPostValid] = useState<boolean>(true);
  const [postSaveInProgress, setPostSaveInProgress] = useState<boolean>(false);
  const [isVideoRemoved, setIsVideoRemoved] = useState<boolean>(false);
  const [isComposeMounted, setIsComposeMounted] = useState<boolean>(false);
  const [inputTextValue, setInputTextValue] = useState(currNewPost?.text || "");

  useEffect(() => {
    const isValid = checkIfPostValid(currNewPost);
    if (isValid !== isPostValid) {
      setIsPostValid(isValid);
    }
  }, [inputTextValue.length, currNewPost, isComposeMounted]);

  useEffect(() => {
    setCurrNewPost(getCurrPost());
  }, [newPostState]);

  const checkIfPostValid = (currPost: NewPost | null): boolean => {
    if (!currPost) return false;
    if (isComposeMounted) return false;
    if (currPost.poll) {
      return (
        currPost.poll.options.every(option => option.text.length > 0) &&
        inputTextValue.length > 0 &&
        inputTextValue.length <= 247
      );
    } else {
      return (
        (inputTextValue.length > 0 && inputTextValue.length <= 247) ||
        currPost.imgs.length > 0 ||
        !!currPost.gif ||
        !!currPost.video
      );
    }
  };

  const detectURL = useRef(
    utilService.debounce(async (currPost: NewPost, text: string, isVideoRemoved: boolean) => {
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

      if (youtubeURL && youtubeURL !== currPost.video?.url && !isVideoRemoved) {
        const newPost = {
          ...currPost,
          text,
          video: { url: youtubeURL, isLoading: false, file: null },
        };

        dispatch(updateCurrNewPost(newPost, newPostType));
      } else if (currPost.video) {
        const newPost = { ...currPost, text, video: null };
        dispatch(updateCurrNewPost(newPost, newPostType));
      }
    }, 500)
  );

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInputTextValue(value);
    detectURL.current(currNewPost, value, isVideoRemoved);
    e.target.style.height = "auto";
    e.target.style.height = e.target.scrollHeight + "px";
  };

  const handleTextBlur = () => {
    if (!currNewPost) return;
    const newPost = { ...currNewPost, text: inputTextValue };
    dispatch(updateCurrNewPost(newPost, newPostType));
  };

  const onAddPost = async () => {
    if (!currNewPost) return;
    try {
      setPostSaveInProgress(true);
      if (!loggedinUser) return;

      if (currNewPost.imgs.length > 0) {
        const prms = currNewPost.imgs.map(async (img, idx) => {
          const currImgUrl = await uploadFileToCloudinary(img.file, "image");
          return { url: currImgUrl, sortOrder: idx };
        });
        const savedImgUrl = await Promise.all(prms);
        currNewPost.imgs = savedImgUrl.filter(img => img.url) as unknown as NewPostImg[];
      }

      if (currNewPost.video) {
        if (currNewPost.video.file) {
          const videoUrl = await uploadFileToCloudinary(currNewPost.video.file, "video");
          currNewPost.videoUrl = videoUrl;
        } else {
          currNewPost.videoUrl = currNewPost.video.url;
        }
        delete currNewPost.video;
      }

      await dispatch(addPost(currNewPost));

      dispatch(setNewPosts([], newPostType));
      setInputTextValue("");
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
      setIsComposeMounted(false);
      setIsPickerShown(true);
      textAreaRef.current?.focus();
    }
  };

  const onGoToLocationPage = () => {
    if (!isPickerShown) return;
    navigate("/post-location");
  };

  const onAddPostToThread = () => {
    if (!isPickerShown) return;
    if (isHomePage) {
      setIsComposeMounted(true);
      setIsPickerShown(false);
      navigate("/compose");
    } else {
      setIsPickerShown(false);
    }
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
          {isPickerShown && <BtnToggleAudience currNewPost={currNewPost} />}
          {currNewPost?.schedule && (
            <PostDateTitle date={currNewPost.schedule} isLink={isPickerShown} />
          )}
          <textarea
            className={
              "post-edit-text-area" +
              (isHomePage ? " home-page-height" : "") +
              (isHomePage && !isPickerShown ? " pt-10" : "")
            }
            placeholder={currNewPost?.poll ? "Ask a question..." : "What's happening?"}
            value={!isComposeMounted ? inputTextValue : ""}
            onChange={handleTextChange}
            onBlur={handleTextBlur}
            ref={textAreaRef}
          />
          {currNewPost && currNewPost.imgs.length > 0 && !isComposeMounted && (
            <PostEditImg currNewPost={currNewPost} />
          )}
          {currNewPost?.video && !isComposeMounted && (
            <PostEditVideo currNewPost={currNewPost} setIsVideoRemoved={setIsVideoRemoved} />
          )}
          {currNewPost?.gif && !isComposeMounted && <GifEdit currNewPost={currNewPost} />}
          {currNewPost?.poll && !isComposeMounted && <PollEdit currNewPost={currNewPost} />}
          <div className="btn-replires-location-container">
            {isPickerShown && <BtnToggleRepliers currNewPost={currNewPost} />}
            {currNewPost?.location && !isComposeMounted && (
              <div className="post-edit-location-title" onClick={onGoToLocationPage}>
                <IoLocationSharp /> {currNewPost.location.name}
              </div>
            )}
          </div>
          <div className={"btns-container" + (isPickerShown ? " border-show" : "")}>
            <PostEditActions
              currNewPost={currNewPost}
              isPickerShown={isPickerShown}
              inputTextValue={inputTextValue}
              setInputTextValue={setInputTextValue}
            />
            <div className="secondary-action-container">
              {inputTextValue.length > 0 && !isComposeMounted && (
                <div className="indicator-thread-btn-container">
                  <TextIndicator textLength={inputTextValue.length} />
                  <hr className="vertical" />
                  <button className="btn-add-thread" onClick={onAddPostToThread}>
                    <AiOutlinePlus className="btn-add-thread-icon" />
                  </button>
                </div>
              )}
              <BtnCreatePost isSideBarBtn={false} isDisabled={!isPostValid} onAddPost={onAddPost} />
            </div>
          </div>
        </main>
      </div>
    </section>
  );
};
