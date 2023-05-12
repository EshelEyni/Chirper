import { NewPost, Post } from "../../../../shared/interfaces/post.interface";
import { QueryString } from "../../services/util.service.js";

import { PostModel } from "./post.model";
import { APIFeatures } from "../../services/util.service";

// import { IAsyncLocalStorageStore } from "../../../../shared/interfaces/system.interface";
// import { asyncLocalStorage } from "../../services/als.service.js";

async function query(queryString: QueryString): Promise<Post[]> {
  const features = new APIFeatures(PostModel.find(), queryString)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const posts = await features
    .getQuery()
    .populate({
      path: "user",
      select: "_id username fullname imgUrl",
    })
    .exec();
  return posts as unknown as Post[];
}

async function getById(postId: string): Promise<Post | null> {
  const post = await PostModel.findById(postId)
    .populate({
      path: "user",
      select: "_id username fullname imgUrl",
    })
    .exec();
  return post as unknown as Post;
}

async function add(post: NewPost): Promise<Post> {
  // const store = asyncLocalStorage.getStore() as IAsyncLocalStorageStore;
  // const loggedinUser = store?.loggedinUser;

  // if (!loggedinUser) throw new Error("user not logged in");
  // if (loggedinUser._id !== post.user._id) throw new Error("cannot add post for another user");

  const savedPost = await new PostModel(post).save();
  const populatedPost = await PostModel.findById(savedPost._id)
    .populate({
      path: "user",
      select: "_id username fullname imgUrl",
    })
    .exec();

  return populatedPost as unknown as Post;
}

async function update(id: string, post: Post): Promise<Post> {
  const updatedPost = await PostModel.findByIdAndUpdate(id, post, {
    new: true,
    runValidators: true,
  });

  return updatedPost as unknown as Post;
}

async function remove(postId: string): Promise<Post> {
  const removedPost = await PostModel.findByIdAndRemove(postId);
  return removedPost as unknown as Post;
}

export default {
  query,
  getById,
  add,
  update,
  remove,
};
