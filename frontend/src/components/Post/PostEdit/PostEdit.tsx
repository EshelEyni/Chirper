import { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { RootState } from "../../../store/store";
import {
  NewPost,
  NewPostImg,
  Post,
  QuotedPost,
} from "../../../../../shared/interfaces/post.interface";
import { AppDispatch } from "../../../store/types";
import {
  addNewPostToThread,
  setNewPostType,
  setNewPosts,
  updateCurrNewPost,
} from "../../../store/actions/new-post.actions";
import { addPost, addQuotePost, addReply } from "../../../store/actions/post.actions";
import "./PostEdit.scss";
import { uploadFileToCloudinary } from "../../../services/upload.service";
import { setUserMsg } from "../../../store/actions/system.actions";
import { BtnClose } from "../../Btns/BtnClose/BtnClose";
import { PostList } from "../PostList/PostList";
import { MiniPostPreview } from "../MiniPostPreview/MiniPostPreview/MiniPostPreview";
import { RepliedPostContent } from "../MiniPostPreview/RepliedPostContent/RepliedPostContent";
import { BtnToggleAudience } from "../../Btns/BtnToggleAudience/BtnToggleAudience";
import { PostDateTitle } from "../PostDateTitle/PostDateTitle";
import { BtnRemovePostFromThread } from "../BtnRemovePostFromThread/BtnRemovePostFromThread";
import { PostTextInput } from "../PostTextInput/PostTextInput";
import { UserImg } from "../../User/UserImg/UserImg";
import { PostEditImg } from "../PostEditImg/PostEditImg";
import { PostEditVideo } from "../PostEditVideo/PostEditVideo";
import { GifEdit } from "../../Gif/GifEdit/GifEdit";
import { PollEdit } from "../../Poll/PollEdit/PollEdit";
import { BtnToggleRepliers } from "../../Btns/BtnToggleRepliers/BtnToggleRepliers";
import { PostEditTitleLocation } from "../PostEditTitleLocation/PostEditTitleLocation";
import { QuotedPostContent } from "../MiniPostPreview/QuotedPostContent/QuotedPostContent";
import { PostEditActions } from "../PostEditActions/PostEditActions/PostEditActions";
import { TextIndicator } from "../../App/TextIndicator/TextIndicator";
import { BtnAddThread } from "../BtnAddThread/BtnAddThread";
import { BtnCreatePost } from "../../Btns/BtnCreatePost/BtnCreatePost";

interface PostEditProps {
  isHomePage?: boolean;
  onClickBtnClose?: () => void;
}

// let renderCount = 0;

export const PostEdit: React.FC<PostEditProps> = ({ isHomePage = false, onClickBtnClose }) => {
  // console.log("PostEdit", ++renderCount);

  // State
  const { loggedinUser } = useSelector((state: RootState) => state.authModule);
  const { sideBar, homePage, reply, quote, newPostType } = useSelector(
    (state: RootState) => state.newPostModule
  );

  const [currNewPost, setCurrNewPost] = useState<NewPost | null>(null);
  const [replyToPost, setReplyToPost] = useState<Post | null>(null);
  const [quotedPost, setQuotedPost] = useState<Post | null>(null);
  const [preCurrNewPostList, setPreCurrNewPostList] = useState<NewPost[]>([]);
  const [postCurrNewPostList, setPostCurrNewPostList] = useState<NewPost[]>([]);
  const [inputTextValue, setInputTextValue] = useState(currNewPost?.text || "");
  // State - booleans
  const [isPickerShown, setIsPickerShown] = useState<boolean>(!isHomePage);
  const [isPostsValid, setIsPostsValid] = useState<boolean>(false);
  const [postSaveInProgress, setPostSaveInProgress] = useState<boolean>(false);
  const [isVideoRemoved, setIsVideoRemoved] = useState<boolean>(false);
  const [isFirstPostInThread, setIsFirstPostInThread] = useState<boolean>(false);

  // Refs
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const newPostTypeRef = useRef(newPostType);

  // Hooks
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // Constants
  const isAddingPostToThreadDisabled =
    preCurrNewPostList.length + postCurrNewPostList.length + 1 >= 10;
  const isMultipePosts = preCurrNewPostList.length + postCurrNewPostList.length + 1 > 1;
  const isBtnRemovePostFromThreadShown =
    !isFirstPostInThread &&
    !isHomePage &&
    (newPostTypeRef.current === "home-page" || newPostTypeRef.current === "side-bar") &&
    !checkPostValidity(currNewPost);
  const isPostDateTitleShown = currNewPost?.schedule && isFirstPostInThread;
  const isBtnCloseShown = !!onClickBtnClose;
  const isPreCurrNewPostList = !isHomePage && preCurrNewPostList.length > 0;
  const isReplyPostShown = !isHomePage && !!replyToPost;
  const isBtnToggleAudienceShown = isPickerShown && currNewPost && isFirstPostInThread;
  const isPostEditImgShown = currNewPost && currNewPost.imgs.length > 0;
  const isPostEditVideoShown = !!currNewPost?.video;
  const isPostEditGifShown = !!currNewPost?.gif;
  const isPostEditPollShown = !!currNewPost?.poll;
  const isBtnToggleRepliersShown = isPickerShown && currNewPost;
  const isPostLocationTitleShown = !!currNewPost?.location;
  const isQuotedPostShown = !!quotedPost;
  const isIndicatorAndThreadBtnShown = checkPostValidity(currNewPost) || inputTextValue.length > 0;
  const isPostCurrNewPostListShown = !isHomePage && postCurrNewPostList.length > 0;

  function setBtnTitleText(): string {
    const postType = newPostTypeRef.current;
    if (currNewPost?.schedule) return "Schedule";
    if (postType === "reply") return "Reply";
    return isMultipePosts && !isHomePage ? "Chirp All" : "Chirp";
  }

  function checkPostValidity(post: NewPost | null): boolean {
    if (!post) return false;

    function checkPostTextValidity(post: NewPost): boolean {
      let currPostText = "";
      if (newPostType === "home-page") {
        const currPostIdx = homePage.posts.findIndex(p => p.tempId === post.tempId);
        currPostText = currPostIdx === homePage.currPostIdx ? inputTextValue : post.text;
      } else if (newPostType === "side-bar") {
        const currPostIdx = sideBar.posts.findIndex(p => p.tempId === post.tempId);
        currPostText = currPostIdx === sideBar.currPostIdx ? inputTextValue : post.text;
      } else {
        currPostText = inputTextValue;
      }
      return currPostText.length > 0 && currPostText.length <= 247;
    }

    if (post.poll) {
      return (
        post.poll.options.every(option => option.text.length > 0) && checkPostTextValidity(post)
      );
    } else {
      return (
        checkPostTextValidity(post) ||
        post.imgs.length > 0 ||
        !!post.gif ||
        !!post.video ||
        !!post.quotedPostId
      );
    }
  }

  function checkPostArrayValidity(newPosts: NewPost[]): boolean {
    return newPosts.every(post => checkPostValidity(post));
  }

  async function onAddPost() {
    if (!currNewPost || !loggedinUser) return;
    try {
      setPostSaveInProgress(true);
      const newPosts = [...preCurrNewPostList, currNewPost, ...postCurrNewPostList];
      await uploadImagesAndSetToPost(newPosts);
      await uploadVideoAndSetToPost(newPosts);
      await dispatchPost(newPosts);
      resetState();
    } catch (err) {
      setPostSaveInProgress(false);
    }
  }

  async function uploadImagesAndSetToPost(newPosts: NewPost[]) {
    for (const post of newPosts) {
      if (!post.imgs.length) return;
      const prms = post.imgs.map(async (img, idx) => {
        const currImgUrl = await uploadFileToCloudinary(img.file, "image");
        return { url: currImgUrl, sortOrder: idx };
      });
      const savedImgUrl = await Promise.all(prms);
      post.imgs = savedImgUrl.filter(img => img.url) as unknown as NewPostImg[];
    }
  }

  async function uploadVideoAndSetToPost(newPosts: NewPost[]) {
    for (const post of newPosts) {
      if (!post.video) return;
      if (post.video.file) {
        const videoUrl = await uploadFileToCloudinary(post.video.file, "video");
        post.videoUrl = videoUrl;
      } else {
        post.videoUrl = post.video.url;
      }
      delete post.video;
    }
  }

  async function dispatchPost(newPosts: NewPost[]) {
    switch (newPostType) {
      case "quote":
        {
          const [post] = newPosts;
          await dispatch(addQuotePost(post));
        }
        break;
      case "reply":
        {
          const [post] = newPosts;
          await dispatch(addReply(post));
        }
        break;
      default: {
        await dispatch(addPost(newPosts));
      }
    }
  }

  function resetState() {
    dispatch(setNewPostType("home-page"));
    dispatch(setNewPosts([], newPostType));
    setInputTextValue("");
    setIsPickerShown(false);
    setPostSaveInProgress(false);
    setIsPostsValid(false);
    if (textAreaRef.current) textAreaRef.current.style.height = "auto";
    if (location.pathname === "/compose") navigate("/");
  }

  function openPicker() {
    if (isPickerShown) return;
    setIsPickerShown(true);
    textAreaRef.current?.focus();
  }

  function onGoToLocationPage() {
    if (!isPickerShown) return;
    navigate("/post-location");
  }

  async function onAddPostToThread() {
    if (!isPickerShown) return;
    if (isHomePage) {
      if (!currNewPost) return;
      const newPost = { ...currNewPost, text: inputTextValue };
      await dispatch(updateCurrNewPost(newPost, newPostType));
      setIsPickerShown(false);
      await dispatch(addNewPostToThread(newPostType));
      navigate("/compose");
    } else {
      const isAddingPostToThreadDisabled =
        preCurrNewPostList.length + postCurrNewPostList.length + 1 >= 9;
      if (isAddingPostToThreadDisabled) {
        dispatch(
          setUserMsg({
            type: "info",
            text: "You can add more Chirps to this thread after sending these.",
          })
        );
      }
      await dispatch(addNewPostToThread(newPostType));
      textAreaRef.current?.focus();
    }
  }

  useEffect(() => {
    const postArray = preCurrNewPostList.concat(currNewPost || [], postCurrNewPostList);
    const isValid = checkPostArrayValidity(postArray);
    if (isValid !== isPostsValid) setIsPostsValid(isValid);
  }, [preCurrNewPostList, currNewPost, inputTextValue.length, postCurrNewPostList]);

  useEffect(() => {
    const postType = newPostTypeRef.current;
    if (postType === "home-page") {
      const currPost = homePage.posts[homePage.currPostIdx];
      setPreCurrNewPostList(homePage.posts.filter((_, idx) => idx < homePage.currPostIdx));
      setCurrNewPost(currPost);
      setInputTextValue(currPost.text);
      setPostCurrNewPostList(homePage.posts.filter((_, idx) => idx > homePage.currPostIdx));
      setIsFirstPostInThread(homePage.currPostIdx === 0);
    } else if (postType === "side-bar") {
      const currPost = sideBar.posts[sideBar.currPostIdx];
      setPreCurrNewPostList(sideBar.posts.filter((_, idx) => idx < sideBar.currPostIdx));
      setCurrNewPost(currPost);
      setInputTextValue(currPost.text);
      setPostCurrNewPostList(sideBar.posts.filter((_, idx) => idx > sideBar.currPostIdx));
      setIsFirstPostInThread(sideBar.currPostIdx === 0);
    } else if (postType === "reply") {
      setCurrNewPost(reply.reply);
      setInputTextValue(reply.reply.text);
      setReplyToPost(reply.repliedToPost);
    } else if (postType === "quote") {
      setCurrNewPost(quote.quote);
      setInputTextValue(quote.quote.text);
      setQuotedPost(quote.quotedPost);
    }
    if (location.pathname === "/compose" && isHomePage) {
      setIsPickerShown(false);
      setPreCurrNewPostList([]);
      setCurrNewPost(null);
      setInputTextValue("");
      setPostCurrNewPostList([]);
    }

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
    quote,
    location.pathname,
  ]);

  useEffect(() => {
    if (!isHomePage) textAreaRef.current?.focus();
  }, [homePage.currPostIdx, sideBar.currPostIdx, isHomePage]);

  return (
    <section
      className={"post-edit" + (postSaveInProgress ? " save-mode" : "")}
      onClick={openPicker}
    >
      {isBtnCloseShown && <BtnClose onClickBtn={onClickBtnClose} />}
      {postSaveInProgress && <span className="progress-bar"></span>}
      {isPreCurrNewPostList && <PostList newPosts={preCurrNewPostList} />}
      {isReplyPostShown && (
        <MiniPostPreview post={replyToPost} type={"replied-post"}>
          {({ post }: { post: Post }) => <RepliedPostContent post={post} />}
        </MiniPostPreview>
      )}
      <div className="content-container">
        <UserImg imgUrl={loggedinUser?.imgUrl} />
        <main className={"main-content" + (isHomePage && !isPickerShown ? " gap-0" : "")}>
          {isBtnToggleAudienceShown && <BtnToggleAudience currNewPost={currNewPost} />}
          {isPostDateTitleShown && (
            <PostDateTitle date={currNewPost.schedule!} isLink={isPickerShown} />
          )}
          {isBtnRemovePostFromThreadShown && <BtnRemovePostFromThread newPostType={newPostType} />}

          <PostTextInput
            isHomePage={isHomePage}
            isPickerShown={isPickerShown}
            isFirstPostInThread={isFirstPostInThread}
            inputTextValue={inputTextValue}
            textAreaRef={textAreaRef}
            postType={newPostTypeRef.current}
            currNewPost={currNewPost}
            replyToPost={replyToPost}
            isVideoRemoved={isVideoRemoved}
            setInputTextValue={setInputTextValue}
          />
          {isPostEditImgShown && <PostEditImg currNewPost={currNewPost} />}
          {isPostEditVideoShown && (
            <PostEditVideo currNewPost={currNewPost} setIsVideoRemoved={setIsVideoRemoved} />
          )}
          {isPostEditGifShown && <GifEdit currNewPost={currNewPost} />}
          {isPostEditPollShown && <PollEdit currNewPost={currNewPost} />}
          <div className="btn-replries-location-container">
            {isBtnToggleRepliersShown && <BtnToggleRepliers currNewPost={currNewPost} />}
            {isPostLocationTitleShown && (
              <PostEditTitleLocation
                title={currNewPost.location!.name}
                onGoToLocationPage={onGoToLocationPage}
              />
            )}
          </div>
          {isQuotedPostShown && (
            <MiniPostPreview quotedPost={quotedPost} type={"quoted-post"}>
              {({ quotedPost }: { quotedPost: QuotedPost }) => (
                <QuotedPostContent quotedPost={quotedPost} />
              )}
            </MiniPostPreview>
          )}
          <div className={"btns-container" + (isPickerShown ? " border-show" : "")}>
            <PostEditActions
              currNewPost={currNewPost}
              isPickerShown={isPickerShown}
              inputTextValue={inputTextValue}
              setInputTextValue={setInputTextValue}
            />
            <div className="secondary-action-container">
              {isIndicatorAndThreadBtnShown && (
                <div className="indicator-thread-btn-container">
                  <TextIndicator textLength={inputTextValue.length} />
                  <hr className="vertical" />
                  <BtnAddThread
                    isDisabled={isAddingPostToThreadDisabled}
                    onAddPostToThread={onAddPostToThread}
                  />
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
      {isPostCurrNewPostListShown && <PostList newPosts={postCurrNewPostList} />}
    </section>
  );
};
