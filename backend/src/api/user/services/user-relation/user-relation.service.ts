import { FollowingResult, User } from "../../../../../../shared/interfaces/user.interface";
import { UserModel } from "../../models/user/user.model";
import {
  UserRelationKind,
  UserRelationModel,
} from "../../models/user-relation/user-relation.model";
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
  // inc: number;
};

type UserRelationState = {
  isFollowedFromPost?: boolean;
  isBlockedFromPost?: boolean;
  isMutedFromPost?: boolean;
};

type UpdatePostStatsAndReturnPostParams = {
  postId: string;
  fromUserId: string;
  relationState: UserRelationState;
  session: ClientSession;
};

export type UserRelationParams = {
  fromUserId: string;
  toUserId: string;
  kind: UserRelationKind;
  postId?: string;
};

export type isFollowingMap = {
  [key: string]: boolean;
};

type UserRelationMap = {
  [key: string]: {
    isFollowing?: boolean;
    isMuted?: boolean;
    isBlocked?: boolean;
  };
};

async function getUserRelation(
  kinds: UserRelationKind[] = [UserRelationKind.Follow],
  ...ids: string[]
): Promise<UserRelationMap> {
  if (!ids.length) return {} as UserRelationMap;

  const loggedInUserId = getLoggedInUserIdFromReq();
  if (!isValidMongoId(loggedInUserId)) {
    const res = ids.reduce((acc, id) => ({ ...acc, [id]: {} }), {});
    return res;
  }

  const userRelations = await UserRelationModel.find({
    fromUserId: loggedInUserId,
    toUserId: { $in: ids },
    kind: { $in: kinds },
  })
    .setOptions({ skipHooks: true })
    .select({ toUserId: 1, kind: 1 })
    .exec();

  const relationMap = userRelations.reduce((acc, { toUserId, kind }) => {
    const relationStatus = {
      isFollowing: kind === "Follow",
      isMuted: kind === "Mute",
      isBlocked: kind === "Block",
    };

    return {
      ...acc,
      [toUserId]: {
        ...acc[toUserId],
        ...relationStatus,
      },
    };
  }, {} as UserRelationMap);

  const res = ids.reduce(
    (acc, id) => ({
      ...acc,
      [id]: relationMap[id] || {},
    }),
    {}
  );

  return res;
}

async function getIsFollowing(...ids: string[]): Promise<isFollowingMap> {
  return await getUserRelation([UserRelationKind.Follow], ...ids).then(res =>
    Object.fromEntries(
      Object.entries(res).map(([id, { isFollowing }]) => [id, isFollowing || false])
    )
  );
}

async function add({
  fromUserId,
  toUserId,
  postId,
  kind,
}: UserRelationParams): Promise<FollowingResult | Post> {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await UserRelationModel.create([{ fromUserId, toUserId, kind }], { session });

    if (postId)
      return await _updatePostStatsAndReturnPost({
        fromUserId,
        postId,
        relationState: _getUpdateQuery(kind, true),
        session,
      });

    return await _getUsers({
      fromUserId,
      toUserId,
      session,
    });
  } catch (err) {
    if (session.inTransaction()) await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
}

async function remove({
  fromUserId,
  toUserId,
  postId,
  kind,
}: UserRelationParams): Promise<FollowingResult | Post> {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const userRelation = await UserRelationModel.findOneAndDelete(
      { fromUserId, toUserId, kind },
      { session }
    ).setOptions({ skipHooks: true });
    if (!userRelation) throw new AppError(_getRelationNotFoundError(kind), 404);

    if (postId)
      return await _updatePostStatsAndReturnPost({
        fromUserId,
        postId,
        relationState: _getUpdateQuery(kind, false),
        session,
      });

    return await _getUsers({
      fromUserId,
      toUserId,
      session,
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
}: UpdateAndGetUsersParams): Promise<FollowingResult> {
  await session.commitTransaction();
  const loggedInUser = (await UserModel.findById(fromUserId)) as unknown as User;
  if (!loggedInUser) throw new AppError("User not found", 404);
  const targetUser = (await UserModel.findById(toUserId)) as unknown as User;
  if (!targetUser) throw new AppError("Target User not found", 404);
  return { loggedInUser, targetUser };
}

async function _updatePostStatsAndReturnPost({
  postId,
  fromUserId,
  relationState,
  session,
}: UpdatePostStatsAndReturnPostParams): Promise<Post> {
  await PostStatsModel.findOneAndUpdate(
    { postId, userId: fromUserId },
    { ...relationState },
    { session, upsert: true }
  );

  await session.commitTransaction();

  const updatedPost = await postService.getById(postId);
  if (!updatedPost) throw new AppError("Post not found", 404);
  return updatedPost;
}

function _getUpdateQuery(kind: UserRelationKind, relationState: boolean): UserRelationState {
  switch (kind) {
    case "Follow":
      return { isFollowedFromPost: relationState };
    case "Block":
      return { isBlockedFromPost: relationState };
    case "Mute":
      return { isMutedFromPost: relationState };
    default:
      throw new AppError("Invalid UserRelationKind", 500);
  }
}

function _getRelationNotFoundError(kind: UserRelationKind) {
  switch (kind) {
    case "Follow":
      return "You are not following this User";
    case "Block":
      return "You have not blocked this User";
    case "Mute":
      return "You have not muted this User";
    default:
      throw new AppError("Invalid UserRelationKind", 500);
  }
}

export default {
  getUserRelation,
  getIsFollowing,
  add,
  remove,
};

// Path: src\api\user\services\follower\follower.service.ts
