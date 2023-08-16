require("dotenv").config();
import mongoose from "mongoose";
import { LoggedInUserActionState, Post } from "../../../shared/interfaces/post.interface";
import { MiniUser, User } from "../../../shared/interfaces/user.interface";
import { PostModel } from "../api/post/models/post.model";
import { UserModel } from "../api/user/models/user.model";
import { AppError } from "./error/error.service";
import tokenService from "./token/token.service";
import { logger } from "./logger/logger.service";
import { Gif, GifCategory } from "../../../shared/interfaces/gif.interface";

async function connectToTestDB({ isRemoteDB = false } = {}) {
  const { DB_URL, TEST_DB_NAME, LOCAL_DB_URL } = process.env;
  if (!LOCAL_DB_URL) throw new AppError("LOCAL_DB_URL is not defined.", 500);
  if (!DB_URL) throw new AppError("DB_URL is not defined.", 500);
  if (!TEST_DB_NAME) throw new AppError("TEST_DB_NAME is not defined.", 500);

  if (isRemoteDB) await mongoose.connect(DB_URL, { dbName: TEST_DB_NAME });
  else {
    await mongoose.connect(LOCAL_DB_URL);
  }
  logger.info("Connected to MongoDB.");
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
      createdAt: expect.any(String),
    })
  );
}

function assertPost(post: Post) {
  expect(post).toEqual(
    expect.objectContaining({
      id: expect.any(String),
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
      repliesCount: expect.any(Number),
      repostsCount: expect.any(Number),
      likesCount: expect.any(Number),
      viewsCount: expect.any(Number),
    })
  );

  assertLoggedInUserState(post.loggedInUserActionState);
  assertMiniUser(post.createdBy);
}

function assertLoggedInUserState(loggedInUserState: LoggedInUserActionState) {
  expect(loggedInUserState).toEqual({
    isLiked: expect.any(Boolean),
    isReposted: expect.any(Boolean),
    isViewed: expect.any(Boolean),
    isDetailedViewed: expect.any(Boolean),
    isProfileViewed: expect.any(Boolean),
    isFollowedFromPost: expect.any(Boolean),
    isHashTagClicked: expect.any(Boolean),
    isLinkClicked: expect.any(Boolean),
    isBookmarked: expect.any(Boolean),
    isPostLinkCopied: expect.any(Boolean),
    isPostShared: expect.any(Boolean),
    isPostSendInMessage: expect.any(Boolean),
    isPostBookmarked: expect.any(Boolean),
  });
}

function assertMiniUser(miniUser: MiniUser) {
  expect(miniUser).toEqual(
    expect.objectContaining({
      id: expect.any(String),
      username: expect.any(String),
      fullname: expect.any(String),
      imgUrl: expect.any(String),
      bio: expect.any(String),
      followersCount: expect.any(Number),
      followingCount: expect.any(Number),
      isFollowing: expect.any(Boolean),
    })
  );
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

function getLoginTokenStrForTest(validUserId: string) {
  const token = tokenService.signToken(validUserId);
  return `loginToken=${token}`;
}

async function getValidUserId() {
  const user = (await UserModel.findOne({})
    .setOptions({ skipHooks: true })
    .select("_id")
    .lean()
    .exec()) as unknown as { _id: any };
  if (!user) throw new AppError("No user found in DB", 500);
  return user._id.toHexString();
}

async function getValidPostId() {
  const post = (await PostModel.findOne({})
    .setOptions({ skipHooks: true })
    .select("_id")
    .lean()
    .exec()) as unknown as { _id: any };

  if (!post) throw new AppError("No post found in DB", 500);
  return post._id.toHexString();
}

export {
  connectToTestDB,
  assertUser,
  assertPost,
  getLoginTokenStrForTest,
  getValidUserId,
  getValidPostId,
  assertGifCategory,
  assertGif,
};
