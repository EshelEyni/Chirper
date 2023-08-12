import { ObjectId } from "mongodb";
import { PostStatsBody } from "../../../../../shared/interfaces/post.interface";
import { PostLikeModel } from "../models/post-like.model";
import { PostStatsModel } from "../models/post-stats.model";
import { PostModel } from "../models/post.model";
import { RepostModel } from "../models/repost.model";
import mongoose from "mongoose";

async function get(postId: string): Promise<PostStatsBody> {
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

async function create(postId: string, userId: string): Promise<PostStatsBody> {
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

async function update(
  postId: string,
  userId: string,
  stats: Partial<PostStatsBody>
): Promise<PostStatsBody> {
  return (await PostStatsModel.findOneAndUpdate({ postId, userId }, stats, {
    new: true,
  })) as unknown as PostStatsBody;
}

export default { get, create, update };
