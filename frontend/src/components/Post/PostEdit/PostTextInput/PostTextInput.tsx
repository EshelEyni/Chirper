import { FC, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../../store/store";
import { NewPost } from "../../../../../../shared/interfaces/post.interface";
import { updateCurrNewPost } from "../../../../store/actions/new-post.actions";
import { AppDispatch } from "../../../../store/types";
import { NewPostType } from "../../../../store/reducers/new-post.reducer";
import { debounce } from "../../../../services/util/utils.service";
import { usePostEdit } from "../PostEditContext";

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
  const { loggedinUser } = useSelector((state: RootState) => state.authModule);
  const { newPostType, reply } = useSelector((state: RootState) => state.newPostModule);
  const { repliedToPost } = reply;
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
    setNewPostText(value);
    detectURL.current(currNewPost, value, isVideoRemoved);
    e.target.style.height = "auto";
    e.target.style.height = e.target.scrollHeight + "px";
  };

  const handleTextBlur = async () => {
    if (!currNewPost) return;
    const newPost = { ...currNewPost, text: newPostText };
    await dispatch(updateCurrNewPost(newPost, newPostType));
  };

  const setTextPlaceholder = () => {
    switch (newPostType) {
      case NewPostType.Reply: {
        if (currNewPost?.poll) return "Ask a question...";
        const isLoggedinUserPost = loggedinUser && loggedinUser.id === repliedToPost?.createdBy.id;
        if (isLoggedinUserPost) return "Add another Chirp!";
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
      value={newPostText}
      onChange={handleTextChange}
      onBlur={handleTextBlur}
      ref={textAreaRef}
    />
  );
};
