import { Request, Response } from "express";
import { QueryString } from "../../services/util.service";
import { NewPost, Post } from "../../../../shared/interfaces/post.interface";
import postService from "./post.service";
import {
  asyncErrorCatcher,
  AppError,
  validatePatchRequestBody,
} from "../../services/error.service";
import factory from "../../services/factory.service";
import { PostModel } from "./post.model";

const getPosts = asyncErrorCatcher(async (req: Request, res: Response): Promise<void> => {
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
  const post = await postService.getById(id);
  if (!post) throw new AppError(`Post with id ${id} not found`, 404);

  res.status(200).send({
    status: "success",
    data: post,
  });
});

const addPost = asyncErrorCatcher(async (req: Request, res: Response): Promise<void> => {
  const { loggedinUserId } = req;
  const post = req.body as unknown as NewPost;
  if (!loggedinUserId) throw new AppError("No logged in user id provided", 400);
  post.createdById = loggedinUserId;
  const savedPost = await postService.add(post);

  res.status(201).send({
    status: "success",
    data: savedPost,
  });
});

const addPostThread = asyncErrorCatcher(async (req: Request, res: Response): Promise<void> => {
  const { loggedinUserId } = req;
  const posts = req.body as unknown as NewPost[];

  if (!loggedinUserId) throw new AppError("No logged in user id provided", 400);
  posts.forEach(post => {
    post.createdById = loggedinUserId;
  });
  const post = await postService.addMany(posts);

  res.status(201).send({
    status: "success",
    data: post,
  });
});

const repostPost = asyncErrorCatcher(async (req: Request, res: Response): Promise<void> => {
  const { loggedinUserId } = req;
  if (!loggedinUserId) throw new AppError("No logged in user id provided", 400);
  const { postId } = req.query;
  if (!postId) throw new AppError("No post id provided", 400);
  else if (typeof postId !== "string") throw new AppError("Post id must be a string", 400);
  const post = await postService.repost(postId, loggedinUserId);

  res.status(201).send({
    status: "success",
    data: post,
  });
});

const quotePost = asyncErrorCatcher(async (req: Request, res: Response): Promise<void> => {
  const { loggedinUserId } = req;
  if (!loggedinUserId) throw new AppError("No logged in user id provided", 400);
  const post = req.body as unknown as NewPost;
  post.createdById = loggedinUserId;

  let savedPost: Post | null = null;
  const isRepost = !post.text && !post.imgs?.length && !post.gif && !post.video;
  if (isRepost) {
    try {
      if (!post.quotedPostId) throw new AppError("No quoted post id provided", 400);
      savedPost = await postService.repost(post.quotedPostId, loggedinUserId);
    } catch (error) {
      savedPost = null;
    }
  } else {
    savedPost = await postService.add(post);
  }

  res.status(201).send({
    status: "success",
    data: savedPost,
  });
});

const updatePost = asyncErrorCatcher(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const postToUpdate = req.body;
  validatePatchRequestBody(postToUpdate);
  const updatedPost = await postService.update(id, postToUpdate);
  if (!updatedPost) throw new AppError(`Post with id ${id} not found`, 404);
  res.status(200).send({
    status: "success",
    data: updatedPost,
  });
});

const removePost = factory.deleteOne(PostModel);

const removeRepost = asyncErrorCatcher(async (req: Request, res: Response): Promise<void> => {
  const { loggedinUserId } = req;
  const { postId } = req.query;
  if (!loggedinUserId) throw new AppError("No logged in user id provided", 400);
  if (!postId) throw new AppError("No post id provided", 400);
  else if (typeof postId !== "string") throw new AppError("Post id must be a string", 400);

  await postService.removeRepost(postId, loggedinUserId);

  res.status(204).json({
    status: "success",
    data: null,
  });
});

const savePollVote = asyncErrorCatcher(async (req: Request, res: Response): Promise<void> => {
  const { postId, optionIdx } = req.body;
  const { loggedinUserId } = req;

  if (!postId) throw new AppError("No post id provided", 400);
  if (!(typeof optionIdx === "number")) throw new AppError("No option index provided", 400);
  if (!loggedinUserId) throw new AppError("No logged in user id provided", 400);
  const pollOption = await postService.setPollVote(postId, optionIdx, loggedinUserId);

  res.status(200).send({
    status: "success",
    data: pollOption,
  });
});

export {
  getPosts,
  getPostById,
  addPost,
  addPostThread,
  repostPost,
  quotePost,
  updatePost,
  removePost,
  removeRepost,
  savePollVote,
};
