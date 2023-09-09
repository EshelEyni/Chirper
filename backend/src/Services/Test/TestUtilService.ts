/* eslint-disable @typescript-eslint/no-explicit-any */
require("dotenv").config();
import mongoose from "mongoose";
import { Post, PromotionalPost } from "../../../../shared/types/post.interface";
import { User, UserCredenitials } from "../../../../shared/types/user.interface";
import tokenService from "../token/tokenService";
import { UserModel } from "../../models/user/userModel";
import { PostModel } from "../../models/post/postModel";
import { RepostModel } from "../../models/repost/repostModel";
import { PostLikeModel } from "../../models/postLike/postLikeModel";
import { PostStatsModel } from "../../models/postStats/postStatsModel";
import { PollVoteModel } from "../../models/pollVote/pollVoteModel";
import { PromotionalPostModel } from "../../models/promotionalPost/promotionalPostModel";
import { PostBookmarkModel } from "../../models/postBookmark/postBookmarkModel";
import { MockOMDBMovieResponse } from "../../types/Test";

type CreateTestUserOptions = {
  id?: string;
  isAdmin?: boolean;
  isBot?: boolean;
};

type CreateTestPostOptions = {
  id?: string;
  createdById?: string;
  body?: any;
  skipHooks?: boolean;
};

type RepostParams = {
  postId: string;
  userId: string;
};

type CreatePostRefDocParams = {
  postId: string;
  userId: string;
};

type CreatePollVoteParams = {
  postId: string;
  userId: string;
  optionIdx: number;
};

async function createManyTestUsers(numOfUsers: number): Promise<User[]> {
  const ids = Array.from({ length: numOfUsers }, () => getMongoId());
  await UserModel.deleteMany({ _id: { $in: ids } });

  const userCreds = ids.map(id => createValidUserCreds(id));

  const users = await UserModel.create(userCreds).then(docs => docs.map(doc => doc.toObject()));
  return users as unknown as User[];
}

async function deleteManyTestUsers(ids: string[]) {
  await UserModel.deleteMany({ _id: { $in: ids } });
}

async function createTestUser({
  id,
  isAdmin = false,
  isBot = false,
}: CreateTestUserOptions = {}): Promise<User> {
  const validId = id || getMongoId();
  await UserModel.findByIdAndDelete(validId).setOptions({ active: false });
  const user = createValidUserCreds(validId) as User;
  if (isAdmin) user.isAdmin = true;
  if (isBot) user.isBot = true;
  return (await UserModel.create(user)).toObject() as unknown as User;
}

async function deleteTestUser(id: string) {
  await UserModel.findByIdAndDelete(id).setOptions({ active: false });
}

async function createManyTestPosts({
  numOfPosts,
  createdByIds,
}: {
  numOfPosts?: number;
  createdByIds?: string[];
}): Promise<Post[]> {
  const length = numOfPosts || createdByIds?.length || 2;
  const ids = Array.from({ length }, () => getMongoId());
  await PostModel.deleteMany({ _id: { $in: ids } });

  const postBodies: any[] = [];
  const defaultUserId = !createdByIds ? (await createTestUser({})).id : undefined;

  for (const id of ids) {
    const createdById = createdByIds?.[ids.indexOf(id)] || defaultUserId;
    postBodies.push({
      _id: id,
      createdById,
      text: "test post",
    });
  }

  const posts = await PostModel.create(postBodies).then(docs => docs.map(doc => doc.toObject()));
  return posts as unknown as Post[];
}

async function deleteManyTestPosts(ids: string[]) {
  const createdByIds = (await PostModel.find({ _id: { $in: ids } })
    .lean()
    .select({
      createdById: 1,
    })
    .setOptions({ skipHooks: true })) as unknown as { createdById: string }[];

  const deletedPosts = (await PostModel.deleteMany({ _id: { $in: ids } })) as unknown as Post[];
  if (!deletedPosts) return;
  await UserModel.deleteMany({ _id: { $in: createdByIds.map(({ createdById }) => createdById) } });
}

async function createTestPost({
  id,
  createdById,
  body,
  skipHooks = false,
}: CreateTestPostOptions = {}): Promise<Post> {
  await PostModel.findByIdAndDelete(id);
  return (
    await PostModel.create({
      _id: id || getMongoId(),
      createdById: createdById || (await createTestUser({})).id,
      text: "test post",
      ...body,
      skipHooks,
    })
  )?.toObject() as unknown as Post;
}

async function deleteTestPost(id: string) {
  const deletedPost = await PostModel.findById(id);
  await PostModel.findByIdAndDelete(id);
  if (!deletedPost) return;
  await UserModel.findByIdAndUpdate(deletedPost.createdById);
}

async function createManyTestPromotionalPosts({
  numOfPosts,
  createdByIds,
}: {
  numOfPosts?: number;
  createdByIds?: string[];
}): Promise<PromotionalPost[]> {
  const length = numOfPosts || createdByIds?.length || 2;
  const ids = Array.from({ length }, () => getMongoId());
  await PromotionalPostModel.deleteMany({ _id: { $in: ids } });

  const postBodies: any[] = [];
  const defaultUserId = !createdByIds ? (await createTestUser({})).id : undefined;

  for (const id of ids) {
    const createdById = createdByIds?.[ids.indexOf(id)] || defaultUserId;
    postBodies.push({
      _id: id,
      createdById,
      text: "test post",
      companyName: "test company",
      linkToSite: "test link",
    });
  }

  const posts = await PromotionalPostModel.create(postBodies).then(docs =>
    docs.map(doc => doc.toObject())
  );
  return posts as unknown as PromotionalPost[];
}

async function createTestPromotionalPost({
  id,
  createdById,
  body,
  skipHooks = false,
}: CreateTestPostOptions = {}): Promise<PromotionalPost> {
  await PromotionalPostModel.findByIdAndDelete(id).setOptions({ skipHooks: true });
  return (await PromotionalPostModel.create({
    _id: id || getMongoId(),
    createdById: createdById || (await createTestUser({})).id,
    text: "test post",
    companyName: "test company",
    linkToSite: "test link",
    ...body,
    skipHooks,
  })) as unknown as PromotionalPost;
}

async function createTestReposts(...repostDetails: RepostParams[]) {
  await RepostModel.deleteMany({});
  const reposts = await RepostModel.create(repostDetails);
  return reposts;
}

async function createTestLike(...likeDetails: CreatePostRefDocParams[]): Promise<any> {
  await PostLikeModel.deleteMany({});
  const likes = await PostLikeModel.create(likeDetails);
  return likes;
}

async function createTestPostStats(...viewDetails: CreatePostRefDocParams[]) {
  await PostStatsModel.deleteMany({});
  const views = await PostStatsModel.create(viewDetails);
  return views;
}

async function createTestBookmark(bookmarkDetails: CreatePostRefDocParams) {
  await PostBookmarkModel.deleteMany({});
  return await PostBookmarkModel.create(bookmarkDetails);
}

async function createManyTestBookmarks(...bookmarkDetails: CreatePostRefDocParams[]) {
  await PostBookmarkModel.deleteMany({});
  return await PostBookmarkModel.create(bookmarkDetails);
}

function getMongoId() {
  return new mongoose.Types.ObjectId().toHexString();
}

function createValidUserCreds(id?: string): UserCredenitials {
  function makeId(length = 10): string {
    let txt = "";
    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 0; i < length; i++) {
      txt += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return txt;
  }
  const username = "testUser_" + makeId();
  const password = "password";
  return {
    _id: id || getMongoId(),
    username: username,
    fullname: "Test User",
    email: `${username}@testemail.com`,
    password,
    passwordConfirm: password,
  } as UserCredenitials;
}

function createTestPoll({
  options,
  length,
}: {
  options?: { text: string }[];
  length?: { days?: number; hours?: number; minutes?: number };
}) {
  const defaultOptions = [{ text: "option 1" }, { text: "option 2" }];

  const defaultLength = {
    days: 1,
    hours: 0,
    minutes: 0,
  };

  const poll = {
    options: options || defaultOptions,
    length: length || defaultLength,
  };

  return poll;
}

async function createTestPollVote(...polVote: CreatePollVoteParams[]): Promise<void> {
  await PollVoteModel.create(polVote);
}

function createTestGif({
  category,
  url,
  staticUrl,
  description,
  size,
  placeholderUrl,
  staticPlaceholderUrl,
}: {
  category?: string;
  url?: string;
  staticUrl?: string;
  description?: string;
  size?: { height: number; width: number };
  placeholderUrl?: string;
  staticPlaceholderUrl?: string;
} = {}) {
  return {
    category: category || "Agree",
    url: url || "test url",
    staticUrl: staticUrl || "test static url",
    description: description || "test description",
    size: size || { height: 100, width: 100 },
    placeholderUrl: placeholderUrl || "test placeholder url",
    staticPlaceholderUrl: staticPlaceholderUrl || "test static placeholder url",
  };
}

function getLoginTokenStrForTest(validUserId: string) {
  const token = tokenService.signToken(validUserId);
  return `loginToken=${token}`;
}

function getMockedUser({
  id,
  isBot = false,
}: {
  id?: string | mongoose.Types.ObjectId;
  isBot?: boolean;
} = {}) {
  return {
    _id: id?.toString() || getMongoId(),
    username: "test1",
    email: "email@email.com",
    fullname: "fullname1",
    imgUrl: "imgUrl1",
    isApprovedLocation: true,
    active: true,
    isBot,
    toObject: jest.fn().mockReturnThis(),
  };
}

function getMockPost({ id, body }: { id?: any; body?: any }) {
  return {
    _id: id || getMongoId(),
    createdById: getMongoId(),
    text: "test post",
    ...body,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function getMockPostStats() {
  return {
    likesCount: 0,
    repostCount: 0,
    repliesCount: 0,
    viewsCount: 0,
    detailsViewsCount: 0,
    profileViewsCount: 0,
    followFromPostCount: 0,
    hashTagClicksCount: 0,
    linkClicksCount: 0,
    postLinkCopyCount: 0,
    postSharedCount: 0,
    postViaMsgCount: 0,
    postBookmarksCount: 0,
    engagementCount: 0,
  };
}

function getMockOMDBMovieDetails(): MockOMDBMovieResponse {
  return {
    data: {
      Title: "The Matrix",
      Year: "1999",
      Poster:
        "https://m.media-amazon.com/images/M/MV5BMTc5NTY1MzkyN15BMl5BanBnXkFtZTYwNzYxMzY2._V1_SX300.jpg",
      Released: "31 Mar 1999",
      Director: "Lana Wachowski, Lilly Wachowski",
      Writer: "Lilly Wachowski, Lana Wachowski",
    },
  };
}

function getMockPromptText(): string {
  const randomNum = Math.floor(Math.random() * 100000);
  return `test prompt #${randomNum}`;
}

export {
  getLoginTokenStrForTest,
  createManyTestUsers,
  deleteManyTestUsers,
  createTestUser,
  createValidUserCreds,
  createManyTestPosts,
  deleteManyTestPosts,
  createTestPost,
  createManyTestPromotionalPosts,
  createTestPromotionalPost,
  createTestPoll,
  createTestPollVote,
  createTestGif,
  createTestReposts,
  createTestLike,
  createTestBookmark,
  createManyTestBookmarks,
  createTestPostStats,
  getMongoId,
  getMockedUser,
  getMockPost,
  getMockPostStats,
  getMockPromptText,
  getMockOMDBMovieDetails,
  deleteTestUser,
  deleteTestPost,
};
