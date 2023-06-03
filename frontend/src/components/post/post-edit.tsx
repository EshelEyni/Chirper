import { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { BtnCreatePost } from "../btns/btn-create-post";
import { PostEditActions } from "./post-edit-actions";
import { TextIndicator } from "../other/text-indicator";
import { AiOutlinePlus } from "react-icons/ai";
import { NewPost, NewPostImg, Post } from "../../../../shared/interfaces/post.interface";
import { AppDispatch } from "../../store/types";
import {
  addNewPostToThread,
  removeNewPostFromThread,
  setNewPostType,
  setNewPosts,
  updateCurrNewPost,
} from "../../store/actions/new-post.actions";
import { addPost } from "../../store/actions/post.actions";
import { PostEditImg } from "./post-edit-img";
import { GifEdit } from "../gif/gif-edit";
import { BtnClose } from "../btns/btn-close";
import { UserImg } from "../user/user-img";
import { BtnToggleAudience } from "../btns/btn-toggle-audience";
import { BtnToggleRepliers } from "../btns/btn-toggle-repliers";
import { PollEdit } from "../poll/poll-edit";
import { PostDateTitle } from "../other/post-date-title";
import { IoLocationSharp } from "react-icons/io5";
import { useLocation, useNavigate } from "react-router-dom";
import { uploadFileToCloudinary } from "../../services/upload.service";
import { PostEditVideo } from "./post-edit-video";
import { utilService } from "../../services/util.service/utils.service";
import { PostList } from "./post-list";
import { AiOutlineClose } from "react-icons/ai";
import { MiniPostPreview } from "./mini-post-preview";

interface PostEditProps {
  isHomePage?: boolean;
  onClickBtnClose?: () => void;
}

export const PostEdit: React.FC<PostEditProps> = ({ isHomePage = false, onClickBtnClose }) => {
  const { loggedinUser } = useSelector((state: RootState) => state.authModule);
  const { sideBar, homePage, reply, newPostType } = useSelector(
    (state: RootState) => state.newPostModule
  );

  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const newPostTypeRef = useRef(newPostType);

  const [currNewPost, setCurrNewPost] = useState<NewPost | null>(null);
  const [replyToPost, setReplyToPost] = useState<Post | null>(null);
  const [preCurrNewPostList, setPreCurrNewPostList] = useState<NewPost[]>([]);
  const [postCurrNewPostList, setPostCurrNewPostList] = useState<NewPost[]>([]);
  const [isPickerShown, setIsPickerShown] = useState<boolean>(!isHomePage);
  const [isPostsValid, setIsPostsValid] = useState<boolean>(false);
  const [postSaveInProgress, setPostSaveInProgress] = useState<boolean>(false);
  const [isVideoRemoved, setIsVideoRemoved] = useState<boolean>(false);
  const [isMultipePosts, setIsMultipePosts] = useState<boolean>(false);
  const [isFirstPostInThread, setIsFirstPostInThread] = useState<boolean>(false);
  const [inputTextValue, setInputTextValue] = useState(currNewPost?.text || "");
  const isBtnAdThreadDisabled = preCurrNewPostList.length + postCurrNewPostList.length + 1 >= 10;

  useEffect(() => {
    const isValid = checkIfPostsAreValid(
      preCurrNewPostList.concat(currNewPost || [], postCurrNewPostList)
    );
    if (isValid !== isPostsValid) {
      setIsPostsValid(isValid);
    }
  }, [preCurrNewPostList, currNewPost, inputTextValue.length, postCurrNewPostList]);

  useEffect(() => {
    const postType = newPostTypeRef.current;
    if (postType === "home-page") {
      const currPost = homePage.posts[homePage.currPostIdx];
      setPreCurrNewPostList(homePage.posts.filter((_, idx) => idx < homePage.currPostIdx));
      setCurrNewPost(currPost);
      setInputTextValue(currPost.text);
      setPostCurrNewPostList(homePage.posts.filter((_, idx) => idx > homePage.currPostIdx));
      setIsMultipePosts(homePage.posts.length > 1);
      setIsFirstPostInThread(homePage.currPostIdx === 0);
    } else if (postType === "side-bar") {
      const currPost = sideBar.posts[sideBar.currPostIdx];
      setPreCurrNewPostList(sideBar.posts.filter((_, idx) => idx < sideBar.currPostIdx));
      setCurrNewPost(currPost);
      setInputTextValue(currPost.text);
      setPostCurrNewPostList(sideBar.posts.filter((_, idx) => idx > sideBar.currPostIdx));
      setIsMultipePosts(sideBar.posts.length > 1);
      setIsFirstPostInThread(sideBar.currPostIdx === 0);
    } else if (postType === "reply") {
      setCurrNewPost(reply.reply);
      setInputTextValue(reply.reply.text);
      setReplyToPost(reply.repliedToPost);
    }
    if (location.pathname === "/compose" && isHomePage) {
      setIsPickerShown(false);
      setPreCurrNewPostList([]);
      setCurrNewPost(null);
      setInputTextValue("");
      setPostCurrNewPostList([]);
    }

    if (!isHomePage) textAreaRef.current?.focus();

    return () => {
      setPreCurrNewPostList([]);
      setCurrNewPost(null);
      setInputTextValue("");
      setPostCurrNewPostList([]);
    };
  }, [
    homePage.posts,
    homePage.currPostIdx,
    sideBar.posts,
    sideBar.currPostIdx,
    reply,
    location.pathname,
  ]);

  const setBtnTitleText = (): string => {
    const postType = newPostTypeRef.current;
    if (currNewPost?.schedule) return "Schedule";
    if (postType === "reply") return "Reply";
    return isMultipePosts && !isHomePage ? "Chirp All" : "Chirp";
  };

  const checkifPostTextIsValid = (post: NewPost): boolean => {
    let currPostText = "";
    if (newPostType === "home-page") {
      currPostText = post.idx === homePage.currPostIdx ? inputTextValue : post.text;
    } else {
      currPostText = post.idx === sideBar.currPostIdx ? inputTextValue : post.text;
    }

    return currPostText.length > 0 && currPostText.length <= 247;
  };

  const checkIfPostIsValid = (post: NewPost | null): boolean => {
    if (!post) return false;
    if (post.poll) {
      return (
        post.poll.options.every(option => option.text.length > 0) && checkifPostTextIsValid(post)
      );
    } else {
      return checkifPostTextIsValid(post) || post.imgs.length > 0 || !!post.gif || !!post.video;
    }
  };

  const checkIfPostsAreValid = (newPosts: NewPost[]): boolean => {
    return newPosts.every(post => checkIfPostIsValid(post));
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
    if (!currNewPost || !loggedinUser) return;
    try {
      setPostSaveInProgress(true);
      const thread = [...preCurrNewPostList, currNewPost, ...postCurrNewPostList];

      for (const post of thread) {
        if (post.imgs.length > 0) {
          const prms = post.imgs.map(async (img, idx) => {
            const currImgUrl = await uploadFileToCloudinary(img.file, "image");
            return { url: currImgUrl, sortOrder: idx };
          });
          const savedImgUrl = await Promise.all(prms);
          post.imgs = savedImgUrl.filter(img => img.url) as unknown as NewPostImg[];
        }

        if (post.video) {
          if (post.video.file) {
            const videoUrl = await uploadFileToCloudinary(post.video.file, "video");
            post.videoUrl = videoUrl;
          } else {
            post.videoUrl = post.video.url;
          }
          delete post.video;
        }
      }
      await dispatch(addPost(thread));
      if (newPostType !== "reply") dispatch(setNewPosts([], newPostType));
      else {
        dispatch(setNewPostType("home-page"));
        dispatch(setNewPosts([], newPostType));
      }
      setInputTextValue("");
      setIsPickerShown(false);
      setPostSaveInProgress(false);
      setIsPostsValid(false);
      if (textAreaRef.current) textAreaRef.current.style.height = "auto";
      if (location.pathname === "/compose") navigate("/");
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
    navigate("/post-location");
  };

  const onAddPostToThread = async () => {
    if (!isPickerShown) return;
    if (isHomePage) {
      if (!currNewPost) return;
      const newPost = { ...currNewPost, text: inputTextValue };
      await dispatch(updateCurrNewPost(newPost, newPostType));
      setIsPickerShown(false);
      await dispatch(addNewPostToThread(newPostType));
      navigate("/compose");
    } else {
      await dispatch(addNewPostToThread(newPostType));
      textAreaRef.current?.focus();
    }
  };

  const setTextPlaceholder = () => {
    const postType = newPostTypeRef.current;
    if (postType === "reply") {
      const isLoggedinUserPost = loggedinUser && loggedinUser.id === replyToPost?.user.id;
      if (isLoggedinUserPost) return "Add another Chirp!";
      return "Chirp your reply...";
    }
    if (currNewPost?.poll) return "Ask a question...";
    else {
      if (isFirstPostInThread) return "What's happening?";
      else return "Add another Chirp!";
    }
  };

  return (
    <section
      className={"post-edit" + (postSaveInProgress ? " save-mode" : "")}
      onClick={openPicker}
    >
      {onClickBtnClose && <BtnClose onClickBtn={onClickBtnClose} />}
      {postSaveInProgress && <span className="progress-bar"></span>}
      {!isHomePage && preCurrNewPostList.length > 0 && <PostList newPosts={preCurrNewPostList} />}
      {!isHomePage && replyToPost && <MiniPostPreview post={replyToPost} />}
      <div className="content-container">
        {loggedinUser && <UserImg imgUrl={loggedinUser?.imgUrl} />}
        <main className={"main-content" + (isHomePage && !isPickerShown ? " gap-0" : "")}>
          {isPickerShown && currNewPost && isFirstPostInThread && (
            <BtnToggleAudience currNewPost={currNewPost} />
          )}
          {currNewPost?.schedule && isFirstPostInThread && (
            <PostDateTitle date={currNewPost.schedule} isLink={isPickerShown} />
          )}
          {!isFirstPostInThread &&
            !isHomePage &&
            newPostTypeRef.current !== "reply" &&
            !checkIfPostIsValid(currNewPost) && (
              <button className="btn-remove-post-from-thread">
                <AiOutlineClose
                  color="var(--color-primary)"
                  size={15}
                  onClick={() => dispatch(removeNewPostFromThread(newPostType))}
                />
              </button>
            )}
          <textarea
            className={
              "post-edit-text-area" +
              (isHomePage ? " home-page-height" : "") +
              (isHomePage && !isPickerShown ? " pt-10" : "") +
              (!isFirstPostInThread ? " not-first-post" : "")
            }
            placeholder={setTextPlaceholder()}
            value={inputTextValue}
            onChange={handleTextChange}
            onBlur={handleTextBlur}
            ref={textAreaRef}
          />
          {currNewPost && currNewPost.imgs.length > 0 && <PostEditImg currNewPost={currNewPost} />}
          {currNewPost?.video && (
            <PostEditVideo currNewPost={currNewPost} setIsVideoRemoved={setIsVideoRemoved} />
          )}
          {currNewPost?.gif && <GifEdit currNewPost={currNewPost} />}
          {currNewPost?.poll && <PollEdit currNewPost={currNewPost} />}
          <div className="btn-replires-location-container">
            {isPickerShown && currNewPost && <BtnToggleRepliers currNewPost={currNewPost} />}
            {currNewPost?.location && (
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
              {(checkIfPostIsValid(currNewPost) || inputTextValue.length > 0) && (
                <div className="indicator-thread-btn-container">
                  <TextIndicator textLength={inputTextValue.length} />
                  <hr className="vertical" />
                  <button
                    className={"btn-add-thread" + (isBtnAdThreadDisabled ? " disabled" : "")}
                    onClick={onAddPostToThread}
                    disabled={isBtnAdThreadDisabled}
                  >
                    <AiOutlinePlus className="btn-add-thread-icon" />
                  </button>
                </div>
              )}
              <BtnCreatePost
                isSideBarBtn={false}
                isDisabled={!isPostsValid}
                onAddPost={onAddPost}
                btnText={setBtnTitleText()}
              />
            </div>
          </div>
        </main>
      </div>
      {!isHomePage && postCurrNewPostList.length > 0 && <PostList newPosts={postCurrNewPostList} />}
    </section>
  );
};
