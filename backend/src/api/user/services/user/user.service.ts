import { User } from "../../../../../../shared/interfaces/user.interface";
import { UserModel } from "../../models/user.model";
import { APIFeatures, QueryObj, filterObj } from "../../../../services/util/util.service";
import { Document } from "mongoose";
import followerService from "../follower/follower.service";
import { AppError } from "../../../../services/error/error.service";
import { logger } from "../../../../services/logger/logger.service";

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

      const isFollowingMap = await followerService.getIsFollowing(user.id);
      user.isFollowing = isFollowingMap[user.id];
      return user;
    })
  );
  return users as unknown as User[];
}

async function getUsers(...userIds: string[]): Promise<User[]> {
  const users = await UserModel.find({ _id: { $in: userIds } })
    .lean()
    .exec();
  return users as unknown as User[];
}

async function getById(userId: string): Promise<User> {
  const user = await UserModel.findById(userId).exec();
  return user as unknown as User;
}

async function getByUsername(username: string): Promise<User> {
  const user = await UserModel.findOne({ username }).exec();
  if (!user) throw new AppError(`User with username ${username} not found`, 404);
  return user as unknown as User;
}

async function add(user: User): Promise<User> {
  const savedUser = await new UserModel(user).save();
  return savedUser as unknown as User;
}

async function update(id: string, user: User): Promise<User> {
  const allowedFields = [
    "username",
    "email",
    "fullname",
    "imgUrl",
    "email",
    "isApprovedLocation",
    "bio",
  ];
  const filteredUser = filterObj(user, ...allowedFields);

  const updatedUser = await UserModel.findByIdAndUpdate(id, filteredUser, {
    new: true,
    runValidators: true,
  }).exec();
  if (!updatedUser) throw new AppError("User not found", 404);
  return updatedUser as unknown as User;
}

async function remove(userId: string): Promise<User> {
  const userRemoved = await UserModel.findByIdAndRemove(userId).exec();
  return userRemoved as unknown as User;
}

async function removeAccount(userId: string): Promise<User> {
  const removedUser = (await UserModel.findByIdAndUpdate(userId, {
    active: false,
  }).exec()) as unknown as User;
  if (!removedUser) throw new AppError("User not found", 404);
  logger.warn(`User ${removedUser.username} was deactivated`);

  return removedUser as unknown as User;
}

export default {
  query,
  getById,
  getByUsername,
  add,
  update,
  remove,
  removeAccount,
  getUsers,
};
