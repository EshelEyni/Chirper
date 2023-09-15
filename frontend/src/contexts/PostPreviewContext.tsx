import { createContext, useContext } from "react";
import { AnyPost, Post } from "../../../shared/types/post";
import { useNavigate } from "react-router-dom";
import postApiService from "../services/post/postApiService";
import useRemoveFollow from "../hooks/useRemoveFollow";
import useAddFollow from "../hooks/useAddFollow";

type PostPreviewContextType = {
  post: AnyPost;
  onNavigateToPostDetails: () => void;
  onNavigateToProfile: (username: string) => void;
  onToggleFollow: () => void;
  onNavigateToPostStats: () => void;
};

const PostPreviewContext = createContext<PostPreviewContextType | undefined>(undefined);

function PostPreviewProvider({ post, children }: { post: Post; children: React.ReactNode }) {
  const { isDetailedViewed, isProfileViewed } = post.loggedInUserActionState;
  const navigate = useNavigate();
  const { addFollow } = useAddFollow();
  const { removeFollow } = useRemoveFollow();

  async function onNavigateToPostDetails() {
    if (!isDetailedViewed)
      await postApiService.updatePostStats(post.id, { isDetailedViewed: true });
    navigate(`/post/${post.id}`);
  }

  async function onNavigateToProfile(username: string) {
    if (!isProfileViewed) await postApiService.updatePostStats(post.id, { isProfileViewed: true });
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

  const value: PostPreviewContextType = {
    post,
    onNavigateToPostDetails,
    onNavigateToProfile,
    onToggleFollow,
    onNavigateToPostStats,
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
