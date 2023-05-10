import { Request, Response } from "express";
import { QueryString } from "../../services/util.service.js";
import { Post } from "../../../../shared/interfaces/post.interface.js";

const { logger } = require("../../services/logger.service");
const postService = require("./post.service");
const { asyncErrorCatcher, AppError } = require("../../services/error.service");

const getPosts = asyncErrorCatcher(async (req: Request, res: Response): Promise<void> => {
  logger.debug("Getting Posts");
  const queryString = req.query;
  const posts = (await postService.query(queryString as QueryString)) as unknown as Post[];

  res.status(200).send({
    status: "success",
    requestedAt: new Date().toISOString(),
    results: posts.length,
    data: posts,
  });
});

const getPostById = asyncErrorCatcher(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  if (!id) throw new AppError("No post id provided", 400);
  const post = await postService.getById(id);
  if (!post) throw new AppError(`Post with id ${id} not found`, 404);

  res.status(200).send({
    status: "success",
    data: post,
  });
});

const addPost = asyncErrorCatcher(async (req: Request, res: Response): Promise<void> => {
  const currPost = req.body;
  const isCurrPostEmpty = Object.keys(currPost).length === 0;
  if (isCurrPostEmpty) throw new AppError("No post provided", 400);
  const post = await postService.add(currPost);

  res.status(201).send({
    status: "success",
    data: post,
  });
});

const updatePost = asyncErrorCatcher(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  if (!id) throw new AppError("No post id provided", 400);
  const postToUpdate = req.body;
  const isPostToUpdateEmpty = Object.keys(postToUpdate).length === 0;
  if (isPostToUpdateEmpty) throw new AppError("No post provided", 400);

  const updatedPost = await postService.update(id, postToUpdate);
  if (!updatedPost) throw new AppError(`Post with id ${id} not found`, 404);
  res.status(200).send({
    status: "success",
    data: updatedPost,
  });
});

const removePost = asyncErrorCatcher(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  if (!id) throw new AppError("No post id provided", 400);
  const removedPost = await postService.remove(id);
  if (!removedPost) throw new AppError(`Post with id ${id} not found`, 404);
  logger.warn(`Post with id ${id} removed`);
  res.status(204).send({
    status: "success",
    data: id,
  });
});

module.exports = {
  getPosts,
  getPostById,
  addPost,
  updatePost,
  removePost,
};
