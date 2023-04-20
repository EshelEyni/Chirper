import { User } from "../../models/user.model";
import { getCollection } from "../../services/db.service";
import { error } from "../../services/logger.service";
import { ObjectId } from "mongodb";

export const userService = {
  query,
  getById,
  getByUsername,
  remove,
  update,
  add,
};

async function query() {
  try {
    const collection = await getCollection("user");
    var users = await collection.find().toArray();
    users = users.map((user) => {
      delete user.password;
      user.createdAt = new ObjectId(user._id).getTimestamp();
      return user;
    });
    return users;
  } catch (err) {
    error("cannot find users", err);
    throw err;
  }
}

async function getById(userId: string) {
  try {
    const collection = await getCollection("user");
    const user = await collection.findOne({ _id: new ObjectId(userId) });
    // delete user.password;
    return user;
  } catch (err) {
    error(`while finding user ${userId}`, err);
    throw err;
  }
}
async function getByUsername(username: string) {
  try {
    const collection = await getCollection("user");
    const user = await collection.findOne({ username });
    return user;
  } catch (err) {
    error(`while finding user ${username}`, err);
    throw err;
  }
}

async function remove(userId: string) {
  try {
    const collection = await getCollection("user");
    await collection.deleteOne({ _id: new ObjectId(userId) });
  } catch (err) {
    error(`cannot remove user ${userId}`, err);
    throw err;
  }
}

async function update(user: User): Promise<User> {
  try {
    const id = new ObjectId(user._id);
    const { _id, ...userWithoutId } = user;
    const collection = await getCollection("user");
    await collection.updateOne({ _id: id }, { $set: { ...userWithoutId } });
    return { _id: id.toString(), ...userWithoutId };
  } catch (err) {
    error(`cannot update user ${user._id}`, err);
    throw err;
  }
}

async function add(user) {
  try {
    // peek only updatable fields!
    const userToAdd = {
      username: user.username,
      //   password: user.password,
      //   fullname: user.fullname,
      //   isAdmin: false,
      imgUrl:
        "https://res.cloudinary.com/dng9sfzqt/image/upload/v1681677382/user-chirper_ozii7u.png",
    };
    const collection = await getCollection("user");
    await collection.insertOne(userToAdd);
    return userToAdd;
  } catch (err) {
    error("cannot insert user", err);
    throw err;
  }
}
