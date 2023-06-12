import {
  Post,
  PollOption,
  NewPost,
  PostReplyResult,
} from "../../../../shared/interfaces/post.interface";
import { QueryString } from "../../services/util.service.js";
import { PostModel } from "./post.model";
import { RepostModel } from "./repost.model";
import { PollResultModel } from "./poll.model";
import { APIFeatures } from "../../services/util.service";
import { asyncLocalStorage } from "../../services/als.service";
import { alStoreType } from "../../middlewares/setupAls.middleware";
import mongoose from "mongoose";
import { AppError } from "../../services/error.service";
import { Document } from "mongoose";
import { logger } from "../../services/logger.service";
import { PostLikeModel } from "./post-like.model";

async function query(queryString: QueryString): Promise<Post[]> {
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
  repostDocs = repostDocs.map(doc => doc.toObject());

  const reposts = repostDocs.map((doc: any) => {
    const { createdAt, updatedAt, post, repostedBy } = doc;
    post.createdAt = createdAt;
    post.updatedAt = updatedAt;
    return {
      ...post,
      repostedBy,
    };
  });

  posts = [...posts, ...reposts]
    .sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    })
    .filter(post => post.createdBy !== null);

  const setLoggedinUserActionStatePrms = posts.map(async post => {
    await _setLoggedinUserActionState(post);
  });

  await Promise.all(setLoggedinUserActionStatePrms);

  if (posts.length > 0) {
    await _populateUserPollVotes(...(posts as unknown as Post[]));
  }
  return posts as unknown as Post[];
}

async function getById(postId: string): Promise<Post | null> {
  const postDoc = await PostModel.findById(postId).exec();
  if (!postDoc) return null;
  const post = postDoc.toObject() as unknown as Post;
  await _populateUserPollVotes(post);
  await _setLoggedinUserActionState(post);
  return post;
}

async function add(post: NewPost): Promise<Post> {
  const savedPost = await new PostModel(post).save();
  const postDoc = await PostModel.findById(savedPost.id).exec();
  if (!postDoc) throw new AppError("post not found", 404);
  const populatedPost = postDoc.toObject() as unknown as Post;
  await _setLoggedinUserActionState(populatedPost, { isDefault: true });
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
    const originalPost = savedThread[0];
    const postDoc = await PostModel.findById(originalPost.id).exec();
    if (!postDoc) throw new AppError("post not found", 404);
    const populatedPost = postDoc.toObject() as unknown as Post;
    await _setLoggedinUserActionState(populatedPost, { isDefault: true });
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

    const postDoc = await PostModel.findById(savedReply.id).exec();
    if (!postDoc) throw new AppError("post not found", 404);
    const reply = postDoc.toObject() as unknown as Post;
    await _setLoggedinUserActionState(reply, { isDefault: true });
    return { updatedPost, reply };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}

async function repost(postId: string, loggedinUserId: string): Promise<Post> {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const savedRepost = await new RepostModel({
      postId,
      repostOwnerId: loggedinUserId,
    }).save({ session });

    await PostModel.updateOne({ _id: postId }, { $inc: { repostsCount: 1 } }, { session });
    await session.commitTransaction();

    let doc = (await RepostModel.find({ _id: savedRepost.id })
      .populate("post")
      .populate(_populateRepostedBy())
      .exec()) as unknown as any;

    doc = doc[0].toObject();

    const { createdAt, updatedAt, post, repostedBy } = doc;

    post.createdAt = createdAt;
    post.updatedAt = updatedAt;
    const repost = {
      ...post,
      repostedBy,
    } as unknown as Post;

    await _setLoggedinUserActionState(repost);

    return repost;
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
  await _populateUserPollVotes(updatedPost);
  await _setLoggedinUserActionState(updatedPost);
  return updatedPost;
}

async function remove(postId: string): Promise<Post> {
  const removedPost = await PostModel.findByIdAndRemove(postId);
  return removedPost as unknown as Post;
}

async function removeRepost(postId: string, loggedinUserId: string): Promise<void> {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await RepostModel.findOneAndRemove({
      postId,
      repostOwnerId: loggedinUserId,
    }).session(session);

    await PostModel.updateOne({ _id: postId }, { $inc: { repostsCount: -1 } }).session(session);

    await session.commitTransaction();
    logger.warn(`Deleted repost of Post With ${postId} by user ${loggedinUserId}`);
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

async function addLike(postId: string, userId: string): Promise<void> {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await new PostLikeModel({
      postId,
      userId,
    }).save({ session });

    await PostModel.updateOne({ _id: postId }, { $inc: { likesCount: 1 } }).session(session);
    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}

async function removeLike(postId: string, userId: string): Promise<void> {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await PostLikeModel.findOneAndRemove({
      postId,
      userId,
    }).session(session);

    await PostModel.updateOne({ _id: postId }, { $inc: { likesCount: -1 } }).session(session);
    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}

async function _populateUserPollVotes(...posts: Post[]) {
  const store = asyncLocalStorage.getStore() as alStoreType;
  const loggedinUserId = store?.loggedinUserId;
  if (!loggedinUserId || posts.some(post => post.poll)) return;

  const pollResults = await PollResultModel.find({
    userId: new mongoose.Types.ObjectId(loggedinUserId),
    postId: { $in: posts.map(post => post.id) },
  }).exec();

  if (!pollResults.length) return;

  const pollResultsMap = new Map(pollResults.map(result => [result.postId.toString(), result]));

  for (const post of posts) {
    if (post.poll) {
      const pollResult = pollResultsMap.get(post.id.toString());
      if (pollResult) post.poll.options[pollResult.optionIdx].isLoggedinUserVoted = true;
    }
  }
}

async function _setLoggedinUserActionState(post: Post, { isDefault = false } = {}) {
  const store = asyncLocalStorage.getStore() as alStoreType;
  const loggedinUserId = store?.loggedinUserId;
  post.loggedinUserActionState = {
    isLiked: false,
    isReposted: false,
    isViewed: false,
    isBookmarked: false,
  };

  if (isDefault) return;

  if (loggedinUserId) {
    post.loggedinUserActionState.isReposted = !!(await RepostModel.exists({
      postId: new mongoose.Types.ObjectId(post.id),
      repostOwnerId: new mongoose.Types.ObjectId(loggedinUserId),
    }));

    post.loggedinUserActionState.isLiked = !!(await PostLikeModel.exists({
      postId: new mongoose.Types.ObjectId(post.id),
      userId: new mongoose.Types.ObjectId(loggedinUserId),
    }));
  }
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
};
