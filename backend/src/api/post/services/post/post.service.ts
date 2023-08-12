import { Post, NewPost, PostReplyResult } from "../../../../../../shared/interfaces/post.interface";
import { APIFeatures, QueryObj } from "../../../../services/util/util.service";
import { PostModel } from "../../models/post.model";
import { RepostModel } from "../../models/repost.model";
import mongoose, { Document } from "mongoose";
import { AppError } from "../../../../services/error/error.service";
import { User } from "../../../../../../shared/interfaces/user.interface";
import followerService from "../../../user/services/follower/follower.service";
import postUtilService from "../util/util.service";
import pollService from "../poll/poll.service";

async function query(queryString: QueryObj): Promise<Post[]> {
  const features = new APIFeatures(PostModel.find(), queryString)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const postDocs = (await features.getQuery().exec()) as unknown as Document[];
  let posts = postDocs.map(post => post.toObject()) as unknown as Post[];

  let repostDocs = await RepostModel.find({})
    .populate("post")
    .populate(postUtilService.populateRepostedBy())
    .exec();

  // TODO: refactor this, can be in one map function
  repostDocs = repostDocs.map(doc => doc.toObject());

  const reposts = repostDocs.map((doc: any) => {
    const { createdAt, updatedAt, post, repostedBy } = doc;

    return {
      ...post,
      repostedBy,
      createdAt,
      updatedAt,
    };
  });

  posts = [...posts, ...reposts]
    .filter(post => post.createdBy !== null)
    .sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const getLoggedInUserActionStatePrms = posts.map(async post => {
    post.loggedInUserActionState = await postUtilService.getLoggedInUserActionState(post);
  });
  await Promise.all(getLoggedInUserActionStatePrms);

  const setIsFollowingPrms = posts.map(async post => {
    await followerService.populateIsFollowing(post.createdBy as unknown as User);
  });
  await Promise.all(setIsFollowingPrms);

  if (posts.length > 0) {
    await pollService.getLoggedInUserPollDetails(...(posts as unknown as Post[]));
  }
  return posts as unknown as Post[];
}

async function getById(postId: string): Promise<Post | null> {
  const postDoc = await PostModel.findById(postId).exec();
  if (!postDoc) return null;
  const post = postDoc.toObject() as unknown as Post;
  await pollService.getLoggedInUserPollDetails(post);
  post.loggedInUserActionState = await postUtilService.getLoggedInUserActionState(post);
  await followerService.populateIsFollowing(post.createdBy as unknown as User);
  return post;
}

async function add(post: NewPost): Promise<Post> {
  const savedPost = await new PostModel(post).save();
  const postDoc = await PostModel.findById(savedPost.id).exec();
  if (!postDoc) throw new AppError("post not found", 404);
  const populatedPost = postDoc.toObject() as unknown as Post;
  populatedPost.loggedInUserActionState = await postUtilService.getLoggedInUserActionState(
    populatedPost,
    { isDefault: true }
  );
  await followerService.populateIsFollowing(populatedPost.createdBy as unknown as User);
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
      else currPost.previousThreadPostId = savedThread[i - 1].id;

      const savedPost = await new PostModel(currPost).save({ session });
      savedThread.push(savedPost as unknown as Post);
    }
    await session.commitTransaction();
    const [originalPost] = savedThread;
    const postDoc = await PostModel.findById(originalPost.id).exec();
    if (!postDoc) throw new AppError("post not found", 404);
    const populatedPost = postDoc.toObject() as unknown as Post;
    populatedPost.loggedInUserActionState = await postUtilService.getLoggedInUserActionState(
      populatedPost,
      { isDefault: true }
    );
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
    updatedPost.loggedInUserActionState = await postUtilService.getLoggedInUserActionState(
      updatedPost
    );
    await followerService.populateIsFollowing(updatedPost.createdBy as unknown as User);
    const replyDoc = await PostModel.findById(savedReply.id).exec();
    if (!replyDoc) throw new AppError("reply post not found", 404);
    const reply = replyDoc.toObject() as unknown as Post;
    reply.loggedInUserActionState = await postUtilService.getLoggedInUserActionState(reply, {
      isDefault: true,
    });
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
  const postDoc = await PostModel.findByIdAndUpdate(id, post, {
    new: true,
    runValidators: true,
  }).exec();

  if (!postDoc) throw new AppError("post not found", 404);
  const updatedPost = postDoc.toObject() as unknown as Post;
  await pollService.getLoggedInUserPollDetails(updatedPost);
  updatedPost.loggedInUserActionState = await postUtilService.getLoggedInUserActionState(
    updatedPost
  );
  await followerService.populateIsFollowing(updatedPost.createdBy as unknown as User);
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
