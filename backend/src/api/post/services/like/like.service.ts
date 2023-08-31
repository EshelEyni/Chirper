import mongoose from "mongoose";
import { PostLikeModel } from "../../models/post-like.model";
import { PostModel } from "../../models/post/post.model";
import { AppError } from "../../../../services/error/error.service";
import { Post } from "../../../../../../shared/interfaces/post.interface";
import userRelationService from "../../../user/services/user-relation/user-relation.service";
import postUtilService from "../util/util.service";

async function add(postId: string, userId: string): Promise<Post> {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await new PostLikeModel({
      postId,
      userId,
    }).save({ session });

    const postDoc = await PostModel.findByIdAndUpdate(
      postId,
      { $inc: { likesCount: 1 } },
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

    return updatedPost;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}

async function remove(postId: string, userId: string): Promise<Post> {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await PostLikeModel.findOneAndDelete({
      postId,
      userId,
    }).session(session);

    const postDoc = await PostModel.findByIdAndUpdate(
      postId,
      { $inc: { likesCount: -1 } }
      // { session, new: true }
    ).session(session);

    if (!postDoc) throw new AppError("post not found", 404);
    await session.commitTransaction();

    const updatedPost = postDoc.toObject() as unknown as Post;

    const res = await postUtilService.getPostLoggedInUserActionState(updatedPost.id);
    const currLoggedInActionState = res[updatedPost.id];
    updatedPost.loggedInUserActionState = currLoggedInActionState;

    const isFollowingMap = await userRelationService.getIsFollowing(updatedPost.createdBy.id);
    updatedPost.createdBy.isFollowing = isFollowingMap[updatedPost.createdBy.id];

    return updatedPost;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}

export default { add, remove };
