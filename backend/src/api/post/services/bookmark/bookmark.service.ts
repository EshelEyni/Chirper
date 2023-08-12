import { Post } from "../../../../../../shared/interfaces/post.interface";
import { User } from "../../../../../../shared/interfaces/user.interface";
import { AppError } from "../../../../services/error/error.service";
import followerService from "../../../user/services/follower/follower.service";
import { BookmarkedPostModel } from "../../models/bookmark-post.model";
import postUtilService from "../util/util.service";

type bookmarkedPostDoc = {
  post: Post;
  bookmarkOwnerId: string;
};

async function get(loggedInUserId: string): Promise<Post[]> {
  const bookmarkedPostsDocs = await BookmarkedPostModel.find({
    bookmarkOwnerId: loggedInUserId,
  })
    .exec()
    .then(docs => docs.map(doc => doc.toObject()));

  const prms = bookmarkedPostsDocs.map(async doc => {
    const { post } = doc as unknown as bookmarkedPostDoc;
    post.loggedInUserActionState = await postUtilService.getLoggedInUserActionState(post);
    post.createdBy.isFollowing = await followerService.getIsFollowing(
      post.createdBy as unknown as User
    );
    return post;
  });
  const bookmarkedPosts = await Promise.all(prms);
  return bookmarkedPosts as unknown as Post[];
}

async function add(postId: string, loggedInUserId: string): Promise<Post> {
  const bookmarkPost = (
    await BookmarkedPostModel.create({
      postId,
      bookmarkOwnerId: loggedInUserId,
    })
  ).toObject() as unknown as bookmarkedPostDoc;

  const { post } = bookmarkPost;
  post.loggedInUserActionState = await postUtilService.getLoggedInUserActionState(post);
  post.createdBy.isFollowing = await followerService.getIsFollowing(
    post.createdBy as unknown as User
  );

  return post;
}

async function remove(postId: string, loggedInUserId: string): Promise<Post> {
  const bookmarkPost = (
    await BookmarkedPostModel.findOneAndRemove({
      postId,
      bookmarkOwnerId: loggedInUserId,
    })
  )?.toObject() as unknown as bookmarkedPostDoc;

  if (!bookmarkPost) throw new AppError("This Post is not Bookmarked", 404);
  const { post } = bookmarkPost;
  post.loggedInUserActionState = await postUtilService.getLoggedInUserActionState(post);
  post.createdBy.isFollowing = await followerService.getIsFollowing(
    post.createdBy as unknown as User
  );
  return post;
}

export default { get, add, remove };
