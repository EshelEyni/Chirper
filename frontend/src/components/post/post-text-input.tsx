import { FC, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { NewPost, Post } from "../../../../shared/interfaces/post.interface";
import { updateCurrNewPost } from "../../store/actions/new-post.actions";
import { AppDispatch } from "../../store/types";
import { NewPostType as typeofPostType } from "../../store//reducers/new-post.reducer";
import { debounce } from "../../services/util.service/utils.service";

type PostTextInputProps = {
  currNewPost: NewPost | null;
  replyToPost: Post | null;
  setInputTextValue: React.Dispatch<React.SetStateAction<string>>;
  inputTextValue: string;
  textAreaRef: React.RefObject<HTMLTextAreaElement>;
  postType: typeofPostType;
  isHomePage: boolean;
  isPickerShown: boolean;
  isFirstPostInThread: boolean;
  isVideoRemoved: boolean;
};

export const PostTextInput: FC<PostTextInputProps> = ({
  currNewPost,
  replyToPost,
  setInputTextValue,
  inputTextValue,
  textAreaRef,
  postType,
  isHomePage,
  isPickerShown,
  isFirstPostInThread,
  isVideoRemoved,
}) => {
  const { loggedinUser } = useSelector((state: RootState) => state.authModule);
  const { newPostType } = useSelector((state: RootState) => state.newPostModule);

  const dispatch: AppDispatch = useDispatch();

  const detectURL = useRef(
    debounce(async (currPost: NewPost, text: string, isVideoRemoved: boolean) => {
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
    }, 500).debouncedFunc
  );

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInputTextValue(value);
    detectURL.current(currNewPost, value, isVideoRemoved);
    e.target.style.height = "auto";
    e.target.style.height = e.target.scrollHeight + "px";
  };

  const handleTextBlur = async () => {
    if (!currNewPost) return;
    const newPost = { ...currNewPost, text: inputTextValue };
    await dispatch(updateCurrNewPost(newPost, newPostType));
  };

  const setTextPlaceholder = () => {
    switch (postType) {
      case "reply": {
        if (currNewPost?.poll) return "Ask a question...";
        const isLoggedinUserPost = loggedinUser && loggedinUser.id === replyToPost?.createdBy.id;
        if (isLoggedinUserPost) return "Add another Chirp!";
        return "Chirp your reply...";
      }
      case "quote": {
        return "Add a comment!";
      }
      case "side-bar": {
        if (currNewPost?.poll) return "Ask a question...";
        if (isFirstPostInThread) return "What's happening?";
        else return "Add another Chirp!";
      }
      case "home-page": {
        if (currNewPost?.poll) return "Ask a question...";
        return "What's happening?";
      }
      default: {
        return "What's happening?";
      }
    }
  };
  return (
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
  );
};
