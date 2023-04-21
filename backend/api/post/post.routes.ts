import { Router } from "express";
import {
  requireAuth,
  requireAdmin,
} from "../../middlewares/requireAuth.middleware";
import { log } from "../../middlewares/logger.middleware";
import {
  getPost,
  getPostById,
  addPost,
  updatePost,
  removePost,
} from "./post.controller";

const router = Router();

// middleware that is specific to this router
// router.use(requireAuth)

router.get("/", log, getPost);
router.get("/:PostId", log, getPostById);
router.post("/", log, addPost);
router.put("/:PostId", log, updatePost);
router.delete("/:PostId", log, removePost);

// router.post('/', log, requireAuth, addPost)
// router.put('/:PostId', log, requireAuth, updatePost)
// router.delete('/:PostId', log, requireAuth, removePost)

export default router;
