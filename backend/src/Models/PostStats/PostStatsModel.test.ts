/* eslint-disable @typescript-eslint/no-explicit-any */
import { Post } from "../../../../shared/types/post.interface";
import { User } from "../../../../shared/types/user.interface";
import {
  createTestPost,
  createTestUser,
  deleteTestPost,
  deleteTestUser,
  getMongoId,
} from "../../Services/Test/TestUtilService";
import { connectToTestDB, disconnectFromTestDB } from "../../Services/Test/TestDBService";
import { PostStatsModel } from "./PostStatsModel";

describe("Post Like Model", () => {
  let post: Post, user: User, postId: string, userId: string;

  async function deleteAndCreateMocks() {
    await deleteTestPost(post?.id);
    await deleteTestUser(user?.id);
    user = await createTestUser({});
    post = await createTestPost({});
    postId = post.id;
    userId = user.id;
  }

  async function deleteMocks() {
    await PostStatsModel.deleteMany({});
    await deleteTestPost(post?.id);
    await deleteTestUser(user?.id);
  }

  beforeAll(async () => {
    await connectToTestDB();
    await deleteAndCreateMocks();
  });

  afterAll(async () => {
    await deleteMocks();
    await disconnectFromTestDB();
  });

  describe("Validation", () => {
    it("should require postId", async () => {
      const postStats = new PostStatsModel({
        userId: getMongoId(),
      });
      await expect(postStats.save()).rejects.toThrow("postId: Path `postId` is required.");
    });

    it("should require userId", async () => {
      const postStats = new PostStatsModel({
        postId: getMongoId(),
      });
      await expect(postStats.save()).rejects.toThrow("userId: Path `userId` is required.");
    });

    it("should not save if referenced post doesn't exist", async () => {
      const invalidPostId = getMongoId();
      const postStats = new PostStatsModel({
        postId: invalidPostId,
        userId,
      });
      await expect(postStats.save()).rejects.toThrow("Referenced post does not exist");
    });

    it("should not save if referenced user doesn't exist", async () => {
      const invalidUserId = getMongoId();
      const postStats = new PostStatsModel({
        postId,
        userId: invalidUserId,
      });
      await expect(postStats.save()).rejects.toThrow("Referenced user does not exist");
    });
  });

  describe("Indexes", () => {
    it("should not allow duplicate postStats for same postId and userId", async () => {
      await deleteAndCreateMocks();
      await PostStatsModel.create({
        postId,
        userId,
      });

      const duplicatePostStats = new PostStatsModel({
        postId,
        userId,
      });

      let error;
      try {
        await duplicatePostStats.save();
      } catch (err) {
        error = err;
      }
      expect(error).toBeDefined();
      expect(error.message).toContain("duplicate key error");
    });
  });

  describe("default values", () => {
    let postStats: any;

    beforeAll(async () => {
      await deleteAndCreateMocks();
      postStats = await PostStatsModel.create({
        postId,
        userId,
      });
    });

    it("should set isViewed to false", () => {
      expect(postStats.isViewed).toBe(true);
    });

    it("should set isDetailedViewed to false", () => {
      expect(postStats.isDetailedViewed).toBe(false);
    });

    it("should set isProfileViewed to false", () => {
      expect(postStats.isProfileViewed).toBe(false);
    });

    it("should set isFollowedFromPost to false", () => {
      expect(postStats.isFollowedFromPost).toBe(false);
    });

    it("should set isBlockedFromPost to false", () => {
      expect(postStats.isBlockedFromPost).toBe(false);
    });

    it("should set isMutedFromPost to false", () => {
      expect(postStats.isMutedFromPost).toBe(false);
    });

    it("should set isHashTagClicked to false", () => {
      expect(postStats.isHashTagClicked).toBe(false);
    });

    it("should set isLinkClicked to false", () => {
      expect(postStats.isLinkClicked).toBe(false);
    });

    it("should set isPostLinkCopied to false", () => {
      expect(postStats.isPostLinkCopied).toBe(false);
    });

    it("should set isPostShared to false", () => {
      expect(postStats.isPostShared).toBe(false);
    });

    it("should set isPostSendInMessage to false", () => {
      expect(postStats.isPostSendInMessage).toBe(false);
    });

    it("should set isPostBookmarked to false", () => {
      expect(postStats.isPostBookmarked).toBe(false);
    });
  });
});
