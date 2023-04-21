import { authService } from "../auth/auth.service";
import { logger } from "../../services/logger.service";
import { postService } from "./post.service";
import { Request, Response } from "express";
import { NewPost, Post } from "../../../shared/interfaces/post.interface";
// import socketService from '../../services/socket.service.js'

export async function getPost(req: Request, res: Response): Promise<void> {
  try {
    logger.debug("Getting Posts");
    const posts = await postService.query();
    res.send(posts);
  } catch (err) {
    logger.error("Failed to get post", err as Error);
    res.status(500).send({ err: "Failed to get post" });
  }
}

export async function getPostById(req: Request, res: Response): Promise<void> {
  try {
    const { postId } = req.params;
    const post = await postService.getById(postId);
    res.send(post);
  } catch (err) {
    logger.error("Failed to get post", err as Error);
    res.status(500).send({ err: "Failed to get post" });
  }
}

export async function addPost(req: Request, res: Response): Promise<void> {
  try {
    const currPost = req.body;
    console.log("currPost", currPost);
    const post = await postService.add(currPost);

    res.send(post);
  } catch (err) {
    logger.error("Failed to add post", err as Error);
    res.status(500).send({ err: "Failed to add post" });
  }
}

export async function updatePost(req: Request, res: Response): Promise<void> {
  // var loggedInUser = await authService.validateToken(req.cookies.loginToken)
  try {
    const postToUpdate = req.body;
    const updatedPost = await postService.update(postToUpdate);
    // socketService.broadcast({ type: 'post-updated', post: updatedPost, userId: loggedInUser._id })
    res.send(updatedPost);
  } catch (err) {
    logger.error("Failed to update post", err as Error);
    res.status(500).send({ err: "Failed to update post" });
  }
}

export async function removePost(req: Request, res: Response): Promise<void> {
  const postId = req.params.postId;
  try {
    await postService.remove(postId);
    res.send({ msg: "Removed succesfully" });
  } catch (err) {
    logger.error("Failed to remove post", err as Error);
    res.status(500).send({ err: "Failed to remove post" });
  }
}
