/* eslint-disable @typescript-eslint/no-explicit-any */
require("dotenv").config();
import mongoose from "mongoose";
import {
  LoggedInUserActionState,
  Poll,
  Post,
  QuotedPost,
} from "../../../shared/interfaces/post.interface";
import { User, UserCredenitials } from "../../../shared/interfaces/user.interface";
import { UserModel } from "../api/user/models/user/user.model";
import { AppError } from "./error/error.service";
import tokenService from "./token/token.service";
import { Gif, GifCategory } from "../../../shared/interfaces/gif.interface";
import { BotPrompt } from "../../../shared/interfaces/bot.interface";
import ansiColors from "ansi-colors";
import { PostModel } from "../api/post/models/post/post.model";
import { RepostModel } from "../api/post/models/repost/repost.model";
import { PostLikeModel } from "../api/post/models/like/post-like.model";
import { PostStatsModel } from "../api/post/models/post-stats/post-stats.model";
import { PollVoteModel } from "../api/post/models/poll-vote/poll-vote.model";

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

export type RepostParams = {
  postId: string;
  repostOwnerId: string;
};

export type CreatePostStatParams = {
  postId: string;
  userId: string;
};

export type CreatePollVoteParams = {
  postId: string;
  userId: string;
  optionIdx: number;
};

async function connectToTestDB({ isRemoteDB = false } = {}) {
  const { DB_URL, TEST_DB_NAME, LOCAL_DB_URL } = process.env;
  if (!LOCAL_DB_URL) throw new AppError("LOCAL_DB_URL is not defined.", 500);
  if (!DB_URL) throw new AppError("DB_URL is not defined.", 500);
  if (!TEST_DB_NAME) throw new AppError("TEST_DB_NAME is not defined.", 500);

  if (isRemoteDB) await mongoose.connect(DB_URL, { dbName: TEST_DB_NAME });
  else await mongoose.connect(LOCAL_DB_URL);

  // eslint-disable-next-line no-console
  console.log(ansiColors.bgGreen("Connected to DB"));
}

async function disconnectFromTestDB() {
  await mongoose.connection.close();
  // eslint-disable-next-line no-console
  console.log(ansiColors.red.italic("Disconnected from DB"));
}

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

  const postBodies = [];

  for (const id of ids) {
    const createdById = createdByIds?.[ids.indexOf(id)] || (await createTestUser({})).id;
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
  return (await PostModel.create({
    _id: id || getMongoId(),
    createdById: createdById || (await createTestUser({})).id,
    text: "test post",
    ...body,
    skipHooks,
  })) as unknown as Post;
}

async function deleteTestPost(id: string) {
  const deletedPost = await PostModel.findByIdAndDelete(id);
  if (!deletedPost) return;
  await UserModel.findByIdAndUpdate(deletedPost.createdById);
}

async function createTestReposts(...repostDetails: RepostParams[]) {
  await RepostModel.deleteMany({});
  const reposts = await RepostModel.create(repostDetails);
  return reposts;
}

async function createTestLike(...likeDetails: CreatePostStatParams[]) {
  await PostLikeModel.deleteMany({});
  const likes = await PostLikeModel.create(likeDetails);
  return likes;
}

async function createTestView(...viewDetails: CreatePostStatParams[]) {
  await PostStatsModel.deleteMany({});
  const views = await PostStatsModel.create(viewDetails);
  return views;
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

async function createPollVote(...polVote: CreatePollVoteParams[]): Promise<void> {
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

function getMockPost() {
  return {
    _id: getMongoId(),
    createdById: getMongoId(),
    text: "test post",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function getMockPromptText(): string {
  const randomNum = Math.floor(Math.random() * 100000);
  return `test prompt #${randomNum}`;
}

function assertUser(user: User) {
  expect(user).toEqual(
    expect.objectContaining({
      id: expect.any(String),
      username: expect.any(String),
      fullname: expect.any(String),
      email: expect.any(String),
      bio: expect.any(String),
      imgUrl: expect.any(String),
      isAdmin: expect.any(Boolean),
      isVerified: expect.any(Boolean),
      isApprovedLocation: expect.any(Boolean),
      followingCount: expect.any(Number),
      followersCount: expect.any(Number),
    })
  );

  expect(typeof user.createdAt === "string" || typeof user.createdAt === "object").toBeTruthy();
}

function assertPost(post: Post) {
  expect(post).toEqual(
    expect.objectContaining({
      id: expect.any(String),
      audience: expect.any(String),
      repliersType: expect.any(String),
      repliesCount: expect.any(Number),
      repostsCount: expect.any(Number),
      likesCount: expect.any(Number),
      viewsCount: expect.any(Number),
    })
  );
  expect(typeof post.createdAt === "string" || typeof post.createdAt === "object").toBeTruthy();
  expect(typeof post.updatedAt === "string" || typeof post.updatedAt === "object").toBeTruthy();

  assertLoggedInUserState(post.loggedInUserActionState);
  assertUser(post.createdBy);
}

function assertQuotedPost(post: QuotedPost) {
  expect(post).toEqual(
    expect.objectContaining({
      id: expect.any(String),
      audience: expect.any(String),
      repliersType: expect.any(String),
    })
  );
  expect(typeof post.createdAt === "string" || typeof post.createdAt === "object").toBeTruthy();
  assertUser(post.createdBy);
}

function assertLoggedInUserState(loggedInUserState: LoggedInUserActionState) {
  expect(loggedInUserState).toEqual({
    isLiked: expect.any(Boolean),
    isReposted: expect.any(Boolean),
    isViewed: expect.any(Boolean),
    isDetailedViewed: expect.any(Boolean),
    isProfileViewed: expect.any(Boolean),
    isHashTagClicked: expect.any(Boolean),
    isLinkClicked: expect.any(Boolean),
    isBookmarked: expect.any(Boolean),
    isPostLinkCopied: expect.any(Boolean),
    isPostShared: expect.any(Boolean),
    isPostSendInMessage: expect.any(Boolean),
    isPostBookmarked: expect.any(Boolean),
  });
}

function assertGifCategory(category: GifCategory) {
  expect(category).toEqual(
    expect.objectContaining({
      id: expect.any(String),
      name: expect.any(String),
      imgUrl: expect.any(String),
      sortOrder: expect.any(Number),
    })
  );
}

function assertGif(gif: Gif) {
  expect(gif).toEqual(
    expect.objectContaining({
      id: expect.any(String),
      url: expect.any(String),
      staticUrl: expect.any(String),
      description: expect.any(String),
      size: expect.objectContaining({
        height: expect.any(Number),
        width: expect.any(Number),
      }),
      placeholderUrl: expect.any(String),
      staticPlaceholderUrl: expect.any(String),
    })
  );
}

function assertPoll(poll: Poll) {
  expect(poll).toEqual(
    expect.objectContaining({
      options: expect.any(Array),
      isVotingOff: expect.any(Boolean),
      createdAt: expect.anything(),
    })
  );

  for (const option of poll.options) {
    expect(option).toEqual(
      expect.objectContaining({
        text: expect.any(String),
        voteCount: expect.any(Number),
        isLoggedInUserVoted: expect.any(Boolean),
      })
    );
  }

  expect(poll.options.length).toBeGreaterThanOrEqual(2);
  expect(poll.options.length).toBeLessThanOrEqual(5);

  const timeStamp = new Date(poll.createdAt).getTime();
  expect(timeStamp).toBeLessThanOrEqual(Date.now());

  expect(poll.length).toEqual({
    days: expect.any(Number),
    hours: expect.any(Number),
    minutes: expect.any(Number),
  });
}

function assertPostImgs(...postImgs: any) {
  for (const postImg of postImgs) {
    expect(postImg).toEqual(
      expect.objectContaining({
        url: expect.any(String),
        sortOrder: expect.any(Number),
      })
    );
  }
}

function assertBotPrompt(botPrompt: BotPrompt) {
  expect(botPrompt).toEqual(
    expect.objectContaining({
      botId: expect.any(String),
      prompt: expect.any(String),
      type: expect.any(String),
    })
  );
}

export {
  connectToTestDB,
  disconnectFromTestDB,
  getLoginTokenStrForTest,
  createManyTestUsers,
  deleteManyTestUsers,
  createTestUser,
  createValidUserCreds,
  createManyTestPosts,
  deleteManyTestPosts,
  createTestPost,
  createTestPoll,
  createPollVote,
  createTestGif,
  createTestReposts,
  createTestLike,
  createTestView,
  getMongoId,
  getMockedUser,
  getMockPost,
  getMockPromptText,
  deleteTestUser,
  deleteTestPost,
  assertUser,
  assertPost,
  assertQuotedPost,
  assertGifCategory,
  assertGif,
  assertPoll,
  assertPostImgs,
  assertBotPrompt,
  assertLoggedInUserState,
};
