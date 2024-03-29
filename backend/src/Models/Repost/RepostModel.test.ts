/* eslint-disable @typescript-eslint/no-explicit-any */
import { Post } from "../../../../shared/types/post";
import { User } from "../../../../shared/types/user";
import { getLoggedInUserIdFromReq } from "../../services/ALSService";
import { assertPost, assertUser } from "../../services/test/testAssertionService";
import {
  createTestPost,
  createTestUser,
  deleteTestPost,
  deleteTestUser,
  getMongoId,
} from "../../services/test/testUtilService";
import { connectToTestDB, disconnectFromTestDB } from "../../services/test/testDBService";
import { RepostModel } from "./repostModel";

jest.mock("../../services/ALSService", () => ({
  getLoggedInUserIdFromReq: jest.fn(),
}));

describe("Repost Model", () => {
  let post: Post, user: User, postId: string, userId: string;

  async function deleteAndCreateMocks() {
    await RepostModel.deleteMany({});
    await deleteTestPost(post?.id);
    await deleteTestUser(user?.id);
    user = await createTestUser({});
    post = await createTestPost({});
    postId = post.id;
    userId = user.id;
    mockGetLoggedInUserIdFromReq();
  }

  async function deleteMocks() {
    await RepostModel.deleteMany({});
    await deleteTestPost(post?.id);
    await deleteTestUser(user?.id);
  }

  function mockGetLoggedInUserIdFromReq() {
    (getLoggedInUserIdFromReq as jest.Mock).mockReturnValue(user.id);
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
      const postLike = new RepostModel({
        userId: getMongoId(),
      });
      await expect(postLike.save()).rejects.toThrow("postId: Path `postId` is required.");
    });

    it("should require userId", async () => {
      const postLike = new RepostModel({
        postId: getMongoId(),
      });
      await expect(postLike.save()).rejects.toThrow("userId: Path `userId` is required.");
    });

    it("should not save if referenced post doesn't exist", async () => {
      const invalidPostId = getMongoId();
      const postLike = new RepostModel({
        postId: invalidPostId,
        userId,
      });
      await expect(postLike.save()).rejects.toThrow("Referenced post does not exist");
    });

    it("should not save if referenced user doesn't exist", async () => {
      const invalidUserId = getMongoId();
      const postLike = new RepostModel({
        postId,
        userId: invalidUserId,
      });
      await expect(postLike.save()).rejects.toThrow("Referenced user does not exist");
    });
  });

  describe("Indexes", () => {
    it("should not allow duplicate postLike for same postId and userId", async () => {
      await deleteAndCreateMocks();
      await RepostModel.create({
        postId,
        userId,
      });

      const duplicatePostLike = new RepostModel({
        postId,
        userId,
      });

      let error;
      try {
        await duplicatePostLike.save();
      } catch (err) {
        error = err;
      }
      expect(error).toBeDefined();
      expect(error.message).toContain("duplicate key error");
    });
  });

  describe("Hooks", () => {
    it("should populate post and repostedBy after save with isReposted true", async () => {
      await deleteAndCreateMocks();

      const repost = (await RepostModel.create({
        postId,
        userId,
      })) as any;

      expect(repost.post).toBeDefined();
      expect(repost.repostedBy).toBeDefined();

      const post = repost.post as Post;
      assertPost(post);
      expect(post.loggedInUserActionState.isReposted).toBe(true);
      assertUser(repost.repostedBy);
    });

    it("should populate post and repostedBy after findOneAndRemove with isReposted false", async () => {
      await deleteAndCreateMocks();

      const repost = (await RepostModel.create({
        postId,
        userId,
      })) as any;

      const doc = (await RepostModel.findOneAndRemove({
        _id: repost._id,
      })) as any;

      expect(doc.post).toBeDefined();
      expect(doc.repostedBy).toBeDefined();

      const post = doc.post as Post;
      assertPost(post);
      expect(post.loggedInUserActionState.isReposted).toBe(false);
      assertUser(doc.repostedBy);
    });

    it("should populate post and repostedBy after find (array response)", async () => {
      await deleteAndCreateMocks();
      (await RepostModel.create({
        postId,
        userId,
      })) as any;

      const reposts = (await RepostModel.find({})) as any;
      for (const repost of reposts) {
        expect(repost.post).toBeDefined();
        expect(repost.repostedBy).toBeDefined();
        assertPost(repost.post);
        assertUser(repost.repostedBy);
      }
    });

    it("should populate post and repostedBy after findOne", async () => {
      await deleteAndCreateMocks();
      const repost = (await RepostModel.create({
        postId,
        userId,
      })) as any;

      const foundRepost = (await RepostModel.findOne({ _id: repost._id })) as any;

      expect(foundRepost.post).toBeDefined();
      expect(foundRepost.repostedBy).toBeDefined();

      const post = foundRepost.post as Post;
      assertPost(post);
      assertUser(foundRepost.repostedBy);
    });
  });
});
