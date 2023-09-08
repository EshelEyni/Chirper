import express from "express";
import {
  checkUserAuthentication,
  checkAdminAuthorization,
} from "../../Middlewares/AuthGuards/AuthGuardsMiddleware";
import {
  getPosts,
  getPostById,
  addPost,
  addPostThread,
  addReply,
  addRepost,
  updatePost,
  removePost,
  removeRepost,
  addPollVote,
  quotePost,
  addLike,
  removeLike,
  getPostStats,
  createPostStats,
  updatePostStats,
  getBookmarkedPosts,
  addBookmarkedPost,
  removeBookmarkedPost,
  addPromotionalPost,
  getPromotionalPosts,
} from "../../Controllers/Post/PostController";

const router = express.Router();

router.get("/", getPosts);
router.get("/:id([a-fA-F0-9]{24})", getPostById);

router.use(checkUserAuthentication);

router.get("/:id/stats", getPostStats);
router.post("/:id/stats", createPostStats);
router.patch("/:id/stats", updatePostStats);

router.get("/bookmark", getBookmarkedPosts);
router.post("/:id/bookmark", addBookmarkedPost);
router.delete("/:id/bookmark", removeBookmarkedPost);

router.post("/thread", addPostThread);

router.post("/:id/reply", addReply);

router.post("/:id/repost", addRepost);
router.delete("/:id/repost", removeRepost);

router.post("/:id/quote", quotePost);

router.delete("/:id/like", removeLike);
router.post("/:id/like", addLike);

router.post("/", addPost);

router.patch("/:id", updatePost);
router.delete("/:id", removePost);

router.post("/poll/:id/vote", addPollVote);

router.use(checkAdminAuthorization);
router.get("/promotional", getPromotionalPosts);
router.post("/promotional", addPromotionalPost);

export default router;
