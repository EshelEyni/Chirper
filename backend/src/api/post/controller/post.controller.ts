import { Request, Response } from "express";
import { QueryObj, validateIds } from "../../../services/util/util.service";
import { NewPost, Post, PostRepostResult } from "../../../../../shared/interfaces/post.interface";
import postService from "../services/post/post.service";
import {
  asyncErrorCatcher,
  AppError,
  validatePatchRequestBody,
} from "../../../services/error/error.service";
import { deleteOne, getAll } from "../../../services/factory/factory.service";
import { PostModel } from "../models/post/post.model";
import postStatsService from "../services/post-stats/post-stats.service";
import pollService from "../services/poll/poll.service";
import { PromotionalPostModel } from "../models/post/promitional-post.model";
import promotionalPostsService from "../services/promotional-posts/promotional-posts.service";
import { getLoggedInUserIdFromReq } from "../../../services/als.service";
import { BookmarkedPostModel, IBookmarkedPostDoc } from "../models/bookmark/bookmark-post.model";
import { PostLikeModel } from "../models/like/post-like.model";
import { IRepostDoc, RepostModel } from "../models/repost/repost.model";

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
  const loggedInUserId = getLoggedInUserIdFromReq();
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
  const loggedInUserId = getLoggedInUserIdFromReq();
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
  const loggedInUserId = getLoggedInUserIdFromReq();
  const post = req.body as unknown as NewPost;
  if (!loggedInUserId) throw new AppError("No logged in user id provided", 400);
  post.createdById = loggedInUserId;
  const replyAndUpdatedPost = await postService.addReply(post);

  res.status(201).send({
    status: "success",
    data: replyAndUpdatedPost,
  });
});

const quotePost = asyncErrorCatcher(async (req: Request, res: Response): Promise<void> => {
  const loggedInUserId = getLoggedInUserIdFromReq();
  if (!loggedInUserId) throw new AppError("No logged in user id provided", 400);
  const post = req.body as unknown as NewPost;
  if (!post.quotedPostId) throw new AppError("No quoted post id provided", 400);
  post.createdById = loggedInUserId;

  let data: Post | PostRepostResult | null = null;
  const isRepost = !post.text && !post.imgs?.length && !post.gif && !post.video;
  if (isRepost) {
    data = await RepostModel.create({
      postId: post.quotedPostId,
      repostOwnerId: loggedInUserId,
    });
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

const repostPost = asyncErrorCatcher(async (req: Request, res: Response): Promise<void> => {
  const loggedInUserId = getLoggedInUserIdFromReq();
  const postId = req.params.id;

  validateIds(
    { id: postId, entityName: "post" },
    { id: loggedInUserId, entityName: "loggedInUser" }
  );

  // NOTE: RepostModel.create() returns a RepostDoc, and it is parsed by express
  // as a PostRepostResult, that's why we need to cast it to IRepostDoc for clarity and type safety
  // you can't access the repost property directly, because it is created by the toObject() || toJSON() methods

  const data = (await RepostModel.create({
    postId,
    repostOwnerId: loggedInUserId,
  })) as unknown as IRepostDoc;

  res.status(201).send({
    status: "success",
    data,
  });
});

const removeRepost = asyncErrorCatcher(async (req: Request, res: Response): Promise<void> => {
  const loggedInUserId = getLoggedInUserIdFromReq();
  const postId = req.params.id;

  validateIds(
    { id: postId, entityName: "post" },
    { id: loggedInUserId, entityName: "loggedInUser" }
  );

  const result = (await RepostModel.findOneAndDelete({
    postId,
    repostOwnerId: loggedInUserId,
  })) as unknown as IRepostDoc;

  res.send({
    status: "success",
    data: result?.post,
  });
});

const savePollVote = asyncErrorCatcher(async (req: Request, res: Response): Promise<void> => {
  const { postId, optionIdx } = req.body;
  const loggedInUserId = getLoggedInUserIdFromReq();

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
  const loggedInUserId = getLoggedInUserIdFromReq();
  const postId = req.params.id;

  validateIds(
    { id: postId, entityName: "post" },
    { id: loggedInUserId, entityName: "loggedInUser" }
  );

  const updatedPost = (
    await PostLikeModel.create({
      postId,
      userId: loggedInUserId,
    })
  ).post;

  res.status(201).send({
    status: "success",
    data: updatedPost,
  });
});

const removeLike = asyncErrorCatcher(async (req: Request, res: Response): Promise<void> => {
  const loggedInUserId = getLoggedInUserIdFromReq();
  const postId = req.params.id;

  validateIds(
    { id: postId, entityName: "post" },
    { id: loggedInUserId, entityName: "loggedInUser" }
  );

  const updatedPost = (
    await PostLikeModel.findOneAndDelete({
      postId,
      userId: loggedInUserId,
    })
  )?.post;

  if (!updatedPost) throw new AppError("Post is not liked", 404);

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
    const loggedInUserId = getLoggedInUserIdFromReq();
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
  const loggedInUserId = getLoggedInUserIdFromReq();
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
  const loggedInUserId = getLoggedInUserIdFromReq();
  validateIds({ id: loggedInUserId, entityName: "loggedInUser" });

  const bookmarkedPosts = (
    await BookmarkedPostModel.find({
      bookmarkOwnerId: loggedInUserId,
    })
  ).map((doc: IBookmarkedPostDoc) => doc.post);

  res.send({
    status: "success",
    requestedAt: new Date().toISOString(),
    results: bookmarkedPosts.length,
    data: bookmarkedPosts,
  });
});

const addBookmarkedPost = asyncErrorCatcher(async (req: Request, res: Response): Promise<void> => {
  const loggedInUserId = getLoggedInUserIdFromReq();
  const postId = req.params.id;

  validateIds(
    { id: postId, entityName: "post" },
    { id: loggedInUserId, entityName: "loggedInUser" }
  );

  const updatedPost = (
    await BookmarkedPostModel.create({
      postId,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      bookmarkOwnerId: loggedInUserId!,
    })
  ).post;

  res.status(201).send({
    status: "success",
    data: updatedPost,
  });
});

const removeBookmarkedPost = asyncErrorCatcher(
  async (req: Request, res: Response): Promise<void> => {
    const loggedInUserId = getLoggedInUserIdFromReq();
    const postId = req.params.id;

    validateIds(
      { id: postId, entityName: "post" },
      { id: loggedInUserId, entityName: "loggedInUser" }
    );

    const updatedPost = (
      await BookmarkedPostModel.findOneAndDelete({
        postId,
        bookmarkOwnerId: loggedInUserId,
      })
    )?.post;

    if (!updatedPost) throw new AppError("Post is not bookmarked", 404);

    res.send({
      status: "success",
      data: updatedPost,
    });
  }
);

const getPromotionalPosts = getAll(PromotionalPostModel);

const addPromotionalPost = asyncErrorCatcher(async (req: Request, res: Response): Promise<void> => {
  const loggedInUserId = getLoggedInUserIdFromReq();
  const post = req.body as unknown as NewPost;
  if (!loggedInUserId) throw new AppError("No logged in user id provided", 400);
  post.createdById = loggedInUserId;
  const savedPost = await promotionalPostsService.add(post);

  res.status(201).send({
    status: "success",
    data: savedPost,
  });
});

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
  getPromotionalPosts,
  addPromotionalPost,
};
