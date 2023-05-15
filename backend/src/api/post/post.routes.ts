import express from "express";
import { requireAuth } from "../../middlewares/requireAuth.middleware";
import {
  deleteRequestLimiter,
  getRequestLimiter,
  patchRequestLimiter,
  postRequestLimiter,
} from "../../services/rate-limiter.service";
import {
  getPosts,
  getPostById,
  addPost,
  updatePost,
  removePost,
  savePollVote,
} from "./post.controller";

const router = express.Router();

router.get("/", getRequestLimiter, getPosts);
router.get("/:id", getRequestLimiter, getPostById);
router.post("/", postRequestLimiter, requireAuth, addPost);
router.patch("/:id", patchRequestLimiter, requireAuth, updatePost);
router.delete("/:id", deleteRequestLimiter, requireAuth, removePost);
router.post("/poll/vote", postRequestLimiter, requireAuth, savePollVote);
export default router;
