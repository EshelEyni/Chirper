import { createContext, useContext, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import { NewPostType } from "../store/reducers/new-post.reducer";
import { NewPost } from "../../../shared/interfaces/post.interface";

type PostEditContextType = {
  currNewPost: NewPost | null;
  newPostText: string;
  setNewPostText: React.Dispatch<React.SetStateAction<string>>;
  preCurrNewPostList: NewPost[];
  postCurrNewPostList: NewPost[];
  isVideoRemoved: boolean;
  setIsVideoRemoved: React.Dispatch<React.SetStateAction<boolean>>;
  arePostsValid: boolean;
  setArePostsValid: React.Dispatch<React.SetStateAction<boolean>>;
  isFirstPostInThread: boolean;
  isPickerShown: boolean;
  setIsPickerShown: React.Dispatch<React.SetStateAction<boolean>>;
};

const PostEditContext = createContext<PostEditContextType | undefined>(undefined);

function PostEditProvider({ children }: { children: React.ReactNode }) {
  const [newPostText, setNewPostText] = useState("");
  const [isVideoRemoved, setIsVideoRemoved] = useState<boolean>(false);
  const [arePostsValid, setArePostsValid] = useState<boolean>(false);
  const [isPickerShown, setIsPickerShown] = useState<boolean>(false);

  const newPostModule = useSelector((state: RootState) => state.newPostModule);
  const { newPostType } = newPostModule;
  const isThreadType = newPostType === NewPostType.SideBar || newPostType === NewPostType.HomePage;
  const isFirstPostInThread = isThreadType && newPostModule[newPostType].currPostIdx === 0;

  const preCurrNewPostList = useMemo(() => {
    return isThreadType
      ? newPostModule[newPostType].posts.filter(
          (_, idx) => idx < newPostModule[newPostType].currPostIdx
        )
      : [];
  }, [isThreadType, newPostModule, newPostType]);

  const postCurrNewPostList = useMemo(() => {
    return isThreadType
      ? newPostModule[newPostType].posts.filter(
          (_, idx) => idx > newPostModule[newPostType].currPostIdx
        )
      : [];
  }, [isThreadType, newPostModule, newPostType]);

  const currNewPost = useMemo(() => {
    switch (newPostType) {
      case NewPostType.SideBar:
        return newPostModule.sideBar.posts[newPostModule.sideBar.currPostIdx];
      case NewPostType.HomePage:
        return newPostModule.homePage.posts[newPostModule.homePage.currPostIdx];
      case NewPostType.Reply:
        return newPostModule.reply.reply;
      case NewPostType.Quote:
        return newPostModule.quote.quote;
      default:
        return null;
    }
  }, [newPostModule, newPostType]);

  const value = {
    currNewPost,
    newPostText,
    setNewPostText,
    preCurrNewPostList,
    postCurrNewPostList,
    isVideoRemoved,
    setIsVideoRemoved,
    arePostsValid,
    setArePostsValid,
    isFirstPostInThread,
    isPickerShown,
    setIsPickerShown,
  };

  return <PostEditContext.Provider value={value}>{children}</PostEditContext.Provider>;
}

function usePostEdit() {
  const context = useContext(PostEditContext);
  if (context === undefined) throw new Error("PostEditContext was used outside PostEditProvider");
  return context;
}

export { PostEditProvider, usePostEdit };
