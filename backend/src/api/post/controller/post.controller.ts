import { Request, Response } from "express";
import { QueryObj, validateIds } from "../../../services/util/util.service";
import {
  NewPost,
  Post,
  PostRepostResult,
  PostStats,
} from "../../../../../shared/interfaces/post.interface";
import postService from "../services/post/post.service";
import {
  asyncErrorCatcher,
  AppError,
  validatePatchRequestBody,
} from "../../../services/error/error.service";
import { deleteOne, getAll } from "../../../services/factory/factory.service";
import { PostModel } from "../models/post/post.model";
import postStatsService from "../services/post-stats/post-stats.service";
import { PromotionalPostModel } from "../models/post/promotional-post.model";
import { getLoggedInUserIdFromReq } from "../../../services/als.service";
import { BookmarkedPostModel, IBookmarkedPostDoc } from "../models/bookmark/bookmark-post.model";
import { PostLikeModel } from "../models/like/post-like.model";
import { IRepostDoc, RepostModel } from "../models/repost/repost.model";
import { PostStatsModel } from "../models/post-stats/post-stats.model";
import { PollVoteModel } from "../models/poll-vote/poll-vote.model";

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
  const post = await PostModel.findById(id);
  if (!post) throw new AppError(`Post with id ${id} not found`, 404);

  res.send({
    status: "success",
    data: post,
  });
});

const addPost = asyncErrorCatcher(async (req: Request, res: Response): Promise<void> => {
  const post = req.body as unknown as Partial<NewPost>;
  post.createdById = getLoggedInUserIdFromReq();

  const savedPost = await PostModel.create(post);

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

  const savedPosts = await PostModel.insertMany(posts, { ordered: true, rawResult: true });
  const postId = savedPosts.insertedIds[0];
  const post = await PostModel.findById(postId);

  res.status(201).send({
    status: "success",
    data: post,
  });
});

const addReply = asyncErrorCatcher(async (req: Request, res: Response): Promise<void> => {
  const loggedInUserId = getLoggedInUserIdFromReq();
  const postId = req.params.id;

  validateIds(
    { id: postId, entityName: "post" },
    { id: loggedInUserId, entityName: "loggedInUser" }
  );

  const reply = req.body as unknown as NewPost;
  reply.createdById = loggedInUserId;
  reply.parentPostId = postId;
  const savedReply = await PostModel.create(reply);
  const post = await PostModel.findById(postId);

  res.status(201).send({
    status: "success",
    data: {
      post,
      reply: savedReply,
    },
  });
});

const quotePost = asyncErrorCatcher(async (req: Request, res: Response): Promise<void> => {
  const loggedInUserId = getLoggedInUserIdFromReq();
  if (!loggedInUserId) throw new AppError("No logged in user id provided", 400);
  const post = req.body as unknown as NewPost;
  if (!post.quotedPostId) throw new AppError("No quoted post id provided", 400);
  post.createdById = loggedInUserId;

  let data: Post | PostRepostResult;
  const isRepost = !post.text && !post.imgs?.length && !post.gif && !post.video;
  if (isRepost) {
    data = await RepostModel.create({
      postId: post.quotedPostId,
      repostOwnerId: loggedInUserId,
    });
  } else {
    data = (await PostModel.create(post)) as unknown as Post;
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

  const updatedPost = await PostModel.findOneAndUpdate(
    {
      _id: id,
      createdById: getLoggedInUserIdFromReq(),
    },
    postToUpdate,
    {
      new: true,
      runValidators: true,
    }
  ).exec();

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
  const postId = req.params.id;
  const loggedInUserId = getLoggedInUserIdFromReq();
  const { optionIdx } = req.body;

  validateIds(
    { id: postId, entityName: "post" },
    { id: loggedInUserId, entityName: "loggedInUser" }
  );

  if (!(typeof optionIdx === "number")) throw new AppError("No option index provided", 400);

  await PollVoteModel.create({
    postId,
    optionIdx,
    userId: loggedInUserId,
  });

  const post = await PostModel.findById(postId);

  res.send({
    status: "success",
    data: post,
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

const createPostStats = asyncErrorCatcher(async (req: Request, res: Response): Promise<void> => {
  const postId = req.params.id;
  const postStats: Partial<PostStats> = req.body;
  const loggedInUserId = getLoggedInUserIdFromReq();

  validateIds(
    { id: postId, entityName: "post" },
    { id: loggedInUserId, entityName: "loggedInUser" }
  );

  await PostStatsModel.create({
    postId,
    userId: loggedInUserId,
    ...postStats,
  });

  res.status(204).send({
    status: "success",
    data: null,
  });
});

const updatePostStats = asyncErrorCatcher(async (req: Request, res: Response): Promise<void> => {
  const postId = req.params.id;
  const loggedInUserId = getLoggedInUserIdFromReq();
  const stats = req.body;
  if (!loggedInUserId) throw new AppError("No logged in user id provided", 400);
  if (!postId) throw new AppError("No post id provided", 400);
  await PostStatsModel.findOneAndUpdate(
    {
      postId,
      userId: loggedInUserId,
    },
    stats
  );

  res.status(204).send({
    status: "success",
    data: null,
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
  const savedPost = await PromotionalPostModel.create(post);

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
  createPostStats,
  updatePostStats,
  getBookmarkedPosts,
  addBookmarkedPost,
  removeBookmarkedPost,
  getPromotionalPosts,
  addPromotionalPost,
};
