import { FollowingResult, User } from "../../../../../../shared/interfaces/user.interface";
import { UserModel } from "../../models/user.model";
import { FollowerModel } from "../../models/followers.model";
import { isValidMongoId } from "../../../../services/util/util.service";
import mongoose, { ClientSession } from "mongoose";
import { asyncLocalStorage } from "../../../../services/als.service";
import { alStoreType } from "../../../../middlewares/setupAls/setupAls.middleware";
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

async function getIsFollowing(user: User): Promise<boolean> {
  const store = asyncLocalStorage.getStore() as alStoreType;
  const loggedInUserId = store?.loggedInUserId;
  if (!isValidMongoId(loggedInUserId)) return false;
  const isFollowing = await FollowerModel.exists({ fromUserId: loggedInUserId, toUserId: user.id });
  return !!isFollowing;
}

async function add(
  fromUserId: string,
  toUserId: string,
  postId?: string
): Promise<FollowingResult | Post> {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await FollowerModel.create([{ fromUserId, toUserId }], { session });

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
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const followLinkage = await FollowerModel.findOneAndDelete(
      { fromUserId, toUserId },
      { session }
    );
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

async function _getUsers({
  fromUserId,
  toUserId,
  session,
  inc,
}: UpdateAndGetUsersParams): Promise<FollowingResult> {
  // TODO: use hooks instead of this to populate loggedInUser and followedUser
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
