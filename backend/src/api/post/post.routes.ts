import express from "express";
import { requireAuth } from "../../middlewares/requireAuth.middleware";
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
} from "./post.controller";

const router = express.Router();

router.get("/", getPosts);
router.get("/:id", getPostById);
router.use(requireAuth);

router.get("/:id/stats", getPostStats);
router.post("/:id/stats", createPostStatsWithView);
router.patch("/:id/stats", updatePostStats);
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
