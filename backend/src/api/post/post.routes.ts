const express = require("express");
const router = express.Router();
const { log } = require("../../middlewares/logger.middleware");
const { getPosts, getPostById, addPost, updatePost, removePost } = require("./post.controller");
// import { requireAuth, requireAdmin } from "../../middlewares/requireAuth.middleware.js";



router.get("/", log, getPosts);
router.get("/:PostId", log, getPostById);
router.post("/", log, addPost);
router.put("/:PostId", log, updatePost);
router.delete("/:PostId", log, removePost);

module.exports = router;
