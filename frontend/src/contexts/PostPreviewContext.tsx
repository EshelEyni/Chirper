import { createContext, useContext, useState } from "react";
import { Poll, Post } from "../../../shared/interfaces/post.interface";
import { useNavigate } from "react-router-dom";
import postService from "../services/post.service";
import useRemoveFollow from "../hooks/reactQuery/post/useRemoveFollow";
import useAddFollow from "../hooks/reactQuery/post/useAddFollow";

type PostPreviewContextType = {
  post: Post;
  onNavigateToPostDetails: () => void;
  onNavigateToProfile: (username: string) => void;
  onToggleFollow: () => void;
  onNavigateToPostStats: () => void;
  poll: Poll | null;
  setPoll: React.Dispatch<React.SetStateAction<Poll | null>>;
};

const PostPreviewContext = createContext<PostPreviewContextType | undefined>(undefined);

function PostPreviewProvider({ post, children }: { post: Post; children: React.ReactNode }) {
  const { isDetailedViewed, isProfileViewed } = post.loggedInUserActionState;
  const [poll, setPoll] = useState(post.poll || null);
  const navigate = useNavigate();
  const { addFollow } = useAddFollow();
  const { removeFollow } = useRemoveFollow();

  async function onNavigateToPostDetails() {
    if (!isDetailedViewed) await postService.updatePostStats(post.id, { isDetailedViewed: true });
    navigate(`/post/${post.id}`);
  }

  async function onNavigateToProfile(username: string) {
    if (!isProfileViewed) await postService.updatePostStats(post.id, { isProfileViewed: true });
    navigate(`/profile/${username}`);
  }

  function onNavigateToPostStats() {
    navigate(`post-stats/${post.id}`, { relative: "path" });
  }

  function onToggleFollow() {
    if (post.createdBy.isFollowing)
      removeFollow({
        userId: post.createdBy.id,
        postId: post.id,
      });
    else
      addFollow({
        userId: post.createdBy.id,
        postId: post.id,
      });
  }

  const value = {
    post,
    onNavigateToPostDetails,
    onNavigateToProfile,
    onToggleFollow,
    onNavigateToPostStats,
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
