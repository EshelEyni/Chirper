import { ObjectId } from "mongodb";
import { PostStats } from "../../../../shared/types/post.interface";
import { PostLikeModel } from "../../models/postLike/postLikeModel";
import { PostStatsModel } from "../../models/postStats/postStatsModel";
import { PostModel } from "../../models/post/postModel";
import { RepostModel } from "../../models/repost/repostModel";

export const defaultPostStats: PostStats = {
  likesCount: 0,
  repostCount: 0,
  repliesCount: 0,
  viewsCount: 0,
  detailsViewsCount: 0,
  profileViewsCount: 0,
  followFromPostCount: 0,
  hashTagClicksCount: 0,
  linkClicksCount: 0,
  postLinkCopyCount: 0,
  postSharedCount: 0,
  postViaMsgCount: 0,
  postBookmarksCount: 0,
  engagementCount: 0,
};

async function get(postId: string): Promise<PostStats> {
  const likesCount = await PostLikeModel.countDocuments({ postId });
  const repostCount = await RepostModel.countDocuments({ postId });
  const repliesCount = await PostModel.countDocuments({ parentPostId: postId });

  const postStatsAggregation = await PostStatsModel.aggregate([
    {
      $match: {
        postId: new ObjectId(postId),
      },
    },
    {
      $group: {
        _id: null,
        viewsCount: { $sum: { $cond: ["$isViewed", 1, 0] } },
        detailsViewsCount: { $sum: { $cond: ["$isDetailedViewed", 1, 0] } },
        profileViewsCount: { $sum: { $cond: ["$isProfileViewed", 1, 0] } },
        followFromPostCount: { $sum: { $cond: ["$isFollowedFromPost", 1, 0] } },
        hashTagClicksCount: { $sum: { $cond: ["$isHashTagClicked", 1, 0] } },
        linkClicksCount: { $sum: { $cond: ["$isLinkClicked", 1, 0] } },
        postLinkCopyCount: { $sum: { $cond: ["$isPostLinkCopied", 1, 0] } },
        postSharedCount: { $sum: { $cond: ["$isPostShared", 1, 0] } },
        postViaMsgCount: { $sum: { $cond: ["$isPostSendInMessage", 1, 0] } },
        postBookmarksCount: { $sum: { $cond: ["$isPostBookmarked", 1, 0] } },
      },
    },
  ]);

  const [postStats] = postStatsAggregation;
  if (postStats) delete postStats._id;
  const postStatsSum = _getPostStatsSum(postStats);

  const engagementCount = postStatsSum + likesCount + repostCount + repliesCount;

  return {
    ...defaultPostStats,
    likesCount,
    repostCount,
    repliesCount,
    ...postStats,
    engagementCount,
  };
}

function _getPostStatsSum(postStats: Partial<PostStats>): number {
  if (!postStats) return 0;
  return Object.values(postStats)
    .filter((value): value is number => typeof value === "number")
    .reduce((a: number, b: number): number => a + b, 0);
}

export default { get };
