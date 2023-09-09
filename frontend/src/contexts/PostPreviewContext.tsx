import { createContext, useContext } from "react";
import { Post, PromotionalPost, Repost } from "../../../shared/types/post.interface";
import { useNavigate } from "react-router-dom";
import postService from "../services/post.service";
import useRemoveFollow from "../hooks/reactQuery/post/useRemoveFollow";
import useAddFollow from "../hooks/reactQuery/post/useAddFollow";

type PostPreviewContextType = {
  post: Post | Repost | PromotionalPost;
  onNavigateToPostDetails: () => void;
  onNavigateToProfile: (username: string) => void;
  onToggleFollow: () => void;
  onNavigateToPostStats: () => void;
  isRepost: boolean;
  isPromotionalPost: boolean;
};

const PostPreviewContext = createContext<PostPreviewContextType | undefined>(undefined);

function PostPreviewProvider({ post, children }: { post: Post; children: React.ReactNode }) {
  const { isDetailedViewed, isProfileViewed } = post.loggedInUserActionState;
  const navigate = useNavigate();
  const { addFollow } = useAddFollow();
  const { removeFollow } = useRemoveFollow();

  const isRepost = "repostedBy" in post;
  const isPromotionalPost = "companyName" in post;

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

  const value: PostPreviewContextType = {
    post,
    onNavigateToPostDetails,
    onNavigateToProfile,
    onToggleFollow,
    onNavigateToPostStats,
    isRepost,
    isPromotionalPost,
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
