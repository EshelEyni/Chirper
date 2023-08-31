import { Post } from "../../../../../../shared/interfaces/post.interface";
import { AppError } from "../../../../services/error/error.service";
import userRelationService from "../../../user/services/user-relation/user-relation.service";
import { BookmarkedPostModel } from "../../models/bookmark/bookmark-post.model";
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
    const res = await postUtilService.getPostLoggedInUserActionState(post.id);
    const currLoggedInActionState = res[post.id];
    post.loggedInUserActionState = currLoggedInActionState;
    const isFollowingMap = await userRelationService.getIsFollowing(post.createdBy.id);
    post.createdBy.isFollowing = isFollowingMap[post.createdBy.id];

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

  const res = await postUtilService.getPostLoggedInUserActionState(post.id);
  const currLoggedInActionState = res[post.id];

  post.loggedInUserActionState = currLoggedInActionState;

  const isFollowingMap = await userRelationService.getIsFollowing(post.createdBy.id);
  post.createdBy.isFollowing = isFollowingMap[post.createdBy.id];

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

  const res = await postUtilService.getPostLoggedInUserActionState(post.id);
  const currLoggedInActionState = res[post.id];

  post.loggedInUserActionState = currLoggedInActionState;

  const isFollowingMap = await userRelationService.getIsFollowing(post.createdBy.id);
  post.createdBy.isFollowing = isFollowingMap[post.createdBy.id];

  return post;
}

export default { get, add, remove };
