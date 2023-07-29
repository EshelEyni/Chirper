/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useState, useRef, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { RootState } from "../../../store/store";
import { NewPost, NewPostImg, Post } from "../../../../../shared/interfaces/post.interface";
import { AppDispatch } from "../../../store/types";
import {
  addNewPostToThread,
  clearNewPostState,
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
import { MiniPostPreview } from "../PostPreview/MiniPostPreview/MiniPostPreview";
import { RepliedPostContent } from "../PostPreview/MiniPostPreview/RepliedPostContent/RepliedPostContent";
import { BtnToggleAudience } from "../../Btns/BtnToggleAudience/BtnToggleAudience";
import { PostDateTitle } from "../PostDateTitle/PostDateTitle";
import { BtnRemovePostFromThread } from "../../Btns/BtnRemovePostFromThread/BtnRemovePostFromThread";
import { PostTextInput } from "./PostTextInput/PostTextInput";
import { UserImg } from "../../User/UserImg/UserImg";
import { PostEditImgList } from "../PostEditImgList/PostEditImgList";
import { PostEditVideo } from "../PostEditVideo/PostEditVideo";
import { GifEdit } from "../../Gif/GifEdit/GifEdit";
import { PollEdit } from "../../Poll/PollEdit/PollEdit";
import { BtnToggleRepliers } from "../../Btns/BtnToggleRepliers/BtnToggleRepliers";
import { PostEditTitleLocation } from "../PostEditTitleLocation/PostEditTitleLocation";
import { QuotedPostContent } from "../PostPreview/MiniPostPreview/QuotedPostContent/QuotedPostContent";
import { PostEditActions } from "../PostEditActions/PostEditActions/PostEditActions";
import { TextIndicator } from "../../App/TextIndicator/TextIndicator";
import { BtnAddThread } from "../../Btns/BtnAddThread/BtnAddThread";
import { BtnCreatePost } from "../../Btns/BtnCreatePost/BtnCreatePost";
import { NewPostType } from "../../../store/reducers/new-post.reducer";

interface PostEditProps {
  isHomePage?: boolean;
  onClickBtnClose?: () => void;
}

export const PostEdit: React.FC<PostEditProps> = ({ isHomePage = false, onClickBtnClose }) => {
  const { loggedinUser } = useSelector((state: RootState) => state.authModule);
  const { sideBar, homePage, reply, quote, newPostType } = useSelector(
    (state: RootState) => state.newPostModule
  );
  // const newPostModule = useSelector((state: RootState) => state.newPostModule);

  const [preCurrNewPostList, setPreCurrNewPostList] = useState<NewPost[]>([]);
  // // setPreCurrNewPostList(homePage.posts.filter((_, idx) => idx < homePage.currPostIdx));
  // const isValidType = newPostType === NewPostType.SideBar || newPostType === NewPostType.HomePage;
  // const preCurrNewPostList = isValidType
  //   ? newPostModule[newPostType].posts.filter((_, idx) => idx < homePage.currPostIdx)
  //   : [];

  const [currNewPost, setCurrNewPost] = useState<NewPost | null>(null);
  const [postCurrNewPostList, setPostCurrNewPostList] = useState<NewPost[]>([]);
  const [inputTextValue, setInputTextValue] = useState(currNewPost?.text || "");

  const [isPickerShown, setIsPickerShown] = useState<boolean>(!isHomePage);
  const [arePostsValid, setArePostsValid] = useState<boolean>(false);
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
  const isPostDateTitleShown = currNewPost?.schedule && isFirstPostInThread;
  const isBtnCloseShown = !!onClickBtnClose;
  const isPreCurrNewPostList = !isHomePage && preCurrNewPostList.length > 0;
  const isReplyPostShown = !isHomePage && !!reply.repliedToPost;
  const isBtnToggleAudienceShown = isPickerShown && currNewPost && isFirstPostInThread;
  const isPostEditImgShown = currNewPost && currNewPost.imgs.length > 0;
  const isPostEditVideoShown = !!currNewPost?.video;
  const isPostEditGifShown = !!currNewPost?.gif;
  const isPostEditPollShown = !!currNewPost?.poll;
  const isBtnToggleRepliersShown = isPickerShown && currNewPost;
  const isPostLocationTitleShown = !!currNewPost?.location;
  const isQuotedPostShown = !!quote.quotedPost;
  const isPostCurrNewPostListShown = !isHomePage && postCurrNewPostList.length > 0;

  function setBtnTitleText(): string {
    const postType = newPostTypeRef.current;
    if (currNewPost?.schedule) return "Schedule";
    if (postType === "reply") return "Reply";
    return isMultipePosts && !isHomePage ? "Chirp All" : "Chirp";
  }

  const checkPostValidity = useCallback(
    (post: NewPost | null): boolean => {
      if (!post) return false;

      function checkPostTextValidity(post: NewPost): boolean {
        let currPostText = "";
        if (newPostType === NewPostType.HomePage) {
          const currPostIdx = homePage.posts.findIndex(p => p.tempId === post.tempId);
          currPostText = currPostIdx === homePage.currPostIdx ? inputTextValue : post.text;
        } else if (newPostType === NewPostType.SideBar) {
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
    },
    [
      homePage.currPostIdx,
      homePage.posts,
      inputTextValue,
      newPostType,
      sideBar.currPostIdx,
      sideBar.posts,
    ]
  );

  const isBtnRemovePostFromThreadShown =
    !isFirstPostInThread &&
    !isHomePage &&
    (newPostTypeRef.current === NewPostType.HomePage ||
      newPostTypeRef.current === NewPostType.SideBar) &&
    !checkPostValidity(currNewPost);
  const isIndicatorAndThreadBtnShown = checkPostValidity(currNewPost) || inputTextValue.length > 0;

  const checkPostArrayValidity = useCallback(
    (newPosts: NewPost[]): boolean => {
      return newPosts.every(post => checkPostValidity(post));
    },
    [checkPostValidity]
  );

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
    dispatch(clearNewPostState());
    dispatch(setNewPostType(NewPostType.HomePage));
    dispatch(setNewPosts([], newPostType));
    setInputTextValue("");
    setIsPickerShown(false);
    setPostSaveInProgress(false);
    setArePostsValid(false);
    if (textAreaRef.current) textAreaRef.current.style.height = "auto";
    const { pathname } = location;
    if (pathname === "/compose") navigate("/home");
  }

  function openPicker() {
    if (isPickerShown) return;
    setIsPickerShown(true);
    textAreaRef.current?.focus();
  }

  function onGoToLocationPage() {
    if (!isPickerShown) return;
    navigate("post-location", { relative: "path" });
  }

  async function onAddPostToThread() {
    if (!isPickerShown) return;
    if (isHomePage) {
      if (!currNewPost) return;
      const newPost = { ...currNewPost, text: inputTextValue };
      await dispatch(updateCurrNewPost(newPost, newPostType));
      setIsPickerShown(false);
      await dispatch(addNewPostToThread(newPostType));
      navigate("compose", { relative: "path" });
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
    if (isValid !== arePostsValid) setArePostsValid(isValid);
  }, [
    preCurrNewPostList,
    currNewPost,
    inputTextValue.length,
    postCurrNewPostList,
    arePostsValid,
    checkPostArrayValidity,
  ]);

  useEffect(() => {
    const postType = newPostTypeRef.current;
    if (postType === NewPostType.HomePage) {
      const currPost = homePage.posts[homePage.currPostIdx];
      setPreCurrNewPostList(homePage.posts.filter((_, idx) => idx < homePage.currPostIdx));
      setCurrNewPost(currPost);
      setInputTextValue(currPost.text);
      setPostCurrNewPostList(homePage.posts.filter((_, idx) => idx > homePage.currPostIdx));
      setIsFirstPostInThread(homePage.currPostIdx === 0);
    } else if (postType === NewPostType.SideBar) {
      const currPost = sideBar.posts[sideBar.currPostIdx];
      setPreCurrNewPostList(sideBar.posts.filter((_, idx) => idx < sideBar.currPostIdx));
      setCurrNewPost(currPost);
      setInputTextValue(currPost.text);
      setPostCurrNewPostList(sideBar.posts.filter((_, idx) => idx > sideBar.currPostIdx));
      setIsFirstPostInThread(sideBar.currPostIdx === 0);
    } else if (postType === NewPostType.Reply) {
      setCurrNewPost(reply.reply);
      setInputTextValue(reply.reply.text);
    } else if (postType === NewPostType.Quote) {
      setCurrNewPost(quote.quote);
      setInputTextValue(quote.quote.text);
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
    isHomePage,
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
        <MiniPostPreview post={reply.repliedToPost as Post} type={"replied-post"}>
          <RepliedPostContent post={reply.repliedToPost as Post} />
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
            replyToPost={reply.repliedToPost}
            isVideoRemoved={isVideoRemoved}
            setInputTextValue={setInputTextValue}
          />
          {isPostEditImgShown && <PostEditImgList currNewPost={currNewPost} />}
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
            <MiniPostPreview quotedPost={quote.quotedPost as Post} type={"quoted-post"}>
              <QuotedPostContent quotedPost={quote.quotedPost as Post} />
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
                isDisabled={!arePostsValid}
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
