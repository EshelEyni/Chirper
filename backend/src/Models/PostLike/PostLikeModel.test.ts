/* eslint-disable @typescript-eslint/no-explicit-any */
import { Post } from "../../../../shared/types/post.interface";
import { User } from "../../../../shared/types/user.interface";
import { getLoggedInUserIdFromReq } from "../../services/ALSService";
import { assertPost } from "../../services/test/testAssertionService";
import { connectToTestDB, disconnectFromTestDB } from "../../services/test/testDBService";
import {
  createTestPost,
  createTestUser,
  deleteTestPost,
  deleteTestUser,
  getMongoId,
} from "../../services/test/testUtilService";
import { PostLikeModel } from "./postLikeModel";

jest.mock("../../services/ALSService", () => ({
  getLoggedInUserIdFromReq: jest.fn(),
}));

describe("Post Like Model", () => {
  let post: Post, user: User, postId: string, userId: string;

  async function deleteAndCreateMocks() {
    await deleteTestPost(post?.id);
    await deleteTestUser(user?.id);
    user = await createTestUser({});
    post = await createTestPost({});
    postId = post.id;
    userId = user.id;
    mockGetLoggedInUserIdFromReq();
  }

  function mockGetLoggedInUserIdFromReq() {
    (getLoggedInUserIdFromReq as jest.Mock).mockReturnValue(user.id);
  }

  async function deleteMocks() {
    await PostLikeModel.deleteMany({});
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
      const postLike = new PostLikeModel({
        userId: getMongoId(),
      });
      await expect(postLike.save()).rejects.toThrow("postId: Path `postId` is required.");
    });

    it("should require userId", async () => {
      const postLike = new PostLikeModel({
        postId: getMongoId(),
      });
      await expect(postLike.save()).rejects.toThrow("userId: Path `userId` is required.");
    });

    it("should not save if referenced post doesn't exist", async () => {
      const invalidPostId = getMongoId();
      const postLike = new PostLikeModel({
        postId: invalidPostId,
        userId,
      });
      await expect(postLike.save()).rejects.toThrow("Referenced post does not exist");
    });

    it("should not save if referenced user doesn't exist", async () => {
      const invalidUserId = getMongoId();
      const postLike = new PostLikeModel({
        postId,
        userId: invalidUserId,
      });
      await expect(postLike.save()).rejects.toThrow("Referenced user does not exist");
    });
  });

  describe("Indexes", () => {
    it("should not allow duplicate postLike for same postId and userId", async () => {
      await deleteAndCreateMocks();
      await PostLikeModel.create({
        postId,
        userId,
      });

      const duplicatePostLike = new PostLikeModel({
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
    it("should populate post after save with postLike.post", async () => {
      await deleteAndCreateMocks();

      const postLike = new PostLikeModel({ postId, userId });
      const doc = (await postLike.save()) as any;

      const post = doc.toObject().post as Post;
      expect(post).toBeDefined();
      assertPost(post);

      expect(post.loggedInUserActionState.isLiked).toBe(true);
    });

    it("should populate post after findOneAndRemove with !postLike.post", async () => {
      await deleteAndCreateMocks();

      const postLike = new PostLikeModel({
        postId,
        userId,
      });

      const doc = (await postLike.save()) as any;
      const postAfterLike = doc.toObject().post as Post;
      assertPost(postAfterLike);
      expect(postAfterLike.loggedInUserActionState.isLiked).toBe(true);

      const removedDoc = (await PostLikeModel.findOneAndRemove({
        _id: doc._id,
      })) as any;

      const postAfterDislike = removedDoc.toObject().post as Post;
      assertPost(postAfterDislike);
      expect(postAfterDislike.loggedInUserActionState.isLiked).toBe(false);
    });

    it("should populate post after find", async () => {
      const postLikes = (await PostLikeModel.find({ userId })) as any;
      for (const postLike of postLikes) {
        expect(postLike.post).toBeDefined();
      }
    });
  });
});
