import moment from "moment";
import { ObjectId } from "mongodb";
import { Model } from "mongoose";
import { UserModel } from "../../../user/models/user/user.model";
import { PostStatsModel } from "../post-stats/post-stats.model";
import { RepostModel } from "../repost/repost.model";
import { PostLikeModel } from "../like/post-like.model";
import { PostModel } from "./post.model";
import { getLoggedInUserIdFromReq } from "../../../../services/als.service";
import { isValidMongoId } from "../../../../services/util/util.service";
import {
  LoggedInUserActionState,
  PostStatsBody,
} from "../../../../../../shared/types/post.interface";
import { BookmarkedPostModel } from "../bookmark/bookmark-post.model";
import { PollVoteModel } from "../poll-vote/poll-vote.model";
import { IPollOption, IPollVoteDoc, IPost, IUser } from "../../../../Types/ITypes";

type SetQuotedConfig = {
  doc: IPost;
  quotedPosts: IPost[];
  quotedPostId: string;
  users: IUser[];
};

async function populatePostData(...docs: IPost[]) {
  if (!docs.length) return;
  const { userIds, postIds, quotedPostIds } = _getUserAndPostIdsFromPostDoc(...docs);

  const { quotedPosts, quotedPostCreatorIds } = await _getQuotedPostAndCreatorIdByPostId(
    ...quotedPostIds
  );

  const users = await UserModel.find({ _id: { $in: [...userIds, ...quotedPostCreatorIds] } });
  const loggedInUserStatesMap = await _getPostLoggedInUserActionState(...postIds);

  const { repostCountsMap, repliesCountMap, likesCountsMap, viewsCountsMap } = await _getPostStats(
    ...postIds
  );

  for (const doc of docs) {
    if (!doc) continue;

    const currCreatedById = doc.get("createdById").toString();
    const currPostId = doc.get("_id").toString();
    const quotedPostId = doc.get("quotedPostId")?.toString();
    const poll = doc.get("poll");

    const user = users.find(user => user._id.toString() === currCreatedById);
    if (user) doc.set("createdBy", user);

    doc.set("loggedInUserActionState", loggedInUserStatesMap[currPostId]);

    doc._repostsCount = repostCountsMap.get(currPostId) ?? 0;
    doc._repliesCount = repliesCountMap.get(currPostId) ?? 0;
    doc._likesCount = likesCountsMap.get(currPostId) ?? 0;
    doc._viewsCount = viewsCountsMap.get(currPostId) ?? 0;

    if (quotedPostId) _setQuotedPost({ doc, quotedPosts, quotedPostId, users });
    if (poll) await _populatePollData(doc);
  }
}

function _convertToObjectId(ids: string[]) {
  return ids.map(id => new ObjectId(id));
}

const loggedInUserActionDefaultState: LoggedInUserActionState = {
  isLiked: false,
  isReposted: false,
  isViewed: false,
  isDetailedViewed: false,
  isProfileViewed: false,
  isHashTagClicked: false,
  isLinkClicked: false,
  isBookmarked: false,
  isPostLinkCopied: false,
  isPostShared: false,
  isPostSendInMessage: false,
  isPostBookmarked: false,
};

async function _getPostLoggedInUserActionState(
  ...ids: string[]
): Promise<{ [key: string]: LoggedInUserActionState }> {
  if (ids.length === 0) return {};

  const loggedInUserId = getLoggedInUserIdFromReq();

  const uniquePostIds = Array.from(new Set(ids));

  if (!isValidMongoId(loggedInUserId)) {
    const defaultStates = ids.reduce(
      (acc, id) => ({ ...acc, [id]: loggedInUserActionDefaultState }),
      {}
    );
    return defaultStates;
  }

  const userId = new ObjectId(loggedInUserId);

  const repostResults = await RepostModel.find({
    postId: { $in: uniquePostIds },
    repostOwnerId: userId,
  })
    .setOptions({ skipHooks: true })
    .select({ postId: 1 })
    .exec();

  const repostsIdSet = new Set(repostResults.map(repost => repost.postId.toString()));

  const likesResults = await PostLikeModel.find({
    postId: { $in: uniquePostIds },
    userId,
  }).setOptions({ skipHooks: true });

  const likesIdSet = new Set(likesResults.map(like => like.postId.toString()));

  const bookmarkedResults = await BookmarkedPostModel.find({
    postId: { $in: uniquePostIds },
    bookmarkOwnerId: userId,
  }).setOptions({ skipHooks: true });

  const bookmarkedIdSet = new Set(bookmarkedResults.map(bookmark => bookmark.postId.toString()));

  const postStatsResults = await PostStatsModel.find({
    postId: { $in: uniquePostIds },
    userId,
  }).setOptions({ skipHooks: true });

  const postStatsMap = new Map(postStatsResults.map(result => [result.postId.toString(), result]));

  const state = ids.reduce((acc, id): { [key: string]: LoggedInUserActionState } => {
    const isReposted = repostsIdSet.has(id);
    const isLiked = likesIdSet.has(id);
    const isBookmarked = bookmarkedIdSet.has(id);
    const postStats = postStatsMap.get(id) as unknown as PostStatsBody;
    const additionalState: Partial<LoggedInUserActionState> = postStats
      ? {
          isViewed: postStats.isViewed,
          isDetailedViewed: postStats.isDetailedViewed,
          isProfileViewed: postStats.isProfileViewed,
          isHashTagClicked: postStats.isHashTagClicked,
          isLinkClicked: postStats.isLinkClicked,
          isPostLinkCopied: postStats.isPostLinkCopied,
          isPostShared: postStats.isPostShared,
          isPostSendInMessage: postStats.isPostSendInMessage,
          isPostBookmarked: postStats.isPostBookmarked,
        }
      : {};
    return {
      ...acc,
      [id]: {
        ...loggedInUserActionDefaultState,
        isReposted,
        isLiked,
        isBookmarked,
        ...additionalState,
      },
    };
  }, {});

  return state;
}

// Using one function for both user and post ids because we want to loop through the docs only once.
function _getUserAndPostIdsFromPostDoc(...docs: IPost[]) {
  const userIds = new Set<string>();
  const postIds = [];
  const quotedPostIds = [];

  for (const doc of docs) {
    const userIdStr = doc.get("createdById").toString();
    const postIdStr = doc.get("_id").toString();
    const quotedPostIdStr = doc.get("quotedPostId")?.toString();

    userIds.add(userIdStr);
    postIds.push(postIdStr);

    if (quotedPostIdStr) quotedPostIds.push(quotedPostIdStr);
  }

  return { userIds: Array.from(userIds), postIds, quotedPostIds };
}

async function getAggregateCountsAsMap<T>(model: Model<T>, field: string, objIds: ObjectId[]) {
  const counts = await model.aggregate([
    { $match: { [field]: { $in: objIds } } },
    { $group: { _id: `$${field}`, count: { $sum: 1 } } },
  ]);
  return new Map(counts.map(({ _id, count }) => [_id.toString(), count]));
}

async function _getPostStats(...ids: string[]) {
  const objIds = _convertToObjectId(ids);
  return {
    repostCountsMap: await getAggregateCountsAsMap(RepostModel, "postId", objIds),
    likesCountsMap: await getAggregateCountsAsMap(PostLikeModel, "postId", objIds),
    viewsCountsMap: await getAggregateCountsAsMap(PostStatsModel, "postId", objIds),
    repliesCountMap: await getAggregateCountsAsMap(PostModel, "parentPostId", objIds),
  };
}

async function _getQuotedPostAndCreatorIdByPostId(...ids: string[]) {
  const quotedPosts = (await PostModel.find({
    _id: { $in: _convertToObjectId(ids) },
  })
    .select([
      "text",
      "video",
      "videoUrl",
      "gif",
      "imgs",
      "isPublic",
      "audience",
      "repliersType",
      "repliedPostDetails",
      "createdById",
      "createdAt",
    ])
    .setOptions({ skipHooks: true, lean: true })) as unknown as IPost[];

  const quotedPostCreatorIds = quotedPosts.map(post => post.createdById.toString());
  return { quotedPosts, quotedPostCreatorIds };
}

function _setQuotedPost({ doc, quotedPosts, quotedPostId, users }: SetQuotedConfig) {
  if (!quotedPosts.length) return;
  const quotedPost = quotedPosts.find(post => post._id.toString() === quotedPostId);
  if (!quotedPost) return;
  doc.set("quotedPost", {
    ...quotedPost,
    id: quotedPost._id.toString(),
  });
  const quotedPostCreator = users.find(
    user => user._id.toString() === quotedPost?.createdById.toString()
  );
  doc.set("quotedPost.createdBy", quotedPostCreator ?? "unknown");
}

async function _populatePollData(doc: IPost) {
  if (!doc.poll) return doc;
  const loggedInUserId = getLoggedInUserIdFromReq();
  const postId = doc._id;

  const allVotes = (await PollVoteModel.find({ postId }).lean()) as IPollVoteDoc[];
  let isVotingOff = !loggedInUserId;

  if (!isVotingOff) isVotingOff = _checkPollExpiration(doc);

  doc.poll.options.forEach((option: IPollOption, idx: number) => {
    const optionVotes = allVotes.filter(vote => vote.optionIdx === idx);
    option._voteCount = optionVotes.length;

    option._isLoggedInUserVoted = loggedInUserId
      ? checkLoggedInUserPollVote({ optionVotes, loggedInUserId })
      : false;

    if (option._isLoggedInUserVoted) isVotingOff = true;
  });

  doc.poll._isVotingOff = isVotingOff;

  return doc;
}

function _checkPollExpiration(doc: IPost): boolean {
  if (!doc.poll) return false;
  const pollEndTime = moment(doc.createdAt)
    .add(doc.poll.length.days, "days")
    .add(doc.poll.length.hours, "hours")
    .add(doc.poll.length.minutes, "minutes");

  return moment().isAfter(pollEndTime);
}

function checkLoggedInUserPollVote({
  optionVotes,
  loggedInUserId,
}: {
  optionVotes: { userId: ObjectId }[];
  loggedInUserId: string;
}): boolean {
  return !!optionVotes.find(v => v.userId.toString() === loggedInUserId);
}

export { populatePostData };
