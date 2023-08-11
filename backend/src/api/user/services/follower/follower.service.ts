import { FollowingResult, User } from "../../../../../../shared/interfaces/user.interface";
import { UserModel } from "../../models/user.model";
import { FollowerModel } from "../../models/followers.model";
import { isValidMongoId } from "../../../../services/util/util.service";
import { ClientSession, startSession } from "mongoose";
import { asyncLocalStorage } from "../../../../services/als.service";
import { alStoreType } from "../../../../middlewares/setupAls/setupAls.middleware";
import { PostStatsModel } from "../../../post/models/post-stats.model";
import postService from "../../../post/post.service";
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

async function populateIsFollowing(user: User): Promise<User> {
  const store = asyncLocalStorage.getStore() as alStoreType;
  const loggedInUserId = store?.loggedInUserId;
  if (!isValidMongoId(loggedInUserId)) {
    user.isFollowing = false;
    return user;
  }

  const isFollowing = await FollowerModel.exists({ fromUserId: loggedInUserId, toUserId: user.id });
  user.isFollowing = !!isFollowing;
  return user;
}

async function add(
  fromUserId: string,
  toUserId: string,
  postId?: string
): Promise<FollowingResult | Post> {
  const session = await startSession();
  session.startTransaction();
  try {
    await FollowerModel.create([{ fromUserId, toUserId }], { session });

    const { updatedFollower, updatedFollowing } = await _updateAndGetUsers({
      fromUserId,
      toUserId,
      session,
      inc: 1,
    });

    if (postId)
      return await _updatePostStatsAndReturnPost({
        fromUserId,
        postId,
        isFollowedFromPost: true,
        session,
      });

    return { updatedFollower, updatedFollowing };
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
}

async function remove(
  fromUserId: string,
  toUserId: string,
  postId?: string
): Promise<FollowingResult | Post> {
  const session = await startSession();
  session.startTransaction();
  try {
    const followLinkage = await FollowerModel.findOneAndDelete(
      { fromUserId, toUserId },
      { session }
    );
    if (!followLinkage) throw new AppError("You are not following this User", 404);

    const { updatedFollower, updatedFollowing } = await _updateAndGetUsers({
      fromUserId,
      toUserId,
      session,
      inc: -1,
    });

    if (!postId) return { updatedFollower, updatedFollowing };

    return await _updatePostStatsAndReturnPost({
      fromUserId,
      postId,
      isFollowedFromPost: false,
      session,
    });
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
}

async function _updateAndGetUsers({
  fromUserId,
  toUserId,
  session,
  inc,
}: UpdateAndGetUsersParams): Promise<FollowingResult> {
  const updatedFollowerDoc = await UserModel.findByIdAndUpdate(
    fromUserId,
    { $inc: { followingCount: inc } },
    { session, new: true }
  );
  if (!updatedFollowerDoc) throw new AppError("Follower not found", 404);

  const updatedFollowingDoc = await UserModel.findByIdAndUpdate(
    toUserId,
    { $inc: { followersCount: inc } },
    { session, new: true }
  );
  if (!updatedFollowingDoc) throw new AppError("Following not found", 404);

  await session.commitTransaction();

  const updatedFollowing = updatedFollowingDoc.toObject() as User;
  updatedFollowing.isFollowing = inc > 0;
  return { updatedFollower: updatedFollowerDoc as unknown as User, updatedFollowing };
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
  populateIsFollowing,
  add,
  remove,
};
