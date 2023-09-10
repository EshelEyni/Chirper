import { FC, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../store/store";
import { NewPost } from "../../../../../shared/types/post.interface";
import { AppDispatch } from "../../../store/types";
import { debounce } from "../../../services/util/utils.service";
import { usePostEdit } from "../../../contexts/PostEditContext";
import { NewPostType, updateNewPost } from "../../../store/slices/postEditSlice";

type PostTextInputProps = {
  textAreaRef: React.RefObject<HTMLTextAreaElement>;
  isHomePage: boolean;
};

export const PostEditTextArea: FC<PostTextInputProps> = ({ textAreaRef, isHomePage }) => {
  const {
    newPostText,
    setNewPostText,
    isVideoRemoved,
    isFirstPostInThread,
    isPickerShown,
    currNewPost,
  } = usePostEdit();
  const { loggedInUser } = useSelector((state: RootState) => state.auth);
  const { newPostType, reply } = useSelector((state: RootState) => state.postEdit);
  const { repliedToPost } = reply;
  const dispatch: AppDispatch = useDispatch();

  const detectURL = useRef(
    debounce(async (currPost: NewPost, text: string, isVideoRemoved: boolean) => {
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      const urls = text.match(urlRegex);
      let youtubeURL = "";
      if (urls)
        for (let i = urls.length - 1; i >= 0; i--) {
          if (urls[i].includes("https://www.youtube.com/watch")) {
            youtubeURL = urls[i];
            break;
          }
        }

      if (youtubeURL && youtubeURL !== currPost.video?.url && !isVideoRemoved) {
        const newPost = {
          ...currPost,
          text,
          video: { url: youtubeURL, isLoading: false, file: null },
        };

        dispatch(updateNewPost({ newPost, newPostType }));
      } else if (currPost.video)
        dispatch(updateNewPost({ newPost: { ...currPost, text, video: null }, newPostType }));
    }, 500).debouncedFunc
  );

  function handleTextChange(e: React.ChangeEvent<HTMLTextAreaElement>): void {
    const value = e.target.value;
    setNewPostText(value);
    detectURL.current(currNewPost, value, isVideoRemoved);
    e.target.style.height = "auto";
    e.target.style.height = e.target.scrollHeight + "px";
  }

  function handleTextBlur(): void {
    if (!currNewPost) return;
    dispatch(updateNewPost({ newPost: { ...currNewPost, text: newPostText }, newPostType }));
  }

  function setTextPlaceholder() {
    switch (newPostType) {
      case NewPostType.Reply: {
        if (currNewPost?.poll) return "Ask a question...";
        const isLoggedInUserPost = loggedInUser && loggedInUser.id === repliedToPost?.createdBy.id;
        if (isLoggedInUserPost) return "Add another Chirp!";
        return "Chirp your reply...";
      }
      case NewPostType.Quote: {
        return "Add a comment!";
      }
      case NewPostType.SideBar: {
        if (currNewPost?.poll) return "Ask a question...";
        if (isFirstPostInThread) return "What's happening?";
        else return "Add another Chirp!";
      }
      case NewPostType.HomePage: {
        if (currNewPost?.poll) return "Ask a question...";
        return "What's happening?";
      }
      default: {
        return "What's happening?";
      }
    }
  }
  return (
    <textarea
      className={
        "post-edit-text-area" +
        (isHomePage ? " home-page-height" : "") +
        (isHomePage && !isPickerShown ? " pt-10" : "") +
        (!isFirstPostInThread ? " not-first-post" : "")
      }
      placeholder={setTextPlaceholder()}
      value={newPostText}
      onChange={handleTextChange}
      onBlur={handleTextBlur}
      ref={textAreaRef}
    />
  );
};
