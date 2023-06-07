import { Post, PollOption, NewPost } from "../../../../shared/interfaces/post.interface";
import { QueryString } from "../../services/util.service.js";
import { PostModel } from "./post.model";
import { PollResultModel } from "./poll.model";
import { APIFeatures } from "../../services/util.service";
import { asyncLocalStorage } from "../../services/als.service";
import { alStoreType } from "../../middlewares/setupAls.middleware";
import mongoose from "mongoose";
import { AppError } from "../../services/error.service";

async function query(queryString: QueryString): Promise<Post[]> {
  const features = new APIFeatures(PostModel.find(), queryString)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  let posts = (await features.getQuery().exec()) as unknown as Post[];
  if (posts.length > 0) {
    await _populateUserPollVotes(...(posts as unknown as Post[]));
  }
  posts = posts.filter(post => post.createdBy !== null);
  return posts as unknown as Post[];
}

async function getById(postId: string): Promise<Post | null> {
  const post = await PostModel.findById(postId).exec();
  await _populateUserPollVotes(post as unknown as Post);
  return post as unknown as Post;
}

async function add(post: NewPost): Promise<Post> {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const savedPost = await new PostModel(post).save({ session });
    if (savedPost.repliedPostDetails) {
      const { repliedPostDetails } = savedPost;
      const repliedToPostId = repliedPostDetails.at(-1)?.postId;
      await PostModel.updateOne(
        { _id: repliedToPostId },
        { $inc: { repliesCount: 1 } },
        { session }
      );
    }
    await session.commitTransaction();
    return (await PostModel.findById(savedPost.id).exec()) as unknown as Post;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
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

      const savedPost = await new PostModel(currPost).save();
      savedThread.push(savedPost as unknown as Post);
    }
    const originalPost = savedThread[0];
    const populatedPost = (await PostModel.findById(originalPost.id).exec()) as unknown as Post;
    await session.commitTransaction();
    if (!populatedPost) throw new AppError("post not found", 404);
    return populatedPost as unknown as Post;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}

async function update(id: string, post: Post): Promise<Post> {
  const updatedPost = await PostModel.findByIdAndUpdate(id, post, {
    new: true,
    runValidators: true,
  }).exec();
  return updatedPost as unknown as Post;
}

async function remove(postId: string): Promise<Post> {
  const removedPost = await PostModel.findByIdAndRemove(postId);
  return removedPost as unknown as Post;
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

async function _populateUserPollVotes(...posts: Post[]) {
  const store = asyncLocalStorage.getStore() as alStoreType;
  const userId = store?.loggedinUserId;
  if (!userId) return;

  const pollResults = await PollResultModel.find({
    userId: new mongoose.Types.ObjectId(userId),
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

export default {
  query,
  getById,
  add,
  addMany,
  update,
  remove,
  setPollVote,
};
