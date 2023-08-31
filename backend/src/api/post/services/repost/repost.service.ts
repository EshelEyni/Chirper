import mongoose from "mongoose";
import { RepostModel } from "../../models/repost.model";
import { PostModel } from "../../models/post.model";
import { AppError } from "../../../../services/error/error.service";
import userRelationService from "../../../user/services/user-relation/user-relation.service";
import { logger } from "../../../../services/logger/logger.service";
import { Post, PostRepostResult } from "../../../../../../shared/interfaces/post.interface";
import postUtilService from "../util/util.service";

async function add(postId: string, loggedInUserId: string): Promise<PostRepostResult> {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const savedRepost = await new RepostModel({
      postId,
      repostOwnerId: loggedInUserId,
    }).save({ session });

    const repostedPostDoc = await PostModel.findByIdAndUpdate(
      postId,
      { $inc: { repostsCount: 1 } },
      { session, new: true }
    );
    if (!repostedPostDoc) throw new AppError("post not found", 404);
    await session.commitTransaction();
    const updatedPost = repostedPostDoc.toObject() as unknown as Post;

    const res = await postUtilService.getPostLoggedInUserActionState(updatedPost.id);
    const currLoggedInActionState = res[updatedPost.id];

    updatedPost.loggedInUserActionState = currLoggedInActionState;

    const isFollowingMap = await userRelationService.getIsFollowing(updatedPost.createdBy.id);
    updatedPost.createdBy.isFollowing = isFollowingMap[updatedPost.createdBy.id];

    const repostDoc = await RepostModel.findById(savedRepost.id)
      .populate("post")
      .populate(postUtilService.populateRepostedBy())
      .exec();

    if (!repostDoc) throw new AppError("repost not found", 404);
    const repostObj = repostDoc.toObject() as unknown as any;

    const { createdAt, updatedAt, post, repostedBy } = repostObj;
    post.createdBy.isFollowing = false;
    const repost = {
      ...post,
      createdAt,
      updatedAt,
      repostedBy,
    } as unknown as Post;

    const res2 = await postUtilService.getPostLoggedInUserActionState(repost.id);
    const currLoggedInActionState2 = res2[repost.id];

    repost.loggedInUserActionState = currLoggedInActionState2;

    return { updatedPost, repost };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}

async function remove(postId: string, loggedInUserId: string): Promise<Post> {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await RepostModel.findOneAndRemove({
      postId,
      repostOwnerId: loggedInUserId,
    }).session(session);

    const postDoc = await PostModel.findByIdAndUpdate(
      postId,
      { $inc: { repostsCount: -1 } },
      { session, new: true }
    );
    if (!postDoc) throw new AppError("post not found", 404);
    await session.commitTransaction();

    const updatedPost = postDoc.toObject() as unknown as Post;
    const res = await postUtilService.getPostLoggedInUserActionState(updatedPost.id);
    const currLoggedInActionState = res[updatedPost.id];
    updatedPost.loggedInUserActionState = currLoggedInActionState;

    const isFollowingMap = await userRelationService.getIsFollowing(updatedPost.createdBy.id);
    updatedPost.createdBy.isFollowing = isFollowingMap[updatedPost.createdBy.id];

    logger.warn(`Deleted repost of Post With ${postId} by user ${loggedInUserId}`);

    return updatedPost;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}

export default { add, remove };
