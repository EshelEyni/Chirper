import { User } from "../../../../shared/interfaces/user.interface";
const { UserModel } = require("./user.model");
const { APIFeatures } = require("../../services/util.service");

async function query(): Promise<User[]> {
  const features = new APIFeatures(UserModel.find(), {}).filter().sort().limitFields().paginate();

  const users = await features.query.exec();
  return users as unknown as User[];
}

async function getById(userId: string): Promise<User> {
  const user = await UserModel.findById(userId).exec();
  return user as unknown as User;
}

async function getByUsername(username: string): Promise<User> {
  const features = new APIFeatures(UserModel.find(), { username }).filter();
  const users = await features.query.exec();
  const user = users[0];
  return user as unknown as User;
}

async function add(user: User): Promise<User> {
  const savedUser = await UserModel(user).save();
  return savedUser as unknown as User;
}

async function update(id: string, user: User): Promise<User> {
  const updatedUser = await UserModel.findByIdAndUpdate(id, user, {
    new: true,
    runValidators: true,
  }).exec();
  return updatedUser as unknown as User;
}

async function remove(userId: string): Promise<User> {
  const userRemoved = await UserModel.findByIdAndRemove(userId).exec();
  return userRemoved as unknown as User;
}

module.exports = {
  query,
  getById,
  getByUsername,
  remove,
  update,
  add,
};
