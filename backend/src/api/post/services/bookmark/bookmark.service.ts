import { Post } from "../../../../../../shared/interfaces/post.interface";
import { User } from "../../../../../../shared/interfaces/user.interface";
import { AppError } from "../../../../services/error/error.service";
import followerService from "../../../user/services/follower/follower.service";
import { BookmarkedPostModel } from "../../models/bookmark-post.model";
import { PostModel } from "../../models/post.model";
import postUtilService from "../util/util.service";

async function get(loggedInUserId: string): Promise<Post[]> {
  const bookmarkedPostsDocs = await BookmarkedPostModel.find({
    bookmarkOwnerId: loggedInUserId,
  }).exec();
  const prms = bookmarkedPostsDocs.map(async doc => {
    // TODO: defince type correctly
    const obj = doc.toObject() as unknown as { post: Post };
    const { post } = obj;
    post.loggedInUserActionState = await postUtilService.getLoggedInUserActionState(post);
    await followerService.populateIsFollowing(post.createdBy as unknown as User);
    return post;
  });
  const bookmarkedPosts = await Promise.all(prms);
  return bookmarkedPosts as unknown as Post[];
}

async function add(postId: string, loggedInUserId: string): Promise<Post> {
  await new BookmarkedPostModel({
    postId,
    bookmarkOwnerId: loggedInUserId,
  }).save();
  const postDoc = await PostModel.findById(postId);
  if (!postDoc) throw new AppError("post not found", 404);
  const updatedPost = postDoc.toObject() as unknown as Post;
  updatedPost.loggedInUserActionState = await postUtilService.getLoggedInUserActionState(
    updatedPost
  );
  await followerService.populateIsFollowing(updatedPost.createdBy as unknown as User);

  return updatedPost;
}

async function remove(postId: string, loggedInUserId: string): Promise<Post> {
  await BookmarkedPostModel.findOneAndRemove({
    postId,
    bookmarkOwnerId: loggedInUserId,
  });

  const postDoc = await PostModel.findById(postId);
  if (!postDoc) throw new AppError("post not found", 404);
  const updatedPost = postDoc.toObject() as unknown as Post;
  updatedPost.loggedInUserActionState = await postUtilService.getLoggedInUserActionState(
    updatedPost
  );
  await followerService.populateIsFollowing(updatedPost.createdBy as unknown as User);

  return updatedPost;
}

export default { get, add, remove };
