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
import { PostBookmarkModel } from "./postBookmarkModel";

jest.mock("../../services/ALSService", () => ({
  getLoggedInUserIdFromReq: jest.fn(),
}));

describe("Bookmark Post Model", () => {
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

  async function deleteMocks() {
    await deleteTestPost(post?.id);
    await deleteTestUser(user?.id);
    await PostBookmarkModel.deleteMany({});
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

  describe("Schema validation", () => {
    it("should require postId", async () => {
      const newBookmark = new PostBookmarkModel({ userId });

      await expect(newBookmark.save()).rejects.toThrow(
        "PostBookmarkModel validation failed: postId: Path `postId` is required."
      );
    });

    it("should check if the referenced post exists", async () => {
      const newBookmark = new PostBookmarkModel({
        postId: getMongoId(),
        userId,
      });
      await expect(newBookmark.save()).rejects.toThrow(
        "PostBookmarkModel validation failed: postId: Referenced post does not exist"
      );
    });

    it("should require userId", async () => {
      const newBookmark = new PostBookmarkModel({ postId });

      await expect(newBookmark.save()).rejects.toThrow(
        "PostBookmarkModel validation failed: userId: Path `userId` is required."
      );
    });

    it("should check if the referenced user exists", async () => {
      const newBookmark = new PostBookmarkModel({
        postId,
        userId: getMongoId(),
      });

      await expect(newBookmark.save()).rejects.toThrow(
        "PostBookmarkModel validation failed: userId: Referenced user does not exist"
      );
    });

    it("should create timestamps", async () => {
      await deleteAndCreateMocks();
      const newBookmark = await PostBookmarkModel.create({ postId, userId });
      expect(newBookmark.createdAt).toBeDefined();
      expect(newBookmark.updatedAt).toBeDefined();
    });
  });

  describe("Indexes", () => {
    it("should enforce unique constraint on postId and userId", async () => {
      await deleteAndCreateMocks();
      const newBookmark1 = new PostBookmarkModel({ postId, userId });
      await newBookmark1.save();

      const newBookmark2 = new PostBookmarkModel({ postId, userId });

      let error;
      try {
        await newBookmark2.save();
      } catch (err) {
        error = err;
      }
      expect(error).toBeDefined();
      expect(error.message).toContain("duplicate key error");
    });
  });

  describe("Post-save hooks", () => {
    it("should populate the post field with post.isBookmarked is true", async () => {
      await deleteAndCreateMocks();
      const newBookmark = new PostBookmarkModel({ postId, userId });
      const doc = (await newBookmark.save()) as any;

      expect(doc.post).toBeDefined();
      const post = doc.toObject().post as Post;
      assertPost(post);
      expect(post.loggedInUserActionState.isBookmarked).toBe(true);
    });
  });

  describe("Post-find hook", () => {
    it("should populate the post field", async () => {
      await deleteAndCreateMocks();
      const newBookmark = new PostBookmarkModel({ postId, userId });
      const doc = (await newBookmark.save()) as any;

      expect(doc.post).toBeDefined();

      const docsFromFind = (await PostBookmarkModel.find({
        postId,
        userId,
      })) as any;

      for (const doc of docsFromFind) {
        expect(doc.post).toBeDefined();
        const post = doc.toObject().post as Post;
        assertPost(post);
      }
    });

    it("should populate the post field with post.isBookmarked is false after remove action", async () => {
      await deleteAndCreateMocks();
      const newBookmark = new PostBookmarkModel({ postId, userId });
      const doc = (await newBookmark.save()) as any;

      expect(doc.post).toBeDefined();

      const removedDoc = (await PostBookmarkModel.findOneAndRemove({
        _id: doc._id,
      })) as any;

      expect(removedDoc.post).toBeDefined();
      const { post } = removedDoc.toObject();
      assertPost(post);
      expect(post.loggedInUserActionState.isBookmarked).toBe(false);
    });
  });
});
