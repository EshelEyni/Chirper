import { createContext, useContext, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { NewPost } from "../../../shared/types/post";
import { NewPostType } from "../store/slices/postEditSlice";
import { RootState } from "../types/app";

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

function PostEditProvider({
  children,
  isHomePage,
}: {
  children: React.ReactNode;
  isHomePage?: boolean;
}) {
  const [newPostText, setNewPostText] = useState("");
  const [isVideoRemoved, setIsVideoRemoved] = useState<boolean>(false);
  const [arePostsValid, setArePostsValid] = useState<boolean>(false);
  const [isPickerShown, setIsPickerShown] = useState<boolean>(false);

  const postEdit = useSelector((state: RootState) => state.postEdit);
  const { newPostType } = postEdit;
  const isThreadType = newPostType === NewPostType.HomePage || newPostType === NewPostType.SideBar;
  const isFirstPostInThread = isThreadType && postEdit[newPostType].currPostIdx === 0;

  const preCurrNewPostList = useMemo(() => {
    return isThreadType
      ? postEdit[newPostType].posts.filter((_, idx) => idx < postEdit[newPostType].currPostIdx)
      : [];
  }, [isThreadType, postEdit, newPostType]);

  const postCurrNewPostList = useMemo(() => {
    return isThreadType
      ? postEdit[newPostType].posts.filter((_, idx) => idx > postEdit[newPostType].currPostIdx)
      : [];
  }, [isThreadType, postEdit, newPostType]);

  const currNewPost = useMemo(() => {
    if (isHomePage) return postEdit.homePage.posts[postEdit.homePage.currPostIdx];
    switch (newPostType) {
      case NewPostType.SideBar:
        return postEdit.sideBar.posts[postEdit.sideBar.currPostIdx];
      case NewPostType.HomePage:
        return postEdit.homePage.posts[postEdit.homePage.currPostIdx];
      case NewPostType.Reply:
        return postEdit.reply.reply;
      case NewPostType.Quote:
        return postEdit.quote.quote;
      default:
        return null;
    }
  }, [postEdit, newPostType, isHomePage]);

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
