import { NewPost, Post } from "../../../shared/interfaces/post.interface";
import { IAsyncLocalStorageStore } from "../../../shared/interfaces/system.interface";
import { getCollection } from "../../services/db.service";
import { logger } from "../../services/logger.service";
import { ObjectId } from "mongodb";
import { asyncLocalStorage } from "../../services/als.service";


const collectionName = "posts";


async function query(): Promise<Post[]> {
  try {
    const postCollection = await getCollection(collectionName);
    const userCollection = await getCollection("users");
    let posts = await postCollection.find({}).toArray();
    if (!posts.length) return [];

    const prms = posts.map(async (post) => {
      post.user = await userCollection.findOne({
        _id: new ObjectId(post.userId),
      });
      delete post.userId;
      return post;
    });

    posts = await Promise.all(prms);

    return posts as unknown as Post[];
  } catch (err) {
    logger.error("cannot find posts", err as Error);
    throw err;
  }
}

async function getById(postId: string): Promise<Post | null> {
  try {
    const collection = await getCollection(collectionName);
    const post = await collection.findOne({ _id: new ObjectId(postId) });
    if (!post) return null;
    // post.createdAt = new ObjectId(post._id).getTimestamp();
    return post as unknown as Post;
  } catch (err) {
    logger.error(`while finding post ${postId}`, err as Error);
    throw err;
  }
}

async function add(post: NewPost): Promise<Post> {
  const store = asyncLocalStorage.getStore() as IAsyncLocalStorageStore;
  const loggedinUser = store?.loggedinUser;

  if (!loggedinUser) throw new Error("user not logged in");
  if (loggedinUser._id !== post.user._id) throw new Error("cannot add post for another user");

  const postData = {
    text: post.text,
    createdAt: Date.now(),
    commentSum: 0,
    rechirps: 0,
    likes: 0,
    views: 0,
    isPublic: post.isPublic,
    imgUrls: post.imgUrls,
    videoUrl: post.videoUrl,
    gifUrl: post.gifUrl,
    poll: post.poll,
    schedule: post.schedule,
    location: post.location,
    audience: post.audience,
    repliersType: post.repliersType,
    userId: post.user._id,
  };

  try {
    const collection = await getCollection(collectionName);
    const { insertedId } = await collection.insertOne(postData);
    const { userId, ...postDataWithoutUserId } = postData;
    const savedPost = {
      _id: insertedId.toString(),
      ...postDataWithoutUserId,
      user: post.user,
    };
    return savedPost;
  } catch (err) {
    logger.error("cannot insert post", err as Error);
    throw err;
  }
}

async function update(post: Post): Promise<Post> {
  try {
    const id = new ObjectId(post._id);
    const { _id, ...postWithoutId } = post;
    const collection = await getCollection(collectionName);
    await collection.updateOne({ _id: id }, { $set: { ...postWithoutId } });

    return { _id: id.toString(), ...postWithoutId };
  } catch (err) {
    logger.error(`cannot update post ${post._id}`, err as Error);
    throw err;
  }
}

async function remove(postId: string): Promise<string> {
  try {
    const collection = await getCollection(collectionName);
    await collection.deleteOne({ _id: new ObjectId(postId) });
    return postId;
  } catch (err) {
    logger.error(`cannot remove post ${postId}`, err as Error);
    throw err;
  }
}

export const postService = {
  query,
  getById,
  remove,
  add,
  update,
};
