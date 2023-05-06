import { NewPost, Post, PostDocument } from "../../../../shared/interfaces/post.interface";
import { QueryString } from "../../services/util.service.js";

const { logger } = require("../../services/logger.service");
const { PostModel } = require("./post.model");
const UserModel = require("../user/user.model");
const { APIFeatures } = require("../../services/util.service");
const { getMiniUser } = require("../../services/util.service");

// import { IAsyncLocalStorageStore } from "../../../../shared/interfaces/system.interface";
// import { asyncLocalStorage } from "../../services/als.service.js";

async function query(queryString: QueryString): Promise<Post[]> {
  try {
    const features = new APIFeatures(PostModel.find(), queryString).filter().sort().limitFields().paginate();

    const posts = await features.query
      .populate({
        path: "user",
        select: "_id username fullname imgUrl",
      })
      .exec();
    return posts as unknown as Post[];
  } catch (err) {
    logger.error("cannot find posts", err as Error);
    throw err;
  }
}

async function getById(postId: string): Promise<Post | null> {
  try {
    const post = await PostModel.findById(postId)
      .populate({
        path: "user",
        select: "_id username fullname imgUrl",
      })
      .exec();
    return post as unknown as Post;
  } catch (err) {
    logger.error(`while finding post ${postId}`, err as Error);
    throw err;
  }
}

async function add(post: NewPost): Promise<Post> {
  // const store = asyncLocalStorage.getStore() as IAsyncLocalStorageStore;
  // const loggedinUser = store?.loggedinUser;

  // if (!loggedinUser) throw new Error("user not logged in");
  // if (loggedinUser._id !== post.user._id) throw new Error("cannot add post for another user");

  try {
    const savedPost = await PostModel(post).save();
    const populatedPost = await PostModel.findById(savedPost._id)
      .populate({
        path: "user",
        select: "_id username fullname imgUrl",
      })
      .exec();

    return populatedPost as unknown as Post;
  } catch (err) {
    logger.error("cannot insert post", err as Error);
    throw err;
  }
}

async function update(id: string, post: Post): Promise<Post> {
  try {
    const updatedPost = await PostModel.findByIdAndUpdate(id, post, { new: true, runValidators: true });

    return updatedPost as unknown as Post;
  } catch (err) {
    logger.error(`cannot update post ${post.id}`, err as Error);
    throw err;
  }
}

async function remove(postId: string): Promise<void> {
  try {
    await PostModel.findByIdAndRemove(postId);
    logger.warn("Post removed ", postId);
  } catch (err) {
    logger.error(`cannot remove post ${postId}`, err as Error);
    throw err;
  }
}

module.exports = {
  query,
  getById,
  add,
  update,
  remove,
};
