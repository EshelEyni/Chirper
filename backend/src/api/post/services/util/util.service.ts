import { ObjectId } from "mongodb";
import { isValidMongoId, queryEntityExists } from "../../../../services/util/util.service";
import { RepostModel } from "../../models/repost.model";
import { PostLikeModel } from "../../models/post-like.model";
import { BookmarkedPostModel } from "../../models/bookmark-post.model";
import { PostStatsModel } from "../../models/post-stats.model";
import {
  LoggedInUserActionState,
  Post,
  PostStatsBody,
} from "../../../../../../shared/interfaces/post.interface";
import { asyncLocalStorage } from "../../../../services/als.service";
import { alStoreType } from "../../../../middlewares/setupAls/setupAls.middleware";

export const loggedInUserActionDefaultState: LoggedInUserActionState = {
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

async function getLoggedInUserActionState(
  post: Post,
  { isDefault = false } = {}
): Promise<LoggedInUserActionState> {
  const store = asyncLocalStorage.getStore() as alStoreType;
  const loggedInUserId = store?.loggedInUserId;

  if (isDefault || !isValidMongoId(loggedInUserId)) return loggedInUserActionDefaultState;
  const postId = new ObjectId(post.id);
  const userId = new ObjectId(loggedInUserId);

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

  return {
    ...loggedInUserActionDefaultState,
    isReposted,
    isLiked,
    isBookmarked,
    ...additionalState,
  };
}

function populateRepostedBy() {
  return {
    path: "repostedBy",
    select: {
      _id: 1,
      username: 1,
      fullname: 1,
      imgUrl: 1,
      isVerified: 1,
      isAdmin: 1,
      bio: 1,
      followersCount: 1,
      followingCount: 1,
    },
  };
}

export default { getLoggedInUserActionState, populateRepostedBy };

// Path: src\api\post\services\util\util.service.test.ts
