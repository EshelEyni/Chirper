/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useState, useRef, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { RootState } from "../../../store/store";
import { NewPost, NewPostImg } from "../../../../../shared/interfaces/post.interface";
import { AppDispatch } from "../../../store/types";
import {
  addNewPostToThread,
  clearNewPostState,
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
import { PostEditTextArea } from "./PostTextInput/PostTextInput";
import { UserImg } from "../../User/UserImg/UserImg";
import { PostEditImgList } from "./PostEditImgList/PostEditImgList";
import { GifEdit } from "../../Gif/GifEdit/GifEdit";
import { PollEdit } from "../../Poll/PollEdit/PollEdit";
import { BtnToggleRepliers } from "../../Btns/BtnToggleRepliers/BtnToggleRepliers";
import { PostEditTitleLocation } from "./PostEditTitleLocation/PostEditTitleLocation";
import { QuotedPostContent } from "../PostPreview/MiniPostPreview/QuotedPostContent/QuotedPostContent";
import { PostEditActions } from "./PostEditActions/PostEditActions/PostEditActions";
import { TextIndicator } from "../../App/TextIndicator/TextIndicator";
import { BtnAddThread } from "../../Btns/BtnAddThread/BtnAddThread";
import { BtnCreatePost, BtnCreatePostTitle } from "../../Btns/BtnCreatePost/BtnCreatePost";
import { NewPostType } from "../../../store/reducers/new-post.reducer";
import { usePostEdit } from "../../../contexts/PostEditContext";
import { VideoEdit } from "../../Video/VideoEdit/VideoEdit";

interface PostEditProps {
  isHomePage?: boolean;
  onClickBtnClose?: () => void;
}

const PostEdit: React.FC<PostEditProps> = ({ isHomePage = false, onClickBtnClose }) => {
  const { loggedinUser } = useSelector((state: RootState) => state.authModule);
  const {
    currNewPost,
    newPostText,
    setNewPostText,
    arePostsValid,
    preCurrNewPostList,
    postCurrNewPostList,
    setArePostsValid,
    isFirstPostInThread,
    isPickerShown,
    setIsPickerShown,
  } = usePostEdit();
  const { newPostModule } = useSelector((state: RootState) => state);
  const { sideBar, homePage, reply, quote, newPostType } = newPostModule;
  const [postSaveInProgress, setPostSaveInProgress] = useState<boolean>(false);

  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const threadLength = preCurrNewPostList.length + postCurrNewPostList.length + 1;
  const isAddingPostToThreadDisabled = threadLength >= 10;
  const isMultipePosts = threadLength > 1;
  const isPostDateTitleShown = currNewPost?.schedule && isFirstPostInThread;
  const isPreCurrNewPostListShown = !isHomePage && preCurrNewPostList.length > 0;
  const isReplyPostShown = !isHomePage && !!reply.repliedToPost;
  const isBtnToggleAudienceShown = isPickerShown && currNewPost && isFirstPostInThread;
  const isPostEditImgShown = currNewPost && currNewPost.imgs.length > 0;
  const isPostEditVideoShown = !!currNewPost?.video;
  const isPostEditGifShown = !!currNewPost?.gif;
  const isPostEditPollShown = !!currNewPost?.poll;
  const isBtnToggleRepliersShown = isPickerShown && currNewPost;
  const isQuotedPostShown = !!quote.quotedPost;
  const isPostCurrNewPostListShown = !isHomePage && postCurrNewPostList.length > 0;

  const checkPostValidity = useCallback(
    (post: NewPost | null): boolean => {
      if (!post) return false;

      const checkPostTextValidity = (): boolean =>
        !!newPostText && newPostText.length > 0 && newPostText.length <= 247;

      if (post.poll)
        return post.poll.options.every(option => option.text.length > 0) && checkPostTextValidity();
      return (
        checkPostTextValidity() ||
        post.imgs.length > 0 ||
        !!post.gif ||
        !!post.video ||
        !!post.quotedPostId
      );
    },
    [newPostText]
  );

  const isBtnRemovePostFromThreadShown =
    !isFirstPostInThread &&
    !isHomePage &&
    (newPostType === NewPostType.HomePage || newPostType === NewPostType.SideBar) &&
    !checkPostValidity(currNewPost);
  const isIndicatorAndAddThreadBtnShown = checkPostValidity(currNewPost) || newPostText.length > 0;

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
      case NewPostType.Quote:
        await dispatch(addQuotePost(newPosts[0]));
        break;
      case NewPostType.Reply:
        await dispatch(addReply(newPosts[0]));
        break;
      default:
        await dispatch(addPost(newPosts));
        break;
    }
  }

  function resetState() {
    dispatch(clearNewPostState());
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

  async function onAddPostToThread() {
    if (!isPickerShown) return;
    if (isHomePage) {
      if (!currNewPost) return;
      const newPost = { ...currNewPost, text: newPostText };
      await dispatch(updateCurrNewPost(newPost, newPostType));
      setIsPickerShown(false);
      await dispatch(addNewPostToThread(newPostType));
      navigate("compose", { relative: "path" });
    } else {
      if (isAddingPostToThreadDisabled)
        dispatch(
          setUserMsg({
            type: "info",
            text: "You can add more Chirps to this thread after sending these.",
          })
        );
      await dispatch(addNewPostToThread(newPostType));
      textAreaRef.current?.focus();
    }
  }

  function getBtnTitleText(): BtnCreatePostTitle {
    switch (true) {
      case !!currNewPost?.schedule:
        return "Schedule";
      case newPostType === NewPostType.Reply:
        return "Reply";
      case isMultipePosts && !isHomePage:
        return "Chirp All";
      default:
        return "Chirp";
    }
  }
  useEffect(() => {
    const postArray = preCurrNewPostList.concat(currNewPost || [], postCurrNewPostList);
    const isValid = checkPostArrayValidity(postArray);
    if (isValid !== arePostsValid) setArePostsValid(isValid);
  }, [
    preCurrNewPostList,
    currNewPost,
    newPostText.length,
    postCurrNewPostList,
    arePostsValid,
    checkPostArrayValidity,
    setArePostsValid,
  ]);

  useEffect(() => {
    setNewPostText(currNewPost?.text || "");
    return () => {
      setNewPostText("");
    };
  }, [newPostModule, currNewPost?.text, setNewPostText]);

  useEffect(() => {
    if (!isHomePage) textAreaRef.current?.focus();
  }, [homePage.currPostIdx, sideBar.currPostIdx, isHomePage]);

  useEffect(() => {
    setIsPickerShown(!isHomePage);
  }, [isHomePage, setIsPickerShown]);

  return (
    <section
      className={"post-edit" + (postSaveInProgress ? " save-mode" : "")}
      onClick={openPicker}
    >
      {!!onClickBtnClose && <BtnClose onClickBtn={onClickBtnClose} />}
      {postSaveInProgress && <span className="progress-bar" />}
      {isPreCurrNewPostListShown && <PostList newPosts={preCurrNewPostList} />}
      {isReplyPostShown && (
        <MiniPostPreview type={"replied-post"}>
          <RepliedPostContent />
        </MiniPostPreview>
      )}
      <div className="content-container">
        <UserImg imgUrl={loggedinUser?.imgUrl} />
        <main className={"main-content" + (isHomePage && !isPickerShown ? " gap-0" : "")}>
          {isBtnToggleAudienceShown && <BtnToggleAudience />}
          {isPostDateTitleShown && (
            <PostDateTitle date={currNewPost.schedule!} isLink={isPickerShown} />
          )}
          {isBtnRemovePostFromThreadShown && <BtnRemovePostFromThread />}

          <PostEditTextArea isHomePage={isHomePage} textAreaRef={textAreaRef} />
          {isPostEditImgShown && <PostEditImgList />}
          {isPostEditVideoShown && <VideoEdit />}
          {isPostEditGifShown && <GifEdit />}
          {isPostEditPollShown && <PollEdit />}
          <div className="btn-replries-location-container">
            {isBtnToggleRepliersShown && <BtnToggleRepliers />}
            <PostEditTitleLocation />
          </div>
          {isQuotedPostShown && (
            <MiniPostPreview type={"quoted-post"}>
              <QuotedPostContent />
            </MiniPostPreview>
          )}
          <div className={"btns-container" + (isPickerShown ? " border-show" : "")}>
            <PostEditActions />
            <div className="secondary-action-container">
              {isIndicatorAndAddThreadBtnShown && (
                <div className="indicator-thread-btn-container">
                  <TextIndicator />
                  <hr className="vertical" />
                  <BtnAddThread
                    isDisabled={isAddingPostToThreadDisabled}
                    onAddPostToThread={onAddPostToThread}
                  />
                </div>
              )}
              <BtnCreatePost
                isDisabled={!arePostsValid}
                isSideBarBtn={false}
                onAddPost={onAddPost}
                title={getBtnTitleText()}
              />
            </div>
          </div>
        </main>
      </div>
      {isPostCurrNewPostListShown && <PostList newPosts={postCurrNewPostList} />}
    </section>
  );
};

export default PostEdit;
