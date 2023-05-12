import express from "express";
import { getPosts, getPostById, addPost, updatePost, removePost } from "./post.controller";
import { requireAuth } from "../../middlewares/requireAuth.middleware";

const router = express.Router();

router.get("/", getPosts);
router.get("/:id", getPostById);
router.post("/", requireAuth, addPost);
router.patch("/:id", requireAuth, updatePost);
router.delete("/:id", requireAuth, removePost);

export default router;
