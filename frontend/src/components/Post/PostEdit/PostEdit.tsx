/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { NewPost } from "../../../../../shared/types/post";
import "./PostEdit.scss";
import { uploadFileToCloudinary } from "../../../services/cloudinary/cloudinaryService";
import { BtnClose } from "../../Btns/BtnClose/BtnClose";
import { MiniPostPreview } from "../PostPreview/MiniPostPreview";
import { RepliedPostContent } from "../PostPreview/RepliedPostContent";
import { BtnAudience } from "../../Btns/BtnAudience/BtnAudience";
import { PostDateTitle } from "../PostDateTitle/PostDateTitle";
import { PostEditTextArea } from "./PostEditTextArea";
import { UserImg } from "../../User/UserImg/UserImg";
import { PostEditImgList } from "./PostEditImgList";
import { GifEdit } from "../../Gif/GifEdit/GifEdit";
import { PollEdit } from "../../Poll/PollEdit/PollEdit";
import { BtnRepliers } from "../../Btns/BtnRepliers/BtnRepliers";
import { PostEditTitleLocation } from "./PostEditTitleLocation";
import { QuotedPostContent } from "../PostPreview/QuotedPostContent";
import { TextIndicator } from "./TextIndicator";
import { usePostEdit } from "../../../contexts/PostEditContext";
import { VideoEdit } from "../../Video/VideoEdit/VideoEdit";
import { toast } from "react-hot-toast";
import { UserMsg } from "../../Msg/UserMsg/UserMsg";
import { UserMsg as TypeOfUserMsg } from "../../../../../shared/types/system";
import {
  addNewPostToThread,
  clearAllNewPosts,
  removeNewPost,
  updateNewPost,
} from "../../../store/slices/postEditSlice";
import { useCreatePost } from "../../../hooks/useCreatePost";
import { NewPostContent } from "../PostPreview/NewPostContent";
import postUtilService from "../../../services/post/postUtilService";
import { useGoBack } from "../../../hooks/useGoBack";
import { PostActions } from "../Actions/PostActions";
import { List } from "../../App/List/List";
import { AppDispatch, BtnCreatePostTitle, RootState } from "../../../types/app";
import { Button } from "../../App/Button/Button";
import { AiOutlineClose, AiOutlinePlus } from "react-icons/ai";
import { NewPostType } from "../../../types/Enums";

interface PostEditProps {
  isHomePage?: boolean;
  onClickBtnClose?: () => void;
}

const PostEdit: React.FC<PostEditProps> = ({ isHomePage = false, onClickBtnClose }) => {
  const { loggedInUser } = useSelector((state: RootState) => state.auth);
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
  const { postEdit } = useSelector((state: RootState) => state);
  const { sideBar, homePage, reply, quote, newPostType } = postEdit;
  const { isCreating, createPost } = useCreatePost({ onSuccessFn: resetState });
  const { goBack } = useGoBack("compose");
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();

  const threadLength = preCurrNewPostList.length + postCurrNewPostList.length + 1;
  const threadLimit = 10;
  const isAddingPostToThreadDisabled = threadLength >= threadLimit;
  const isPostDateTitleShown = currNewPost?.schedule && isFirstPostInThread;
  const isPreCurrNewPostListShown = !isHomePage && preCurrNewPostList.length > 0;
  const isReplyPostShown = !isHomePage && !!reply.repliedToPost;
  const isQueotePostShown = !isHomePage && !!quote.quotedPost;
  const isBtnToggleAudienceShown = isPickerShown && isFirstPostInThread;
  const isPostCurrNewPostListShown = !isHomePage && postCurrNewPostList.length > 0;

  const isBtnRemovePostFromThreadShown =
    !isFirstPostInThread &&
    !isHomePage &&
    (newPostType === NewPostType.HomePage || newPostType === NewPostType.SideBar) &&
    !postUtilService.isPostValid(currNewPost);
  const isIndicatorAndAddThreadBtnShown = newPostText.length > 0;

  async function onAddPost() {
    if (!currNewPost || !loggedInUser) return;
    const newPosts = [...preCurrNewPostList, currNewPost, ...postCurrNewPostList];
    await uploadImagesAndSetToPost(newPosts);
    await uploadVideoAndSetToPost(newPosts);
    createPost({
      posts: newPosts,
      type: newPostType,
    });
  }

  async function uploadImagesAndSetToPost(newPosts: NewPost[]) {
    for (const post of newPosts) {
      if (!post.imgs.length) return;

      for (let img of post.imgs) {
        if (!img.file) continue;
        const url = await uploadFileToCloudinary(img.file, "image");
        if (!url) continue;
        img = { url };
      }

      // const prms = post.imgs.map(async img => ({
      //   url: await uploadFileToCloudinary(img.file, "image"),
      // }));
      // const savedImgUrl = await Promise.all(prms);
      // post.imgs = savedImgUrl.filter(img => img.url) as unknown as NewPostImg[];
    }
  }

  async function uploadVideoAndSetToPost(newPosts: NewPost[]) {
    for (const post of newPosts) {
      if (!post.video) return;
      if (post.video.file) post.videoUrl = await uploadFileToCloudinary(post.video.file, "video");
      else post.videoUrl = post.video.url;
      delete post.video;
    }
  }

  function resetState() {
    dispatch(clearAllNewPosts());
    setIsPickerShown(false);
    setArePostsValid(false);
    if (textAreaRef.current) textAreaRef.current.style.height = "auto";
    if (isHomePage) return;
    goBack();
  }

  function openPicker() {
    if (isPickerShown) return;
    setIsPickerShown(true);
    textAreaRef.current?.focus();
  }

  function onAddPostToThread() {
    if (!isPickerShown) return;
    if (isHomePage) {
      if (!currNewPost) return;
      dispatch(updateNewPost({ newPost: { ...currNewPost, text: newPostText } }));
      setIsPickerShown(false);
      dispatch(addNewPostToThread());
      navigate("compose", { relative: "path" });
    } else {
      if (threadLength === threadLimit - 1) {
        const msg = {
          type: "info",
          text: "You can add more Chirps to this thread after sending these.",
        } as TypeOfUserMsg;
        toast.success(<UserMsg userMsg={msg} />);
      }

      dispatch(addNewPostToThread());
      textAreaRef.current?.focus();
    }
  }

  function getBtnTitleText(): BtnCreatePostTitle {
    switch (true) {
      case !!currNewPost?.schedule:
        return "Schedule";
      case newPostType === NewPostType.Reply:
        return "Reply";
      case threadLength > 1 && !isHomePage:
        return "Chirp All";
      default:
        return "Chirp";
    }
  }

  useEffect(() => {
    const postArray = preCurrNewPostList.concat(currNewPost || [], postCurrNewPostList);
    let isValid =
      postUtilService.isPostThreadValid(postArray) ||
      (isFirstPostInThread && postUtilService.isPostTextValid(newPostText));
    if (threadLength > 1) isValid = postUtilService.isPostThreadValid(postArray);

    if (isValid !== arePostsValid) setArePostsValid(isValid);
  }, [
    preCurrNewPostList,
    currNewPost,
    newPostText,
    postCurrNewPostList,
    arePostsValid,
    isFirstPostInThread,
    threadLength,
    setArePostsValid,
  ]);

  useEffect(() => {
    setNewPostText(currNewPost?.text || "");
    return () => {
      setNewPostText("");
    };
  }, [postEdit, currNewPost?.text, setNewPostText]);

  useEffect(() => {
    if (!isHomePage) textAreaRef.current?.focus();
  }, [homePage.currPostIdx, sideBar.currPostIdx, isHomePage]);

  useEffect(() => {
    setIsPickerShown(!isHomePage);
  }, [isHomePage, setIsPickerShown]);

  if (!currNewPost) return null;
  return (
    <section className={"post-edit" + (isCreating ? " save-mode" : "")} onClick={openPicker}>
      {!!onClickBtnClose && <BtnClose onClickBtn={onClickBtnClose} />}
      {isCreating && <span className="progress-bar" />}
      {isPreCurrNewPostListShown && (
        <List
          items={preCurrNewPostList as NewPost[]}
          render={(post: NewPost) => (
            <MiniPostPreview key={post.tempId} newPost={post} type={"new-post"}>
              <NewPostContent newPost={post} />
            </MiniPostPreview>
          )}
        />
      )}
      {isReplyPostShown && (
        <MiniPostPreview type={"replied-post"}>
          <RepliedPostContent />
        </MiniPostPreview>
      )}
      <div className="content-container">
        <UserImg imgUrl={loggedInUser?.imgUrl} />
        <main className={"main-content" + (isHomePage && !isPickerShown ? " gap-0" : "")}>
          {isBtnToggleAudienceShown && <BtnAudience />}
          {isPostDateTitleShown && (
            <PostDateTitle date={currNewPost.schedule!} isLink={isPickerShown} />
          )}
          {isBtnRemovePostFromThreadShown && (
            <Button
              className="btn-remove-post-from-thread"
              onClickFn={() => dispatch(removeNewPost())}
            >
              <AiOutlineClose color="var(--color-primary)" size={15} />
            </Button>
          )}

          <PostEditTextArea isHomePage={isHomePage} textAreaRef={textAreaRef} />
          {currNewPost.imgs.length > 0 && <PostEditImgList />}
          {!!currNewPost?.video && <VideoEdit />}
          {!!currNewPost?.gif && <GifEdit />}
          {!!currNewPost?.poll && <PollEdit />}
          <div className="btn-replries-location-container">
            {isPickerShown && <BtnRepliers />}
            <PostEditTitleLocation />
          </div>
          {isQueotePostShown && (
            <MiniPostPreview type={"quoted-post"}>
              <QuotedPostContent />
            </MiniPostPreview>
          )}
          <div className={"btns-container" + (isPickerShown ? " border-show" : "")}>
            <PostActions
              newPost={currNewPost}
              isPickerShown={isPickerShown}
              newPostText={newPostText}
              setNewPostText={setNewPostText}
              className="edit"
            >
              <PostActions.Media />
              <PostActions.Gif />
              <PostActions.Poll />
              <PostActions.Emoji />
              <PostActions.Schedule />
              <PostActions.Location />
            </PostActions>

            <div className="secondary-action-container">
              {isIndicatorAndAddThreadBtnShown && (
                <div className="indicator-thread-btn-container">
                  <TextIndicator />
                  <hr className="vertical" />
                  <Button
                    className="btn-add-thread"
                    onClickFn={onAddPostToThread}
                    isDisabled={isAddingPostToThreadDisabled}
                  >
                    <AiOutlinePlus className="btn-add-thread-icon" />
                  </Button>
                </div>
              )}
              <Button className="btn-create-post" onClickFn={onAddPost} isDisabled={!arePostsValid}>
                {getBtnTitleText()}
              </Button>
            </div>
          </div>
        </main>
      </div>
      {isPostCurrNewPostListShown && (
        <List
          items={postCurrNewPostList as NewPost[]}
          render={(post: NewPost) => (
            <MiniPostPreview key={post.tempId} newPost={post} type={"new-post"}>
              <NewPostContent newPost={post} />
            </MiniPostPreview>
          )}
        />
      )}
    </section>
  );
};

export default PostEdit;
