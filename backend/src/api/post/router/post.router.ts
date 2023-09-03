import express from "express";
import {
  checkUserAuthentication,
  checkAdminAuthorization,
} from "../../../middlewares/authGuards/authGuards.middleware";
import {
  getPosts,
  getPostById,
  addPost,
  addPostThread,
  addReply,
  repostPost,
  updatePost,
  removePost,
  removeRepost,
  savePollVote,
  quotePost,
  addLike,
  removeLike,
  getPostStats,
  createPostStatsWithView,
  updatePostStats,
  getBookmarkedPosts,
  addBookmarkedPost,
  removeBookmarkedPost,
  addPromotionalPost,
  getPromotionalPosts,
} from "../controller/post.controller";

const router = express.Router();

router.get("/", getPosts);
router.get("/:id([a-fA-F0-9]{24})", getPostById);

router.use(checkUserAuthentication);

router.get("/:id/stats", getPostStats);
router.post("/:id/stats", createPostStatsWithView);
router.patch("/:id/stats", updatePostStats);

router.get("/bookmark", getBookmarkedPosts);
router.post("/:id/bookmark", addBookmarkedPost);
router.delete("/:id/bookmark", removeBookmarkedPost);

router.post("/thread", addPostThread);

router.post("/reply", addReply);
router.post("/:id/repost", repostPost);

router.delete("/repost", removeRepost);
router.post("/quote", quotePost);

router.delete("/:id/like", removeLike);
router.post("/:id/like", addLike);

router.post("/", addPost);

router.patch("/:id", updatePost);
router.delete("/:id", removePost);

router.post("/poll/vote", savePollVote);

router.use(checkAdminAuthorization);
router.get("/promotional", getPromotionalPosts);
router.post("/promotional", addPromotionalPost);

export default router;
