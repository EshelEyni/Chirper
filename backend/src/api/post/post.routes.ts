import express from "express";
import { getPosts, getPostById, addPost, updatePost, removePost } from "./post.controller";
import { requireAuth } from "../../middlewares/requireAuth.middleware";
import {
  deleteRequestLimiter,
  getRequestLimiter,
  patchRequestLimiter,
  postRequestLimiter,
} from "../../services/rate-limiter.service";

const router = express.Router();

router.get("/", getRequestLimiter, getPosts);
router.get("/:id", getRequestLimiter, getPostById);
router.post("/", postRequestLimiter, requireAuth, addPost);
router.patch("/:id", patchRequestLimiter, requireAuth, updatePost);
router.delete("/:id", deleteRequestLimiter, requireAuth, removePost);

export default router;
