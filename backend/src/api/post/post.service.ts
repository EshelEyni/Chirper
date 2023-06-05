import {
  NewPost,
  Post,
  PollOption,
  AddPostParams,
} from "../../../../shared/interfaces/post.interface";
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

  let posts = (await features
    .getQuery()
    .populate(_populatePostOwner())
    .exec()) as unknown as Post[];
  if (posts.length > 0) {
    await _populateUserPollVotes(...(posts as unknown as Post[]));
  }
  posts = posts.filter(post => post.user !== null);
  return posts as unknown as Post[];
}

async function getById(postId: string): Promise<Post | null> {
  const post = await PostModel.findById(postId).populate(_populatePostOwner()).exec();
  await _populateUserPollVotes(post as unknown as Post);
  return post as unknown as Post;
}

async function add({ posts, repostedPost }: AddPostParams): Promise<Post> {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    let populatedPost: Post | null = null;
    if (posts) {
      const savedThread: Post[] = [];

      for (let i = 0; i < posts.length; i++) {
        const currPost = posts[i];

        if (i > 0) {
          currPost.previousThreadPostId = savedThread[i - 1].id;
        }

        const savedPost = await new PostModel(currPost).save();
        savedThread.push(savedPost as unknown as Post);
      }
      populatedPost = (await PostModel.findById(savedThread[0].id)
        .populate(_populatePostOwner())
        .exec()) as unknown as Post;
    } else if (repostedPost) {
      const savedPost = await new PostModel(repostedPost).save();
      populatedPost = (await PostModel.findById(savedPost.id)
        .populate(_populatePostOwner())
        .exec()) as unknown as Post;
    }

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
  })
    .populate(_populatePostOwner())
    .exec();
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
    option.voteSum++;
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

    const { text, voteSum } = option;
    return { text, voteSum, isLoggedinUserVoted: true };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}

function _populatePostOwner(): mongoose.PopulateOptions {
  return {
    path: "user",
    select: "_id username fullname imgUrl isVerified isAdmin",
  };
}

function _populatePostRepostedBy(): mongoose.PopulateOptions {
  return {
    path: "repostedBy",
    select: "_id username fullname imgUrl isVerified isAdmin",
  };
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
  update,
  remove,
  setPollVote,
};
