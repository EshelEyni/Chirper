import { createContext, useContext, useState } from "react";
import { useDispatch } from "react-redux";
import { Poll, Post } from "../../../shared/interfaces/post.interface";
import { useNavigate } from "react-router-dom";
import postService from "../services/post.service";
import { AppDispatch } from "../store/types";
import { addFollowFromPost, removeFollowFromPost } from "../store/actions/post.actions";

type PostPreviewContextType = {
  post: Post;
  onNavigateToPostDetails: () => void;
  onNavigateToProfile: (username: string) => void;
  onToggleFollow: () => void;
  poll: Poll | null;
  setPoll: React.Dispatch<React.SetStateAction<Poll | null>>;
};

const PostPreviewContext = createContext<PostPreviewContextType | undefined>(undefined);

function PostPreviewProvider({ post, children }: { post: Post; children: React.ReactNode }) {
  const { isDetailedViewed, isProfileViewed } = post.loggedInUserActionState;
  const [poll, setPoll] = useState(post.poll || null);
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();

  async function onNavigateToPostDetails() {
    if (!isDetailedViewed) await postService.updatePostStats(post.id, { isDetailedViewed: true });
    navigate(`/post/${post.id}`);
  }

  async function onNavigateToProfile(username: string) {
    if (!isProfileViewed) await postService.updatePostStats(post.id, { isProfileViewed: true });
    navigate(`/profile/${username}`);
  }

  function onToggleFollow() {
    if (post.createdBy.isFollowing) dispatch(removeFollowFromPost(post.createdBy.id, post.id));
    else dispatch(addFollowFromPost(post.createdBy.id, post.id));
  }

  const value = {
    post,
    onNavigateToPostDetails,
    onNavigateToProfile,
    onToggleFollow,
    poll,
    setPoll,
  };
  return <PostPreviewContext.Provider value={value}>{children}</PostPreviewContext.Provider>;
}

function usePostPreview() {
  const context = useContext(PostPreviewContext);
  if (context === undefined) {
    throw new Error("usePostPreview must be used within a PostPreviewProvider");
  }
  return context;
}

export { PostPreviewProvider, usePostPreview };
