import {
  Post,
  PollOption,
  NewPost,
  PostReplyResult,
  PostRepostResult,
  PostStatsBody,
} from "../../../../shared/interfaces/post.interface";
import { APIFeatures, QueryObj, queryEntityExists } from "../../services/util/util.service";
import { PostModel } from "./post.model";
import { RepostModel } from "./repost.model";
import { PollResultModel } from "./poll.model";
import { asyncLocalStorage } from "../../services/als.service";
import { alStoreType } from "../../middlewares/setupAls.middleware";
import mongoose, { Document } from "mongoose";
import { AppError } from "../../services/error/error.service";
import { logger } from "../../services/logger/logger.service";
import { PostLikeModel } from "./post-like.model";
import { PostStatsModel } from "./post-stats.model";
import { BookmarkedPostModel } from "./bookmark-post.model";
import { ObjectId } from "mongodb";
import userService from "../user/user.service";
import { User } from "../../../../shared/interfaces/user.interface";

async function query(queryString: QueryObj): Promise<Post[]> {
  const features = new APIFeatures(PostModel.find(), queryString)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const postDocs = (await features.getQuery().exec()) as unknown as Document[];
  let posts = postDocs.map(post => post.toObject()) as unknown as Post[];

  let repostDocs = await RepostModel.find({})
    .populate("post")
    .populate(_populateRepostedBy())
    .exec();

  // TODO: refactor this, can be in one map function
  repostDocs = repostDocs.map(doc => doc.toObject());

  const reposts = repostDocs.map((doc: any) => {
    const { createdAt, updatedAt, post, repostedBy } = doc;

    return {
      ...post,
      repostedBy,
      createdAt,
      updatedAt,
    };
  });

  posts = [...posts, ...reposts]
    .filter(post => post.createdBy !== null)
    .sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const setLoggedinUserActionStatePrms = posts.map(async post => {
    await _setLoggedinUserActionState(post);
  });
  await Promise.all(setLoggedinUserActionStatePrms);

  const setIsFollowingPrms = posts.map(async post => {
    await userService.populateIsFollowing(post.createdBy as unknown as User);
  });
  await Promise.all(setIsFollowingPrms);

  if (posts.length > 0) {
    await _getLoggedinUserPollDetails(...(posts as unknown as Post[]));
  }
  return posts as unknown as Post[];
}

async function getById(postId: string): Promise<Post | null> {
  const postDoc = await PostModel.findById(postId).exec();
  if (!postDoc) return null;
  const post = postDoc.toObject() as unknown as Post;
  await _getLoggedinUserPollDetails(post);
  await _setLoggedinUserActionState(post);
  await userService.populateIsFollowing(post.createdBy as unknown as User);
  return post;
}

async function add(post: NewPost): Promise<Post> {
  const savedPost = await new PostModel(post).save();
  const postDoc = await PostModel.findById(savedPost.id).exec();
  if (!postDoc) throw new AppError("post not found", 404);
  const populatedPost = postDoc.toObject() as unknown as Post;
  await _setLoggedinUserActionState(populatedPost, { isDefault: true });
  await userService.populateIsFollowing(populatedPost.createdBy as unknown as User);
  return populatedPost as unknown as Post;
}

async function addMany(posts: NewPost[]): Promise<Post> {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const savedThread: Post[] = [];
    for (let i = 0; i < posts.length; i++) {
      const currPost = posts[i];
      if (i === 0) currPost.repliesCount = 1;
      else currPost.previousThreadPostId = savedThread[i - 1].id;

      const savedPost = await new PostModel(currPost).save({ session });
      savedThread.push(savedPost as unknown as Post);
    }
    await session.commitTransaction();
    const [originalPost] = savedThread;
    const postDoc = await PostModel.findById(originalPost.id).exec();
    if (!postDoc) throw new AppError("post not found", 404);
    const populatedPost = postDoc.toObject() as unknown as Post;
    await _setLoggedinUserActionState(populatedPost, { isDefault: true });
    populatedPost.createdBy.isFollowing = false;
    return populatedPost as unknown as Post;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}

async function addReply(replyPost: NewPost): Promise<PostReplyResult> {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const savedReply = await new PostModel(replyPost).save({ session });
    const repliedToPostDoc = await PostModel.findByIdAndUpdate(
      replyPost.repliedPostDetails?.at(-1)?.postId,
      { $inc: { repliesCount: 1 } },
      { session, new: true }
    );
    if (!repliedToPostDoc) throw new AppError("post not found", 404);
    await session.commitTransaction();
    const updatedPost = repliedToPostDoc.toObject() as unknown as Post;
    await _setLoggedinUserActionState(updatedPost);
    await userService.populateIsFollowing(updatedPost.createdBy as unknown as User);

    const replyDoc = await PostModel.findById(savedReply.id).exec();
    if (!replyDoc) throw new AppError("reply post not found", 404);
    const reply = replyDoc.toObject() as unknown as Post;
    await _setLoggedinUserActionState(reply, { isDefault: true });
    reply.createdBy.isFollowing = false;
    return { updatedPost, reply };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}

async function repost(postId: string, loggedinUserId: string): Promise<PostRepostResult> {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const savedRepost = await new RepostModel({
      postId,
      repostOwnerId: loggedinUserId,
    }).save({ session });

    const repostedPostDoc = await PostModel.findByIdAndUpdate(
      postId,
      { $inc: { repostsCount: 1 } },
      { session, new: true }
    );
    if (!repostedPostDoc) throw new AppError("post not found", 404);
    await session.commitTransaction();
    const updatedPost = repostedPostDoc.toObject() as unknown as Post;
    await _setLoggedinUserActionState(updatedPost);
    await userService.populateIsFollowing(updatedPost.createdBy as unknown as User);

    const repostDoc = await RepostModel.findById(savedRepost.id)
      .populate("post")
      .populate(_populateRepostedBy())
      .exec();

    if (!repostDoc) throw new AppError("repost not found", 404);
    const repostObj = repostDoc.toObject() as unknown as any;

    const { createdAt, updatedAt, post, repostedBy } = repostObj;
    post.createdBy.isFollowing = false;
    const repost = {
      ...post,
      createdAt,
      updatedAt,
      repostedBy,
    } as unknown as Post;

    await _setLoggedinUserActionState(repost);

    return { updatedPost, repost };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}

async function update(id: string, post: Post): Promise<Post> {
  const postDoc = await PostModel.findByIdAndUpdate(id, post, {
    new: true,
    runValidators: true,
  }).exec();

  if (!postDoc) throw new AppError("post not found", 404);
  const updatedPost = postDoc.toObject() as unknown as Post;
  await _getLoggedinUserPollDetails(updatedPost);
  await _setLoggedinUserActionState(updatedPost);
  await userService.populateIsFollowing(updatedPost.createdBy as unknown as User);
  return updatedPost;
}

async function remove(postId: string): Promise<Post> {
  const removedPost = await PostModel.findByIdAndRemove(postId);
  return removedPost as unknown as Post;
}

async function removeRepost(postId: string, loggedinUserId: string): Promise<Post> {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await RepostModel.findOneAndRemove({
      postId,
      repostOwnerId: loggedinUserId,
    }).session(session);

    const postDoc = await PostModel.findByIdAndUpdate(
      postId,
      { $inc: { repostsCount: -1 } },
      { session, new: true }
    );
    if (!postDoc) throw new AppError("post not found", 404);
    await session.commitTransaction();

    const updatedPost = postDoc.toObject() as unknown as Post;
    await _setLoggedinUserActionState(updatedPost);
    await userService.populateIsFollowing(updatedPost.createdBy as unknown as User);

    logger.warn(`Deleted repost of Post With ${postId} by user ${loggedinUserId}`);

    return updatedPost;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}

async function setPollVote(postId: string, optionIdx: number, userId: string): Promise<PollOption> {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const post = await PostModel.findById(postId).session(session);
    if (!post) throw new AppError("post not found", 404);
    const { poll } = post;
    if (!poll) throw new AppError("post has no poll", 400);

    _checkPollExperation(post.createdAt.getTime(), poll.length);

    const option = poll.options[optionIdx];
    if (!option) throw new AppError("option not found", 404);
    option.voteCount++;
    await post.save({ session });

    const vote = {
      postId,
      optionIdx,
      userId,
    };
    const userVote = await PollResultModel.findOne(vote).session(session);
    if (userVote) throw new AppError("user already voted", 400);
    await PollResultModel.create([vote], { session });

    await session.commitTransaction();

    const { text, voteCount } = option;
    return { text, voteCount, isLoggedinUserVoted: true };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}

async function addLike(postId: string, userId: string): Promise<Post> {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await new PostLikeModel({
      postId,
      userId,
    }).save({ session });

    const postDoc = await PostModel.findByIdAndUpdate(
      postId,
      { $inc: { likesCount: 1 } },
      { session, new: true }
    );
    if (!postDoc) throw new AppError("post not found", 404);
    await session.commitTransaction();

    const updatedPost = postDoc.toObject() as unknown as Post;
    await _setLoggedinUserActionState(updatedPost);
    await userService.populateIsFollowing(updatedPost.createdBy as unknown as User);

    return updatedPost;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}

async function removeLike(postId: string, userId: string): Promise<Post> {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await PostLikeModel.findOneAndRemove({
      postId,
      userId,
    }).session(session);

    const postDoc = await PostModel.findByIdAndUpdate(
      postId,
      { $inc: { likesCount: -1 } },
      { session, new: true }
    );

    if (!postDoc) throw new AppError("post not found", 404);
    await session.commitTransaction();

    const updatedPost = postDoc.toObject() as unknown as Post;
    await _setLoggedinUserActionState(updatedPost);
    await userService.populateIsFollowing(updatedPost.createdBy as unknown as User);

    return updatedPost;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}

async function getPostStats(postId: string): Promise<PostStatsBody> {
  const likesCount = await PostLikeModel.countDocuments({ postId });
  const repostCount = await RepostModel.countDocuments({ postId });
  const repliesCount = await PostModel.countDocuments({ previousThreadPostId: postId });

  const postStatsAggregation = await PostStatsModel.aggregate([
    {
      $match: {
        postId: new ObjectId(postId),
      },
    },
    {
      $group: {
        _id: null,
        isViewedCount: { $sum: { $cond: ["$isViewed", 1, 0] } },
        isDetailedViewedCount: { $sum: { $cond: ["$isDetailedViewed", 1, 0] } },
        isProfileViewedCount: { $sum: { $cond: ["$isProfileViewed", 1, 0] } },
        isFollowedFromPostCount: { $sum: { $cond: ["$isFollowedFromPost", 1, 0] } },
        isHashTagClickedCount: { $sum: { $cond: ["$isHashTagClicked", 1, 0] } },
        isLinkClickedCount: { $sum: { $cond: ["$isLinkClicked", 1, 0] } },
        isPostLinkCopiedCount: { $sum: { $cond: ["$isPostLinkCopied", 1, 0] } },
        isPostSharedCount: { $sum: { $cond: ["$isPostShared", 1, 0] } },
        isPostSendInMessageCount: { $sum: { $cond: ["$isPostSendInMessage", 1, 0] } },
        isPostBookmarkedCount: { $sum: { $cond: ["$isPostBookmarked", 1, 0] } },
      },
    },
  ]);

  const [postStats] = postStatsAggregation;
  delete postStats._id;
  const postStatsSum = Object.values(postStats)
    .filter((value): value is number => typeof value === "number")
    .reduce((a: number, b: number): number => a + b, 0);

  const engagementCount = postStatsSum + likesCount + repostCount + repliesCount;

  return {
    likesCount,
    repostCount,
    repliesCount,
    ...postStats,
    engagementCount,
  };
}

async function createPostStatsWithView(postId: string, userId: string): Promise<PostStatsBody> {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const postStats = await new PostStatsModel({
      postId,
      userId,
    }).save({ session });
    await PostModel.findByIdAndUpdate(postId, { $inc: { viewsCount: 1 } }, { session });
    await session.commitTransaction();
    return postStats as unknown as PostStatsBody;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}

async function updatePostStats(
  postId: string,
  userId: string,
  stats: Partial<PostStatsBody>
): Promise<PostStatsBody> {
  return (await PostStatsModel.findOneAndUpdate({ postId, userId }, stats, {
    new: true,
  })) as unknown as PostStatsBody;
}

async function getBookmarkedPosts(loggedinUserId: string): Promise<Post[]> {
  const bookmarkedPostsDocs = await BookmarkedPostModel.find({
    bookmarkOwnerId: loggedinUserId,
  }).exec();
  const prms = bookmarkedPostsDocs.map(async doc => {
    // TODO: defince type correctly
    const obj = doc.toObject() as unknown as { post: Post };
    const { post } = obj;
    await _setLoggedinUserActionState(post);
    await userService.populateIsFollowing(post.createdBy as unknown as User);
    return post;
  });
  const bookmarkedPosts = await Promise.all(prms);
  return bookmarkedPosts as unknown as Post[];
}

async function addBookmarkedPost(postId: string, loggedinUserId: string): Promise<Post> {
  await new BookmarkedPostModel({
    postId,
    bookmarkOwnerId: loggedinUserId,
  }).save();
  const postDoc = await PostModel.findById(postId);
  if (!postDoc) throw new AppError("post not found", 404);
  const updatedPost = postDoc.toObject() as unknown as Post;
  await _setLoggedinUserActionState(updatedPost);
  await userService.populateIsFollowing(updatedPost.createdBy as unknown as User);

  return updatedPost;
}

async function removeBookmarkedPost(postId: string, loggedinUserId: string): Promise<Post> {
  await BookmarkedPostModel.findOneAndRemove({
    postId,
    bookmarkOwnerId: loggedinUserId,
  });

  const postDoc = await PostModel.findById(postId);
  if (!postDoc) throw new AppError("post not found", 404);
  const updatedPost = postDoc.toObject() as unknown as Post;
  await _setLoggedinUserActionState(updatedPost);
  await userService.populateIsFollowing(updatedPost.createdBy as unknown as User);

  return updatedPost;
}

async function _getLoggedinUserPollDetails(...posts: Post[]) {
  const store = asyncLocalStorage.getStore() as alStoreType;
  const loggedinUserId = store?.loggedinUserId;
  const isNoPolls = posts.every(post => !post.poll);
  const isValidId = mongoose.Types.ObjectId.isValid(loggedinUserId);
  if (!isValidId || isNoPolls) return;

  const pollResults = await PollResultModel.find({
    userId: new ObjectId(loggedinUserId),
    postId: { $in: posts.map(post => post.id) },
  }).exec();

  // if (!pollResults.length) return;
  const pollResultsMap = new Map(pollResults.map(result => [result.postId.toString(), result]));

  for (const post of posts) {
    if (!post.poll) continue;
    const isLoggedinUserPoll = post.createdBy.id === loggedinUserId;
    if (isLoggedinUserPoll) post.poll.isVotingOff = true;
    const pollResult = pollResultsMap.get(post.id.toString());
    if (!pollResult) continue;
    post.poll.options[pollResult.optionIdx].isLoggedinUserVoted = true;
    post.poll.isVotingOff = true;
  }
}
async function _setLoggedinUserActionState(post: Post, { isDefault = false } = {}) {
  const store = asyncLocalStorage.getStore() as alStoreType;
  const loggedinUserId = store?.loggedinUserId;

  const defaultState = {
    isLiked: false,
    isReposted: false,
    isViewed: false,
    isDetailedViewed: false,
    isProfileViewed: false,
    isFollowedFromPost: false,
    isHashTagClicked: false,
    isLinkClicked: false,
    isBookmarked: false,
    isPostLinkCopied: false,
    isPostShared: false,
    isPostSendInMessage: false,
    isPostBookmarked: false,
  };

  post.loggedinUserActionState = defaultState;

  const isValidId = mongoose.Types.ObjectId.isValid(loggedinUserId);
  if (isDefault || !isValidId) return;

  const postId = new ObjectId(post.id);
  const userId = new ObjectId(loggedinUserId);

  const [isReposted, isLiked, isBookmarked] = await Promise.all([
    queryEntityExists(RepostModel, { postId, repostOwnerId: userId }),
    queryEntityExists(PostLikeModel, { postId, userId }),
    queryEntityExists(BookmarkedPostModel, { postId, bookmarkOwnerId: userId }),
  ]);

  const postStats = (await PostStatsModel.findOne({ postId, userId })) as unknown as PostStatsBody;

  const additionalState = postStats
    ? {
        isViewed: postStats.isViewed,
        isDetailedViewed: postStats.isDetailedViewed,
        isProfileViewed: postStats.isProfileViewed,
        isFollowedFromPost: postStats.isFollowedFromPost,
        isHashTagClicked: postStats.isHashTagClicked,
        isLinkClicked: postStats.isLinkClicked,
        isPostLinkCopied: postStats.isPostLinkCopied,
        isPostShared: postStats.isPostShared,
        isPostSendInMessage: postStats.isPostSendInMessage,
        isPostBookmarked: postStats.isPostBookmarked,
      }
    : {};

  post.loggedinUserActionState = {
    ...defaultState,
    isReposted,
    isLiked,
    isBookmarked,
    ...additionalState,
  };
}

function _checkPollExperation(
  postTime: number,
  pollLength: { days: number; hours: number; minutes: number }
) {
  const { days, hours, minutes } = pollLength;
  const currTime = Date.now();
  const pollEndTime =
    postTime + days * 24 * 60 * 60 * 1000 + hours * 60 * 60 * 1000 + minutes * 60 * 1000;

  if (postTime > currTime) throw new AppError("poll not started yet", 400);
  if (pollEndTime < currTime) throw new AppError("poll ended", 400);
}

function _populateRepostedBy() {
  return {
    path: "repostedBy",
    select: {
      _id: 1,
      username: 1,
      fullname: 1,
    },
  };
}

export default {
  query,
  getById,
  add,
  addMany,
  addReply,
  repost,
  update,
  remove,
  removeRepost,
  setPollVote,
  addLike,
  removeLike,
  getPostStats,
  createPostStatsWithView,
  updatePostStats,
  getBookmarkedPosts,
  addBookmarkedPost,
  removeBookmarkedPost,
};
