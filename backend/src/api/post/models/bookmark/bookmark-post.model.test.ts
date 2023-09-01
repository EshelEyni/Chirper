/* eslint-disable @typescript-eslint/no-explicit-any */
import { Post } from "../../../../../../shared/interfaces/post.interface";
import { User } from "../../../../../../shared/interfaces/user.interface";
import { getLoggedInUserIdFromReq } from "../../../../services/als.service";
import {
  assertPost,
  connectToTestDB,
  createTestPost,
  createTestUser,
  deleteTestPost,
  deleteTestUser,
  disconnectFromTestDB,
  getMongoId,
} from "../../../../services/test-util.service";
import { BookmarkedPostModel } from "./bookmark-post.model";

jest.mock("../../../../services/als.service", () => ({
  getLoggedInUserIdFromReq: jest.fn(),
}));

describe("Bookmark Post Model", () => {
  let post: Post, user: User, postId: string, bookmarkOwnerId: string;

  async function deleteAndCreateMocks() {
    await deleteTestPost(post?.id);
    await deleteTestUser(user?.id);
    user = await createTestUser({});
    post = await createTestPost({});
    postId = post.id;
    bookmarkOwnerId = user.id;
    mockGetLoggedInUserIdFromReq();
  }

  async function deleteMocks() {
    await deleteTestPost(post?.id);
    await deleteTestUser(user?.id);
    await BookmarkedPostModel.deleteMany({});
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
      const newBookmark = new BookmarkedPostModel({ bookmarkOwnerId });

      await expect(newBookmark.save()).rejects.toThrow(
        "BookmarkedPost validation failed: postId: Path `postId` is required."
      );
    });

    it("should check if the referenced post exists", async () => {
      const newBookmark = new BookmarkedPostModel({
        postId: getMongoId(),
        bookmarkOwnerId,
      });
      await expect(newBookmark.save()).rejects.toThrow(
        "BookmarkedPost validation failed: postId: Referenced post does not exist"
      );
    });

    it("should require bookmarkOwnerId", async () => {
      const newBookmark = new BookmarkedPostModel({ postId });

      await expect(newBookmark.save()).rejects.toThrow(
        "BookmarkedPost validation failed: bookmarkOwnerId: Path `bookmarkOwnerId` is required."
      );
    });

    it("should check if the referenced user exists", async () => {
      const newBookmark = new BookmarkedPostModel({
        postId,
        bookmarkOwnerId: getMongoId(),
      });

      await expect(newBookmark.save()).rejects.toThrow(
        "BookmarkedPost validation failed: bookmarkOwnerId: Referenced user does not exist"
      );
    });

    it("should create timestamps", async () => {
      await deleteAndCreateMocks();
      const newBookmark = await BookmarkedPostModel.create({ postId, bookmarkOwnerId });
      expect(newBookmark.createdAt).toBeDefined();
      expect(newBookmark.updatedAt).toBeDefined();
    });
  });

  describe("Indexes", () => {
    it("should enforce unique constraint on postId and bookmarkOwnerId", async () => {
      await deleteAndCreateMocks();
      const newBookmark1 = new BookmarkedPostModel({ postId, bookmarkOwnerId });
      await newBookmark1.save();

      const newBookmark2 = new BookmarkedPostModel({ postId, bookmarkOwnerId });

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
      const newBookmark = new BookmarkedPostModel({ postId, bookmarkOwnerId });
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
      const newBookmark = new BookmarkedPostModel({ postId, bookmarkOwnerId });
      const doc = (await newBookmark.save()) as any;

      expect(doc.post).toBeDefined();

      const docsFromFind = (await BookmarkedPostModel.find({
        postId,
        bookmarkOwnerId,
      })) as any;

      for (const doc of docsFromFind) {
        expect(doc.post).toBeDefined();
        const post = doc.toObject().post as Post;
        assertPost(post);
      }
    });

    it("should populate the post field with post.isBookmarked is false after remove action", async () => {
      await deleteAndCreateMocks();
      const newBookmark = new BookmarkedPostModel({ postId, bookmarkOwnerId });
      const doc = (await newBookmark.save()) as any;

      expect(doc.post).toBeDefined();

      const removedDoc = (await BookmarkedPostModel.findOneAndRemove({
        _id: doc._id,
      })) as any;

      expect(removedDoc.post).toBeDefined();
      const { post } = removedDoc.toObject();
      assertPost(post);
      expect(post.loggedInUserActionState.isBookmarked).toBe(false);
    });
  });
});
