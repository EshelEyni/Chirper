import { FollowingResult, User } from "../../../../../../shared/interfaces/user.interface";
import { UserModel } from "../../models/user/user.model";
import { UserRelationModel } from "../../models/user-relation/user-relation.model";
import { isValidMongoId } from "../../../../services/util/util.service";
import mongoose, { ClientSession } from "mongoose";
import { getLoggedInUserIdFromReq } from "../../../../services/als.service";
import { PostStatsModel } from "../../../post/models/post-stats.model";
import postService from "../../../post/services/post/post.service";
import { Post } from "../../../../../../shared/interfaces/post.interface";
import { AppError } from "../../../../services/error/error.service";

type UpdateAndGetUsersParams = {
  fromUserId: string;
  toUserId: string;
  session: ClientSession;
  inc: number;
};

type UpdatePostStatsAndReturnPostParams = {
  postId: string;
  fromUserId: string;
  isFollowedFromPost: boolean;
  session: ClientSession;
};

type UserRelationParams = {
  toUserId: string;
  postId?: string;
  kind: "Follow" | "Block" | "Mute";
};

export type isFollowingMap = {
  [key: string]: boolean;
};

async function getIsFollowing(...ids: string[]): Promise<isFollowingMap> {
  if (!ids.length) return {} as isFollowingMap;
  const loggedInUserId = getLoggedInUserIdFromReq();
  if (!isValidMongoId(loggedInUserId)) {
    const res = ids.reduce((acc, id) => ({ ...acc, [id]: false }), {});
    return res;
  }
  const isFollowing = await UserRelationModel.find({
    fromUserId: loggedInUserId,
    toUserId: { $in: ids },
    kind: "Follow",
  })
    .setOptions({ skipHooks: true })
    .select({ toUserId: 1 })
    .exec();

  const isFollowingMap = isFollowing.reduce(
    (acc, { toUserId }) => ({ ...acc, [toUserId]: true }),
    {}
  ) as isFollowingMap;

  const res = ids.reduce((acc, id) => ({ ...acc, [id]: isFollowingMap[id] || false }), {});

  return res;
}

async function add({
  toUserId,
  postId,
  kind,
}: UserRelationParams): Promise<FollowingResult | Post> {
  const fromUserId = getLoggedInUserIdFromReq();
  if (!isValidMongoId(fromUserId)) throw new AppError("You are not logged in", 401);

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await UserRelationModel.create([{ fromUserId, toUserId, kind }], { session });

    if (postId)
      return await _updatePostStatsAndReturnPost({
        fromUserId,
        postId,
        isFollowedFromPost: true,
        session,
      });

    return await _getUsers({
      fromUserId,
      toUserId,
      session,
      inc: 1,
    });
  } catch (err) {
    if (session.inTransaction()) await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
}

async function remove({
  toUserId,
  postId,
  kind,
}: UserRelationParams): Promise<FollowingResult | Post> {
  const fromUserId = getLoggedInUserIdFromReq();
  if (!isValidMongoId(fromUserId)) throw new AppError("You are not logged in", 401);

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const followLinkage = await UserRelationModel.findOneAndDelete(
      { fromUserId, toUserId, kind },
      { session }
    ).setOptions({ skipHooks: true });
    if (!followLinkage) throw new AppError("You are not following this User", 404);

    if (postId)
      return await _updatePostStatsAndReturnPost({
        fromUserId,
        postId,
        isFollowedFromPost: false,
        session,
      });

    return await _getUsers({
      fromUserId,
      toUserId,
      session,
      inc: -1,
    });
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
}

// Can't use mongoose hooks because they don't work well with transactions
async function _getUsers({
  fromUserId,
  toUserId,
  session,
  inc,
}: UpdateAndGetUsersParams): Promise<FollowingResult> {
  await session.commitTransaction();
  const loggedInUser = (await UserModel.findById(fromUserId)) as unknown as User;
  if (!loggedInUser) throw new AppError("Follower not found", 404);
  const followedUser = (await UserModel.findById(toUserId)) as unknown as User;
  if (!followedUser) throw new AppError("Following not found", 404);
  followedUser.isFollowing = inc > 0;
  return { loggedInUser, followedUser };
}

async function _updatePostStatsAndReturnPost({
  postId,
  fromUserId,
  isFollowedFromPost,
  session,
}: UpdatePostStatsAndReturnPostParams): Promise<Post> {
  await PostStatsModel.findOneAndUpdate(
    { postId, userId: fromUserId },
    { isFollowedFromPost },
    { session, upsert: true }
  );

  await session.commitTransaction();

  const updatedPost = await postService.getById(postId);
  if (!updatedPost) throw new AppError("Post not found", 404);
  return updatedPost;
}

export default {
  getIsFollowing,
  add,
  remove,
};

// Path: src\api\user\services\follower\follower.service.ts
