// import { authService } from "../auth/auth.service.js";
const { logger } = require("../../services/logger.service");
// import { postService } from "./post.service.js";
const { postService } = require("./post.service");

import { Request, Response } from "express";
import { QueryString } from "../../services/util.service.js";

async function getPosts(req: Request, res: Response): Promise<void> {
  try {
    logger.debug("Getting Posts");
    const queryString = req.query;
    const posts = await postService.query(queryString as QueryString);

    if (posts.length > 0) {
      res.status(200).send({
        status: "success",
        requestedAt: new Date().toISOString(),
        results: posts.length,
        data: posts,
      });
    } else {
      res.status(404).send({
        status: "success",
        requestedAt: new Date().toISOString(),
        results: posts.length,
        data: "No posts found",
      });
    }
  } catch (err) {
    logger.error("Failed to get posts", err as Error);

    res.status(500).send({
      status: "error",
      message: "Failed to get posts",
    });
  }
}

async function getPostById(req: Request, res: Response): Promise<void> {
  try {
    const { postId } = req.params;
    if (!postId) {
      res.status(400).send({
        status: "fail",
        data: {
          postId: "No post id provided",
        },
      });
      return;
    }
    const post = await postService.getById(postId);
    if (post) {
      res.status(200).send({
        status: "success",
        data: post,
      });
    } else {
      res.status(404).send({
        status: "fail",
        data: {
          postId: `Post with id ${postId} not found`,
        },
      });
    }
  } catch (err) {
    logger.error("Failed to get post", err as Error);
    res.status(500).send({
      status: "error",
      message: "Failed to get post",
    });
  }
}

async function addPost(req: Request, res: Response): Promise<void> {
  try {
    const currPost = req.body;

    if (!currPost) {
      res.status(400).send({
        status: "fail",
        data: {
          post: "No post provided",
        },
      });
      return;
    }
    const post = await postService.add(currPost);

    res.status(201).send({
      status: "success",
      data: post,
    });
  } catch (err) {
    logger.error("Failed to add post", err as Error);
    const message = err.message;
    res.status(500).send({
      status: "error",
      message,
    });
  }
}

async function updatePost(req: Request, res: Response): Promise<void> {
  try {
    const postToUpdate = req.body;
    if (!postToUpdate) {
      res.status(400).send({
        status: "fail",
        data: {
          post: "No post provided",
        },
      });
      return;
    }

    const updatedPost = await postService.update(postToUpdate);
    // socketService.broadcast({ type: 'post-updated', post: updatedPost, userId: loggedInUser._id })
    res.status(200).send({
      status: "success",
      data: updatedPost,
    });
  } catch (err) {
    logger.error("Failed to update post", err as Error);

    res.status(500).send({
      status: "error",
      message: "Failed to update post",
    });
  }
}

async function removePost(req: Request, res: Response): Promise<void> {
  const postId = req.params.postId;
  try {
    await postService.remove(postId);
    res.status(204).send({
      status: "success",
      data: postId,
    });
  } catch (err) {
    logger.error("Failed to remove post", err as Error);
    res.status(500).send({
      status: "error",
      message: "Failed to remove post",
    });
  }
}

module.exports = {
  getPosts,
  getPostById,
  addPost,
  updatePost,
  removePost,
};
