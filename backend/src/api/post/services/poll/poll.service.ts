import mongoose from "mongoose";
import { AppError } from "../../../../services/error/error.service";
import { PostModel } from "../../models/post.model";
import { PollResultModel } from "../../models/poll.model";
import { asyncLocalStorage } from "../../../../services/als.service";
import { alStoreType } from "../../../../middlewares/setupAls/setupAls.middleware";
import { PollOption, Post } from "../../../../../../shared/interfaces/post.interface";
import { ObjectId } from "mongodb";
import { isValidMongoId } from "../../../../services/util/util.service";

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
    return { text, voteCount, isLoggedInUserVoted: true };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}

async function getLoggedInUserPollDetails(...posts: Post[]) {
  const store = asyncLocalStorage.getStore() as alStoreType;
  const loggedInUserId = store?.loggedInUserId;
  const isNoPolls = posts.every(post => !post.poll);
  if (!isValidMongoId(loggedInUserId) || isNoPolls) return;

  const pollResults = await PollResultModel.find({
    userId: new ObjectId(loggedInUserId),
    postId: { $in: posts.map(post => post.id) },
  }).exec();

  // if (!pollResults.length) return;
  const pollResultsMap = new Map(pollResults.map(result => [result.postId.toString(), result]));

  for (const post of posts) {
    if (!post.poll) continue;
    const isLoggedInUserPoll = post.createdBy.id === loggedInUserId;
    if (isLoggedInUserPoll) post.poll.isVotingOff = true;
    const pollResult = pollResultsMap.get(post.id.toString());
    if (!pollResult) continue;
    post.poll.options[pollResult.optionIdx].isLoggedInUserVoted = true;
    post.poll.isVotingOff = true;
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

export default { setPollVote, getLoggedInUserPollDetails };
