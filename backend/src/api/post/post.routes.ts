module.exports = () => {
  const express = require("express");
  const router = express.Router();
  const { log } = require("../../middlewares/logger.middleware");
  const { getPosts, getPostById, addPost, updatePost, removePost } = require("./post.controller");
  // import { requireAuth, requireAdmin } from "../../middlewares/requireAuth.middleware.js";

  router.get("/", log, getPosts);
  router.get("/:id", log, getPostById);
  router.post("/", log, addPost);
  router.patch("/:id", log, updatePost);
  router.delete("/:id", log, removePost);

  return router;
};
