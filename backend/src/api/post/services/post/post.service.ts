import { Post, NewPost, PostReplyResult } from "../../../../../../shared/interfaces/post.interface";
import { APIFeatures, QueryObj } from "../../../../services/util/util.service";
import { IPostDoc, PostModel } from "../../models/post/post.model";
import mongoose from "mongoose";
import { AppError } from "../../../../services/error/error.service";
import userRelationService from "../../../user/services/user-relation/user-relation.service";
import postUtilService, { loggedInUserActionDefaultState } from "../util/util.service";
import pollService from "../poll/poll.service";
import { RepostModel } from "../../models/repost/repost.model";
import promotionalPostsService from "../promotional-posts/promotional-posts.service";

async function query(queryString: QueryObj): Promise<Post[]> {
  const features = new APIFeatures(PostModel.find({}), queryString)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const posts = (await features.getQuery().exec()) as unknown as IPostDoc[];
  const reposts = await RepostModel.find({});
  const promotionalPosts = await promotionalPostsService.get();

  const combinedPosts = [...posts, ...reposts].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  // Insert promotional posts every 10 items
  const p = [];
  for (let i = 0; i < combinedPosts.length; i++) {
    p.push(combinedPosts[i]);
    if ((i + 1) % 10 === 0 && promotionalPosts.length > 0) {
      const promoPost = promotionalPosts.shift();
      if (promoPost) p.push(promoPost);
    }
  }

  return p as unknown as Post[];
}

async function getById(postId: string): Promise<Post | null> {
  const postDoc = await PostModel.findById(postId).exec();
  if (!postDoc) return null;
  const post = postDoc.toObject() as unknown as Post;
  await pollService.getLoggedInUserPollDetails(post);
  const res = await postUtilService.getPostLoggedInUserActionState(post.id);
  const currLoggedInActionState = res[post.id];

  post.loggedInUserActionState = currLoggedInActionState
    ? currLoggedInActionState
    : loggedInUserActionDefaultState;

  const isFollowingMap = await userRelationService.getIsFollowing(post.createdBy.id);
  post.createdBy.isFollowing = isFollowingMap[post.createdBy.id];
  return post;
}

async function add(post: NewPost): Promise<Post> {
  const savedPost = await new PostModel(post).save();
  const postDoc = await PostModel.findById(savedPost.id).exec();
  if (!postDoc) throw new AppError("post not found", 404);
  const populatedPost = postDoc.toObject() as unknown as Post;
  populatedPost.loggedInUserActionState = loggedInUserActionDefaultState;

  const isFollowingMap = await userRelationService.getIsFollowing(populatedPost.createdBy.id);
  populatedPost.createdBy.isFollowing = isFollowingMap[populatedPost.createdBy.id];

  return populatedPost as unknown as Post;
}

async function addMany(posts: NewPost[]): Promise<Post> {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const savedThread: Post[] = [];
    for (let i = 0; i < posts.length; i++) {
      const currPost = posts[i];
      if (i === 0) currPost.repliesCount = 1;
      else currPost.parentPostId = savedThread[i - 1].id;

      const savedPost = await new PostModel(currPost).save({ session });
      savedThread.push(savedPost as unknown as Post);
    }
    await session.commitTransaction();
    const [originalPost] = savedThread;
    const postDoc = await PostModel.findById(originalPost.id).exec();
    if (!postDoc) throw new AppError("post not found", 404);
    const populatedPost = postDoc.toObject() as unknown as Post;
    populatedPost.loggedInUserActionState = loggedInUserActionDefaultState;
    populatedPost.createdBy.isFollowing = false;
    return populatedPost as unknown as Post;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}

async function addReply(replyPost: NewPost): Promise<PostReplyResult> {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const savedReply = await new PostModel(replyPost).save({ session });
    const repliedToPostDoc = await PostModel.findByIdAndUpdate(
      replyPost.repliedPostDetails?.at(-1)?.postId,
      { $inc: { repliesCount: 1 } },
      { session, new: true }
    );
    if (!repliedToPostDoc) throw new AppError("post not found", 404);
    await session.commitTransaction();
    const updatedPost = repliedToPostDoc.toObject() as unknown as Post;
    const res = await postUtilService.getPostLoggedInUserActionState(updatedPost.id);
    const currLoggedInActionState = res[updatedPost.id];

    updatedPost.loggedInUserActionState = currLoggedInActionState;

    const isFollowingMap = await userRelationService.getIsFollowing(updatedPost.createdBy.id);
    updatedPost.createdBy.isFollowing = isFollowingMap[updatedPost.createdBy.id];

    const replyDoc = await PostModel.findById(savedReply.id).exec();
    if (!replyDoc) throw new AppError("reply post not found", 404);
    const reply = replyDoc.toObject() as unknown as Post;
    reply.loggedInUserActionState = loggedInUserActionDefaultState;
    reply.createdBy.isFollowing = false;
    return { updatedPost, reply };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}

async function update(id: string, post: Post): Promise<Post> {
  // TODO: add guard that user can only update his own posts
  const postDoc = await PostModel.findByIdAndUpdate(id, post, {
    new: true,
    runValidators: true,
  }).exec();

  if (!postDoc) throw new AppError("post not found", 404);
  const updatedPost = postDoc.toObject() as unknown as Post;
  await pollService.getLoggedInUserPollDetails(updatedPost);

  const res = await postUtilService.getPostLoggedInUserActionState(updatedPost.id);
  const currLoggedInActionState = res[updatedPost.id];

  updatedPost.loggedInUserActionState = currLoggedInActionState;

  const isFollowingMap = await userRelationService.getIsFollowing(updatedPost.createdBy.id);
  updatedPost.createdBy.isFollowing = isFollowingMap[updatedPost.createdBy.id];

  return updatedPost;
}

async function remove(postId: string): Promise<Post> {
  const removedPost = await PostModel.findByIdAndRemove(postId);
  return removedPost as unknown as Post;
}

export default {
  query,
  getById,
  add,
  addMany,
  addReply,
  update,
  remove,
};

// let repostDocs = await RepostModel.find({})
//   .populate("post")
//   .populate(postUtilService.populateRepostedBy())
//   .exec();

// // TODO: refactor this, can be in one map function
// repostDocs = repostDocs.map(doc => doc.toObject());

// const reposts = repostDocs.map((doc: any) => {
//   const { createdAt, updatedAt, post, repostedBy } = doc;

//   return {
//     ...post,
//     repostedBy,
//     createdAt,
//     updatedAt,
//   };
// });
