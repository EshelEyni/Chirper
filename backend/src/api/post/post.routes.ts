import express from "express";
import { checkUserAuthentication } from "../../middlewares/authGuards/authGuards.middleware";
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
} from "./post.controller";

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
router.post("/repost", repostPost);
router.delete("/repost", removeRepost);
router.post("/quote", quotePost);
router.delete("/:id/like", removeLike);
router.post("/:id/like", addLike);
router.post("/", addPost);

router.patch("/:id", updatePost);
router.delete("/:id", removePost);

router.post("/poll/vote", savePollVote);

export default router;
