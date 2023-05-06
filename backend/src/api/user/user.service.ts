import { User } from "../../../../shared/interfaces/user.interface";
const { logger } = require("../../services/logger.service");
const { UserModel } = require("./user.model");
const { APIFeatures } = require("../../services/util.service");

async function query(): Promise<User[]> {
  try {
    const features = new APIFeatures(UserModel.find(), {})
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const users = await features.query.exec();

    return users as unknown as User[];
  } catch (err) {
    logger.error("cannot find users", err as Error);
    throw err;
  }
}

async function getById(userId: string): Promise<User> {
  try {
    const user = await UserModel.findById(userId).exec();
    return user as unknown as User;
  } catch (err) {
    logger.error(`while finding user ${userId}`, err as Error);
    throw err;
  }
}

async function getByUsername(username: string): Promise<User> {
  try {
    const features = new APIFeatures(UserModel.find(), { username }).filter();
    const user = await features.query.exec();
    return user as unknown as User;
  } catch (err) {
    logger.error(`while finding user ${username}`, err as Error);
    throw err;
  }
}

async function add(user: User): Promise<User> {
  try {
    const savedUser = await UserModel(user).save();
    return savedUser as unknown as User;
  } catch (err) {
    logger.error("cannot insert user", err as Error);
    throw err;
  }
}

async function update(id: string, user: User): Promise<User> {
  try {
    const updatedUser = await UserModel.findByIdAndUpdate(id, user, {
      new: true,
      runValidators: true,
    }).exec();
    return updatedUser as unknown as User;
  } catch (err) {
    logger.error(`cannot update user ${user.id}`, err as Error);
    throw err;
  }
}

async function remove(userId: string) {
  try {
    await UserModel.findByIdAndRemove(userId).exec();
    logger.warn("user removed", userId);
  } catch (err) {
    logger.error(`cannot remove user ${userId}`, err as Error);
    throw err;
  }
}

module.exports = {
  query,
  getById,
  getByUsername,
  remove,
  update,
  add,
};
