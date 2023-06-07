import express from "express";
import { requireAuth } from "../../middlewares/requireAuth.middleware";
import {
  getPosts,
  getPostById,
  addPost,
  addPostThread,
  repostPost,
  updatePost,
  removePost,
  savePollVote,
} from "./post.controller";

const router = express.Router();

router.get("/", getPosts);
router.get("/:id", getPostById);
router.use(requireAuth);
router.post("/", addPost);
router.post("/thread", addPostThread);
router.post("/repost", repostPost);
router.patch("/:id", updatePost);
router.delete("/:id", removePost);
router.post("/poll/vote", savePollVote);
export default router;
