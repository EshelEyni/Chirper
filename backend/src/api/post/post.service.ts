import { NewPost, Post, PostDocument } from "../../../../shared/interfaces/post.interface";
import { ObjectId } from "mongodb";
import { QueryString } from "../../services/util.service.js";

const { getCollection } = require("../../services/db.service");
const { logger } = require("../../services/logger.service");
const PostModel = require("./post.model");
const UserModel = require("../user/user.model");
const { APIFeatures } = require("../../services/util.service");
const { getMiniUser } = require("../../services/util.service");

// import { IAsyncLocalStorageStore } from "../../../../shared/interfaces/system.interface";
// import { asyncLocalStorage } from "../../services/als.service.js";
interface PostWithUser extends PostDocument {
  user: any;
}

const collectionName = "posts";

async function query(queryString: QueryString): Promise<Post[]> {
  try {
    const features = new APIFeatures(PostModel.find(), queryString).filter().sort().limitFields().paginate();

    let postDocs = await features.query;
    let posts = postDocs.map((postDoc: PostDocument) => postDoc.toObject());

    const postsWithUser: PostWithUser[] = [];

    for (const post of posts) {
      const user = await UserModel.findById(post.userId);
      if (!user) throw new Error("user not found");
      const miniUser = getMiniUser(user.toObject());
      const postWithUser = { ...post, user: miniUser };
      postsWithUser.push(postWithUser);
    }

    return postsWithUser as unknown as Post[];
  } catch (err) {
    logger.error("cannot find posts", err as Error);
    throw err;
  }
}

async function getById(postId: string): Promise<Post | null> {
  try {
    const postDoc = await PostModel.findById(postId);
    if (!postDoc) return null;
    const post = postDoc.toObject();
    const userDoc = await UserModel.findById(post.userId);
    if (!userDoc) throw new Error("user not found");
    const miniUser = getMiniUser(userDoc.toObject());
    const postWithUser = { ...post, user: miniUser };
    return postWithUser as unknown as Post;
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
    const newPost = new PostModel(post);
    const savedPost = await newPost.save();
    return savedPost as unknown as Post;
  } catch (err) {
    logger.error("cannot insert post", err as Error);
    throw err;
  }
}

async function update(id: string, post: Post): Promise<Post> {
  try {
    const postDoc = await PostModel.findByIdAndUpdate(id, post, { new: true, runValidators: true });
    if (!postDoc) throw new Error("post not found");
    return postDoc.toObject() as unknown as Post;
  } catch (err) {
    logger.error(`cannot update post ${post._id}`, err as Error);
    throw err;
  }
}

async function remove(postId: string): Promise<void> {
  try {
    const postDoc = await PostModel.findByIdAndRemove(postId);
    if (!postDoc) throw new Error("post not found");
   
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
