module.exports = () => {
  const express = require("express");
  const router = express.Router();
  const { getPosts, getPostById, addPost, updatePost, removePost } = require("./post.controller");
  const { requireAuth } = require("../../middlewares/requireAuth.middleware.js");

  router.get("/", getPosts);
  router.get("/:id", getPostById);
  router.post("/", requireAuth, addPost);
  router.patch("/:id", requireAuth, updatePost);
  router.delete("/:id", requireAuth, removePost);

  return router;
};
