import { FollowingResult, User } from "../../../../shared/interfaces/user.interface";
import { UserModel } from "./user.model";
import { FollowerModel } from "./followers.model";
import { APIFeatures, QueryObj, filterObj, isValidId } from "../../services/util/util.service";
import { Document, startSession } from "mongoose";
import { asyncLocalStorage } from "../../services/als.service";
import { alStoreType } from "../../middlewares/setupAls/setupAls.middleware";
import { PostStatsModel } from "../post/models/post-stats.model";
import postService from "../post/post.service";
import { Post } from "../../../../shared/interfaces/post.interface";

async function query(queryString: QueryObj): Promise<User[]> {
  const features = new APIFeatures(UserModel.find(), queryString)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const usersDocs = (await features.getQuery().exec()) as unknown as Document[];

  const users = await Promise.all(
    usersDocs.map(async userDoc => {
      const user = userDoc.toObject();
      await populateIsFollowing(user);
      return user;
    })
  );
  return users as unknown as User[];
}

async function getById(userId: string): Promise<User> {
  const user = await UserModel.findById(userId).exec();
  return user as unknown as User;
}

async function getByUsername(username: string): Promise<User> {
  const features = new APIFeatures(UserModel.find(), { username }).filter();
  const users = await features.getQuery().exec();
  const [user] = users;
  return user as unknown as User;
}

async function add(user: User): Promise<User> {
  const savedUser = await new UserModel(user).save();
  return savedUser as unknown as User;
}

async function update(id: string, user: User): Promise<User> {
  const allowedFields = ["username", "email", "fullname", "imgUrl", "email", "isApprovedLocation"];
  const filteredUser = filterObj(user, ...allowedFields);

  const updatedUser = await UserModel.findByIdAndUpdate(id, filteredUser, {
    new: true,
    runValidators: true,
  }).exec();
  return updatedUser as unknown as User;
}

async function remove(userId: string): Promise<User> {
  const userRemoved = await UserModel.findByIdAndRemove(userId).exec();
  return userRemoved as unknown as User;
}

async function removeAccount(userId: string): Promise<User> {
  const userRemoved = await UserModel.findByIdAndUpdate(userId, { active: false }).exec();
  return userRemoved as unknown as User;
}

async function populateIsFollowing(user: User): Promise<User> {
  const store = asyncLocalStorage.getStore() as alStoreType;
  const loggedinUserId = store?.loggedinUserId;
  if (!isValidId(loggedinUserId)) {
    user.isFollowing = false;
    return user;
  }

  const isFollowing = await FollowerModel.exists({ fromUserId: loggedinUserId, toUserId: user.id });
  user.isFollowing = !!isFollowing;
  return user;
}

async function addFollowings(
  fromUserId: string,
  toUserId: string,
  postId?: string
): Promise<FollowingResult | Post> {
  const session = await startSession();
  session.startTransaction();
  try {
    const following = new FollowerModel({ fromUserId, toUserId });
    await following.save({ session });

    const updatedFollowerDoc = await UserModel.findByIdAndUpdate(
      fromUserId,
      { $inc: { followingCount: 1 } },
      { session, new: true }
    );
    if (!updatedFollowerDoc) throw new Error("User not found");

    const updatedFollowingDoc = await UserModel.findByIdAndUpdate(
      toUserId,
      { $inc: { followersCount: 1 } },
      { session, new: true }
    );
    if (!updatedFollowingDoc) throw new Error("User not found");

    if (postId) {
      await PostStatsModel.findOneAndUpdate(
        { postId, userId: fromUserId },
        { isFollowedFromPost: true },
        { session }
      );
    }

    await session.commitTransaction();
    if (postId) {
      const updatedPost = await postService.getById(postId);
      if (!updatedPost) throw new Error("Post not found");
      return updatedPost;
    }

    const updatedFollower = updatedFollowerDoc.toObject() as User;
    updatedFollower.isFollowing = false;

    const updatedFollowing = updatedFollowingDoc.toObject() as User;
    updatedFollowing.isFollowing = true;

    return { updatedFollower, updatedFollowing };
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  } finally {
    session.endSession();
  }
}

async function removeFollowings(
  fromUserId: string,
  toUserId: string,
  postId?: string
): Promise<FollowingResult | Post> {
  const session = await startSession();
  session.startTransaction();
  try {
    const follower = await FollowerModel.findOneAndDelete({ fromUserId, toUserId }, { session });
    if (!follower) throw new Error("Follower not found");

    const updatedFollowerDoc = await UserModel.findByIdAndUpdate(
      fromUserId,
      { $inc: { followingCount: -1 } },
      { session, new: true }
    );
    if (!updatedFollowerDoc) throw new Error("User not found");

    const updatedFollowingDoc = await UserModel.findByIdAndUpdate(
      toUserId,
      { $inc: { followersCount: -1 } },
      { session, new: true }
    );
    if (!updatedFollowingDoc) throw new Error("User not found");

    if (postId) {
      await PostStatsModel.findOneAndUpdate(
        { postId, userId: fromUserId },
        { isFollowedFromPost: false },
        { session }
      );
    }
    await session.commitTransaction();

    if (postId) {
      const updatedPost = await postService.getById(postId);
      if (!updatedPost) throw new Error("Post not found");
      return updatedPost;
    }

    const updatedFollower = updatedFollowerDoc.toObject() as User;
    updatedFollower.isFollowing = false;
    const updatedFollowing = updatedFollowingDoc.toObject() as User;
    updatedFollowing.isFollowing = false;

    return { updatedFollower, updatedFollowing };
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  } finally {
    session.endSession();
  }
}

export default {
  query,
  getById,
  getByUsername,
  add,
  update,
  remove,
  removeAccount,
  addFollowings,
  removeFollowings,
  populateIsFollowing,
};
