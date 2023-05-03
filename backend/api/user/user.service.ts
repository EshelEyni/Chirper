import { User } from "../../../shared/interfaces/user.interface";
import { getCollection } from "../../services/db.service";
import { logger } from "../../services/logger.service";
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
    logger.error("cannot find users", err as Error);
    throw err;
  }
}

async function getById(userId: string): Promise<User> {
  try {
    const collection = await getCollection("user");
    const user = await collection.findOne({ _id: new ObjectId(userId) });

    if (!user) {
      throw new Error(`User not found: ${userId}`);
    }

    delete user.password;
    return user as unknown as User;
  } catch (err) {
    logger.error(`while finding user ${userId}`, err as Error);
    throw err;
  }
}

async function getByUsername(username: string) {
  try {
    const collection = await getCollection("user");
    const user = await collection.findOne({ username });
    return user;
  } catch (err) {
    logger.error(`while finding user ${username}`, err as Error);
    throw err;
  }
}

async function remove(userId: string) {
  try {
    const collection = await getCollection("user");
    await collection.deleteOne({ _id: new ObjectId(userId) });
  } catch (err) {
    logger.error(`cannot remove user ${userId}`, err as Error);
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
    logger.error(`cannot update user ${user._id}`, err as Error);
    throw err;
  }
}

async function add(user: User): Promise<User> {
  try {
    // peek only updatable fields!
    const userToAdd = {
      username: user.username,
      password: user.password,
      fullname: user.fullname,
      isAdmin: false,
      isVerified: false,
      isApprovedLocation: false,
      imgUrl:
        "https://res.cloudinary.com/dng9sfzqt/image/upload/v1681677382/user-chirper_ozii7u.png",
      createdAt: Date.now(),
    };
    const collection = await getCollection("user");
    const { insertedId } = await collection.insertOne(userToAdd);
    return { _id: insertedId.toString(), ...userToAdd };
  } catch (err) {
    logger.error("cannot insert user", err as Error);
    throw err;
  }
}
