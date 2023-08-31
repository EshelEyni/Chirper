/* eslint-disable @typescript-eslint/no-explicit-any */
import { Post } from "../../../../../../shared/interfaces/post.interface";
import { User } from "../../../../../../shared/interfaces/user.interface";
import { AppError } from "../../../../services/error/error.service";
import {
  connectToTestDB,
  createTestPost,
  createTestUser,
  deleteTestPost,
  deleteTestUser,
  disconnectFromTestDB,
  getMongoId,
} from "../../../../services/test-util.service";
import { BookmarkedPostModel } from "./bookmark-post.model";

describe("Bookmark Post Model", () => {
  let post: Post, user: User, postId: string, bookmarkOwnerId: string;

  async function deleateAndCreateMocks() {
    await deleteTestPost(post?.id);
    await deleteTestUser(user?.id);
    user = await createTestUser({});
    post = await createTestPost({ id: user.id });
    postId = post.id;
    bookmarkOwnerId = user.id;
  }

  async function deleteMocks() {
    await deleteTestPost(post?.id);
    await deleteTestUser(user?.id);
  }

  beforeAll(async () => {
    await connectToTestDB();
    await deleateAndCreateMocks();
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

    it("should require bookmarkOwnerId", async () => {
      const newBookmark = new BookmarkedPostModel({ postId });

      await expect(newBookmark.save()).rejects.toThrow(
        "BookmarkedPost validation failed: bookmarkOwnerId: Path `bookmarkOwnerId` is required."
      );
    });

    it("should create timestamps", async () => {
      const newBookmark = new BookmarkedPostModel({ postId, bookmarkOwnerId });

      await newBookmark.save();

      expect(newBookmark.createdAt).toBeDefined();
      expect(newBookmark.updatedAt).toBeDefined();
    });

    it("should enforce unique constraint on postId and bookmarkOwnerId", async () => {
      await deleateAndCreateMocks();
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

  describe("Pre-save hooks", () => {
    it("should check if the referenced post exists", async () => {
      const newBookmark = new BookmarkedPostModel({
        postId: getMongoId(),
        bookmarkOwnerId: getMongoId(),
      });
      await expect(newBookmark.save()).rejects.toThrow(
        new AppError("Referenced post does not exist", 404)
      );
    });
  });
});
