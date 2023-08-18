import { Request, Response } from "express";
import { QueryObj, validateIds } from "../../../services/util/util.service";
import { NewPost, Post, PostRepostResult } from "../../../../../shared/interfaces/post.interface";
import postService from "../services/post/post.service";
import {
  asyncErrorCatcher,
  AppError,
  validatePatchRequestBody,
} from "../../../services/error/error.service";
import { deleteOne } from "../../../services/factory/factory.service";
import { PostModel } from "../models/post.model";
import repostService from "../services/repost/repost.service";
import likeService from "../services/like/like.service";
import bookmarkService from "../services/bookmark/bookmark.service";
import postStatsService from "../services/post-stats/post-stats.service";
import pollService from "../services/poll/poll.service";

const getPosts = asyncErrorCatcher(async (req: Request, res: Response): Promise<void> => {
  const queryString = req.query;
  const posts = (await postService.query(queryString as QueryObj)) as unknown as Post[];

  res.send({
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

  res.send({
    status: "success",
    data: post,
  });
});

const addPost = asyncErrorCatcher(async (req: Request, res: Response): Promise<void> => {
  const { loggedInUserId } = req;
  const post = req.body as unknown as NewPost;
  if (!loggedInUserId) throw new AppError("No logged in user id provided", 400);
  post.createdById = loggedInUserId;
  const savedPost = await postService.add(post);

  res.status(201).send({
    status: "success",
    data: savedPost,
  });
});

const addPostThread = asyncErrorCatcher(async (req: Request, res: Response): Promise<void> => {
  const { loggedInUserId } = req;
  const posts = req.body as unknown as NewPost[];

  if (!loggedInUserId) throw new AppError("No logged in user id provided", 400);
  posts.forEach(post => {
    post.createdById = loggedInUserId;
  });
  const post = await postService.addMany(posts);

  res.status(201).send({
    status: "success",
    data: post,
  });
});

const addReply = asyncErrorCatcher(async (req: Request, res: Response): Promise<void> => {
  const { loggedInUserId } = req;
  const post = req.body as unknown as NewPost;
  if (!loggedInUserId) throw new AppError("No logged in user id provided", 400);
  post.createdById = loggedInUserId;
  const replyAndUpdatedPost = await postService.addReply(post);

  res.status(201).send({
    status: "success",
    data: replyAndUpdatedPost,
  });
});

const repostPost = asyncErrorCatcher(async (req: Request, res: Response): Promise<void> => {
  const { loggedInUserId } = req;
  if (!loggedInUserId) throw new AppError("No logged in user id provided", 400);
  const { postId } = req.query;
  if (!postId) throw new AppError("No post id provided", 400);
  else if (typeof postId !== "string") throw new AppError("Post id must be a string", 400);
  const repostAndUpdatedPost = await repostService.add(postId, loggedInUserId);

  res.status(201).send({
    status: "success",
    data: repostAndUpdatedPost,
  });
});

const quotePost = asyncErrorCatcher(async (req: Request, res: Response): Promise<void> => {
  const { loggedInUserId } = req;
  if (!loggedInUserId) throw new AppError("No logged in user id provided", 400);
  const post = req.body as unknown as NewPost;
  if (!post.quotedPostId) throw new AppError("No quoted post id provided", 400);
  post.createdById = loggedInUserId;

  let data: Post | PostRepostResult | null = null;
  const isRepost = !post.text && !post.imgs?.length && !post.gif && !post.video;
  if (isRepost) {
    const repostAndUpdatedPost = await repostService.add(post.quotedPostId, loggedInUserId);
    data = repostAndUpdatedPost;
  } else {
    const savedPost = await postService.add(post);
    data = savedPost;
  }

  res.status(201).send({
    status: "success",
    data,
  });
});

const updatePost = asyncErrorCatcher(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const postToUpdate = req.body;
  validatePatchRequestBody(postToUpdate);
  const updatedPost = await postService.update(id, postToUpdate);
  if (!updatedPost) throw new AppError(`Post with id ${id} not found`, 404);
  res.send({
    status: "success",
    data: updatedPost,
  });
});

const removePost = deleteOne(PostModel);

const removeRepost = asyncErrorCatcher(async (req: Request, res: Response): Promise<void> => {
  const { loggedInUserId } = req;
  const { postId } = req.query;
  if (!loggedInUserId) throw new AppError("No logged in user id provided", 400);
  if (!postId) throw new AppError("No post id provided", 400);
  else if (typeof postId !== "string") throw new AppError("Post id must be a string", 400);

  const updatedPost = await repostService.remove(postId, loggedInUserId);

  res.json({
    status: "success",
    data: updatedPost,
  });
});

const savePollVote = asyncErrorCatcher(async (req: Request, res: Response): Promise<void> => {
  const { postId, optionIdx } = req.body;
  const { loggedInUserId } = req;

  if (!postId) throw new AppError("No post id provided", 400);
  if (!(typeof optionIdx === "number")) throw new AppError("No option index provided", 400);
  if (!loggedInUserId) throw new AppError("No logged in user id provided", 400);
  const pollOption = await pollService.setPollVote(postId, optionIdx, loggedInUserId);

  res.send({
    status: "success",
    data: pollOption,
  });
});

const addLike = asyncErrorCatcher(async (req: Request, res: Response): Promise<void> => {
  const { loggedInUserId } = req;
  const postId = req.params.id;
  if (!loggedInUserId) throw new AppError("No logged in user id provided", 400);
  if (!postId) throw new AppError("No post id provided", 400);
  const updatedPost = await likeService.add(postId, loggedInUserId);

  res.status(201).send({
    status: "success",
    data: updatedPost,
  });
});

const removeLike = asyncErrorCatcher(async (req: Request, res: Response): Promise<void> => {
  const { loggedInUserId } = req;
  const postId = req.params.id;
  if (!loggedInUserId) throw new AppError("No logged in user id provided", 400);
  if (!postId) throw new AppError("No post id provided", 400);
  const updatedPost = await likeService.remove(postId, loggedInUserId);

  res.send({
    status: "success",
    data: updatedPost,
  });
});

const getPostStats = asyncErrorCatcher(async (req: Request, res: Response): Promise<void> => {
  const postId = req.params.id;
  if (!postId) throw new AppError("No post id provided", 400);
  const postStats = await postStatsService.get(postId);

  res.send({
    status: "success",
    data: postStats,
  });
});

const createPostStatsWithView = asyncErrorCatcher(
  async (req: Request, res: Response): Promise<void> => {
    const postId = req.params.id;
    const { loggedInUserId } = req;
    if (!loggedInUserId) throw new AppError("No logged in user id provided", 400);
    if (!postId) throw new AppError("No post id provided", 400);
    const postStats = await postStatsService.create(postId, loggedInUserId);

    res.status(201).send({
      status: "success",
      data: postStats,
    });
  }
);

const updatePostStats = asyncErrorCatcher(async (req: Request, res: Response): Promise<void> => {
  const postId = req.params.id;
  const { loggedInUserId } = req;
  const stats = req.body;
  if (!loggedInUserId) throw new AppError("No logged in user id provided", 400);
  if (!postId) throw new AppError("No post id provided", 400);
  const postStats = await postStatsService.update(postId, loggedInUserId, stats);

  res.send({
    status: "success",
    data: postStats,
  });
});

const getBookmarkedPosts = asyncErrorCatcher(async (req: Request, res: Response): Promise<void> => {
  const { loggedInUserId } = req;
  validateIds({ id: loggedInUserId, entityName: "loggedInUser" });
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const bookmarkedPosts = await bookmarkService.get(loggedInUserId!);

  res.send({
    status: "success",
    requestedAt: new Date().toISOString(),
    results: bookmarkedPosts.length,
    data: bookmarkedPosts,
  });
});

const addBookmarkedPost = asyncErrorCatcher(async (req: Request, res: Response): Promise<void> => {
  const { loggedInUserId } = req;
  const postId = req.params.id;

  validateIds(
    { id: postId, entityName: "post" },
    { id: loggedInUserId, entityName: "loggedInUser" }
  );

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const updatedPost = await bookmarkService.add(postId, loggedInUserId!);

  res.status(201).send({
    status: "success",
    data: updatedPost,
  });
});

const removeBookmarkedPost = asyncErrorCatcher(
  async (req: Request, res: Response): Promise<void> => {
    const { loggedInUserId } = req;
    const postId = req.params.id;

    validateIds(
      { id: postId, entityName: "post" },
      { id: loggedInUserId, entityName: "loggedInUser" }
    );

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const updatedPost = await bookmarkService.remove(postId, loggedInUserId!);

    res.json({
      status: "success",
      data: updatedPost,
    });
  }
);

export {
  getPosts,
  getPostById,
  addPost,
  addPostThread,
  addReply,
  repostPost,
  quotePost,
  updatePost,
  removePost,
  removeRepost,
  savePollVote,
  addLike,
  removeLike,
  getPostStats,
  createPostStatsWithView,
  updatePostStats,
  getBookmarkedPosts,
  addBookmarkedPost,
  removeBookmarkedPost,
};
