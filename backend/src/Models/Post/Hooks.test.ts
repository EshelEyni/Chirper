/* eslint-disable @typescript-eslint/no-explicit-any */
import { Post } from "../../../../shared/types/post.interface";
import {
  createManyTestBookmarks,
  createManyTestPosts,
  createManyTestUsers,
  createTestGif,
  createTestLike,
  createTestPoll,
  createTestPost,
  createTestPostStats,
  createTestReposts,
  deleteTestPost,
} from "../../services/test/testUtilService";
import { UserModel } from "../../models/user/userModel";
import * as PostModelModule from "./postModel";
import * as populatePostData from "../../services/post/populatePostData";
import userRelationService from "../../services/userRelation/userRelationService";
import { assertPost } from "../../services/test/testAssertionService";
import { connectToTestDB, disconnectFromTestDB } from "../../services/test/testDBService";
import { RepostModel } from "../repost/repostModel";
import { PostBookmarkModel } from "../postBookmark/postBookmarkModel";
import { PostLikeModel } from "../postLike/postLikeModel";
import { PostStatsModel } from "../postStats/postStatsModel";

describe("PostModel: Hooks", () => {
  beforeAll(async () => {
    await connectToTestDB();
  });

  afterEach(async () => {
    await PostModelModule.PostModel.deleteMany({});
    await UserModel.deleteMany({});
  });

  afterAll(async () => {
    await disconnectFromTestDB();
  });

  describe("(1) Pre Validate hook - should set sortOrder in imgs property correctly", () => {
    it("Should set sortOrder to 1 if imgs has only one element.", async () => {
      const post = await createTestPost({
        body: { imgs: [{ url: "https://example.com/img" }] },
      });

      expect(post.imgs).toEqual([{ url: "https://example.com/img", sortOrder: 1 }]);
    });

    it("Should set sortOrder correctly if imgs has multiple elements.", async () => {
      const post = await createTestPost({
        body: {
          imgs: [
            { url: "https://example.com/img1" },
            { url: "https://example.com/img2" },
            { url: "https://example.com/img3" },
          ],
        },
      });
      expect(post.imgs).toEqual([
        { url: "https://example.com/img1", sortOrder: 1 },
        { url: "https://example.com/img2", sortOrder: 2 },
        { url: "https://example.com/img3", sortOrder: 3 },
      ]);
    });
  });

  describe("(1) Pre save hook - content validation", () => {
    it("Should throw an error when no content (text, gif, imgs, poll, videoUrl) is provided.", async () => {
      // Text is a default in createTestPost, therefore we delete it
      await expect(createTestPost({ body: { text: undefined } })).rejects.toThrow(
        "At least one of text, gif, imgs, or poll is required"
      );
    });

    it("Should save when only text is provided.", async () => {
      const post = await createTestPost({ body: { text: "Hello world" } });
      expect(post).toBeDefined();
    });

    it("Should save when only gif is provided.", async () => {
      const post = await createTestPost({
        body: { text: undefined, gif: createTestGif() },
      });
      expect(post).toBeDefined();
    });

    it("Should save when only imgs are provided.", async () => {
      const post = await createTestPost({
        body: { text: undefined, imgs: [{ url: "https://example.com/img", sortOrder: 1 }] },
      });
      expect(post).toBeDefined();
    });

    it("Should save when only poll is provided.", async () => {
      const post = await createTestPost({
        body: { text: "Poll Question?", poll: createTestPoll({}) },
      });
      expect(post).toBeDefined();
    });

    it("Should throw an error if a poll is provided with no question in the text field.", async () => {
      await expect(
        createTestPost({ body: { text: undefined, poll: createTestPoll({}) } })
      ).rejects.toThrow("Poll must have a question in the text field");
    });

    it("Should save when only videoUrl is provided.", async () => {
      const validYoutubeUrl = "https://www.youtube.com/watch?v=6n3pFFPSlW4";
      const post = await createTestPost({
        body: { text: undefined, videoUrl: validYoutubeUrl },
      });
      expect(post).toBeDefined();
    });

    it("Should throw an error when schedule is in the past.", async () => {
      const post = createTestPost({
        body: { text: "Hello world", schedule: new Date(Date.now() - 10000) },
      });
      await expect(post).rejects.toThrow("Schedule cannot be in the past");
    });

    it("Should throw an error when both poll and schedule are provided.", async () => {
      const post = createTestPost({
        body: {
          text: "Hello world",
          poll: createTestPoll({}),
          schedule: new Date(Date.now() + 10000),
        },
      });
      await expect(post).rejects.toThrow("Post with poll cannot be scheduled");
    });

    it("Should save when schedule is in the future and no poll is provided.", async () => {
      const post = await createTestPost({
        body: { text: "Hello world", schedule: new Date(Date.now() + 10000) },
      });
      expect(post).toBeDefined();
    });
  });

  describe("(2) Pre save hook - setting isPublic property", () => {
    it("Should set isPublic to true when both schedule and isDraft are undefined.", async () => {
      const post = await createTestPost({
        body: { text: "Hello world", schedule: undefined, isDraft: undefined },
      });
      expect(post.isPublic).toBe(true);
    });

    it("Should set isPublic to false when schedule is defined.", async () => {
      const post = await createTestPost({
        body: { text: "Hello world", schedule: new Date(Date.now() + 10000) },
      });
      expect(post.isPublic).toBe(false);
    });

    it("Should set isPublic to false when isDraft is defined.", async () => {
      const post = await createTestPost({
        body: { text: "Hello world", isDraft: true },
      });
      expect(post.isPublic).toBe(false);
    });

    it("Should set isPublic to false when both schedule and isDraft are defined.", async () => {
      const post = await createTestPost({
        body: {
          text: "Hello world",
          schedule: new Date(Date.now() + 10000),
          isDraft: true,
        },
      });
      expect(post.isPublic).toBe(false);
    });
  });

  describe("(3) Pre save hook - trimming videoUrl from text", () => {
    it("Should not trim text if text is not present.", async () => {
      const post = await createTestPost({
        body: { text: undefined, videoUrl: "https://www.youtube.com/watch?v=6n3pFFPSlW4" },
      });
      expect(post.text).toBeUndefined();
    });

    it("Should trim the last occurrence of videoUrl from the text if both are present.", async () => {
      const videoUrl = "https://www.youtube.com/watch?v=6n3pFFPSlW4";
      const post = await createTestPost({
        body: { text: `Hello world ${videoUrl} ${videoUrl}`, videoUrl },
      });
      expect(post.text).toBe(`Hello world ${videoUrl}`);
    });

    it("Should not trim text if videoUrl does not occur in the text.", async () => {
      const post = await createTestPost({
        body: { text: "Hello world", videoUrl: "https://www.youtube.com/watch?v=6n3pFFPSlW4" },
      });
      expect(post.text).toBe("Hello world");
    });
  });

  describe("Post save hook - should populate user", () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it("Should call populatePostData when post is saved.", async () => {
      const spy = jest.spyOn(populatePostData, "populatePostData");
      const post = await createTestPost({});
      expect(spy).toHaveBeenCalled();
      assertPost(post);
    });

    it("Should return early if the saved doc is null or undefined.", async () => {
      const spy = jest.spyOn(populatePostData, "populatePostData");
      jest
        .spyOn(PostModelModule.PostModel, "create")
        .mockImplementationOnce(() => Promise.resolve(null as any));

      const post = await createTestPost({});
      expect(post).toBeFalsy();
      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe("Pre find hook - should the Find Query with isPublic and isBlocked", () => {
    afterEach(async () => {
      jest.clearAllMocks();
      await PostModelModule.PostModel.deleteMany({});
    });

    it("Should always include 'isPublic: true' in the find query.", async () => {
      const post = await createTestPost({});
      const postFromDB = await PostModelModule.PostModel.findById(post.id);
      expect(postFromDB?.isPublic).toBe(true);
    });

    it("Should include blockedUserIds in $nin if isBlocked is not present.", async () => {
      const [user1, user2] = await createManyTestUsers(2);
      await createManyTestPosts({ createdByIds: [user1.id, user2.id] });
      jest.spyOn(userRelationService, "getBlockedUserIds").mockResolvedValueOnce([user1.id]);
      const postsFromDB = await PostModelModule.PostModel.find({});
      expect(postsFromDB.length).toBe(1);
      expect(postsFromDB.every(post => post.createdById.toString() !== user1.id)).toBe(true);
    });

    it("Should skip adding blockedUserIds to $nin if isBlocked is present.", async () => {
      const [user1, user2] = await createManyTestUsers(2);
      const [post1, post2] = await createManyTestPosts({ createdByIds: [user1.id, user2.id] });
      jest.spyOn(userRelationService, "getBlockedUserIds").mockResolvedValueOnce([user1.id]);
      const postsFromDB = await PostModelModule.PostModel.find({}).setOptions({
        isBlocked: true,
      });
      expect(postsFromDB.length).toBe(2);
      expect(postsFromDB.every(p => p.id === post1.id || p.id === post2.id)).toBe(true);
    });
  });

  describe("Post find hook - should populate user", () => {
    it("Should call populatePostData when post is found.", async () => {
      const spy = jest.spyOn(populatePostData, "populatePostData");
      const post = await createTestPost({});
      const postFromDB = (await PostModelModule.PostModel.findById(post.id)) as unknown as Post;
      expect(postFromDB).toBeDefined();
      expect(spy).toHaveBeenCalled();
      assertPost(postFromDB);
    });

    it("Should return early if the found doc is null or undefined.", async () => {
      const spy = jest.spyOn(populatePostData, "populatePostData");
      const post = await createTestPost({});
      const postFromDB = (await PostModelModule.PostModel.findById(post.id)) as unknown as Post;
      expect(postFromDB).toBeDefined();
      expect(spy).toHaveBeenCalled();
      assertPost(postFromDB);
    });

    it("Should return early if skipHooks option is true.", async () => {
      const spy = jest.spyOn(populatePostData, "populatePostData");
      const post = await createTestPost({});
      const postFromDB = (await PostModelModule.PostModel.findById(post.id)) as unknown as Post;
      expect(postFromDB).toBeDefined();
      expect(spy).toHaveBeenCalled();
      assertPost(postFromDB);
    });

    it("Should handle both single and multiple result sets.", async () => {
      const spy = jest.spyOn(populatePostData, "populatePostData");
      const [post1, post2] = await createManyTestPosts({});
      const postFromDB = (await PostModelModule.PostModel.find({
        _id: { $in: [post1.id, post2.id] },
      })) as unknown as Post[];
      expect(postFromDB).toBeDefined();
      expect(spy).toHaveBeenCalled();
      postFromDB.forEach(assertPost);
    });
  });

  fdescribe("Pre findOneAndDelete hook - should remove all doc who reference Post", () => {
    function createPostRefDocDetails(postId: string, ...userIds: string[]): any[] {
      return userIds.map(userId => ({ postId, userId }));
    }

    it("Should remove all reposts that reference the deleted post.", async () => {
      const [user1, user2] = await createManyTestUsers(2);
      const post = await createTestPost({});
      await createTestReposts(...createPostRefDocDetails(post.id, user1.id, user2.id));
      const repostsBeforeDelete = await RepostModel.countDocuments({ postId: post.id });
      expect(repostsBeforeDelete).toBe(2);
      await deleteTestPost(post.id);
      const repostsAfterDelete = await RepostModel.countDocuments({ postId: post.id });
      expect(repostsAfterDelete).toBe(0);
    });

    it("Should remove all like that reference the deleted post.", async () => {
      const [user1, user2] = await createManyTestUsers(2);
      const post = await createTestPost({});
      await createTestLike(...createPostRefDocDetails(post.id, user1.id, user2.id));
      const likesBeforeDelete = await PostLikeModel.countDocuments({ postId: post.id });
      expect(likesBeforeDelete).toBe(2);
      await deleteTestPost(post.id);
      const likesAfterDelete = await PostLikeModel.countDocuments({ postId: post.id });
      expect(likesAfterDelete).toBe(0);
    });

    it("Should remove all posts stats the deleted post.", async () => {
      const [user1, user2] = await createManyTestUsers(2);
      const post = await createTestPost({});
      await createTestPostStats(...createPostRefDocDetails(post.id, user1.id, user2.id));
      const bookmarksBeforeDelete = await PostStatsModel.countDocuments({ postId: post.id });
      expect(bookmarksBeforeDelete).toBe(2);
      await deleteTestPost(post.id);
      const bookmarksAfterDelete = await PostStatsModel.countDocuments({ postId: post.id });
      expect(bookmarksAfterDelete).toBe(0);
    });

    it("Should remove all bookmarks that reference the deleted post.", async () => {
      const [user1, user2] = await createManyTestUsers(2);
      const post = await createTestPost({});
      await createManyTestBookmarks(...createPostRefDocDetails(post.id, user1.id, user2.id));
      const bookmarksBeforeDelete = await PostBookmarkModel.countDocuments({ postId: post.id });
      expect(bookmarksBeforeDelete).toBe(2);
      await deleteTestPost(post.id);
      const bookmarksAfterDelete = await PostBookmarkModel.countDocuments({ postId: post.id });
      expect(bookmarksAfterDelete).toBe(0);
    });
  });
});
