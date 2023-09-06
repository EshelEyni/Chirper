/* eslint-disable @typescript-eslint/no-explicit-any */
import request from "supertest";
import express from "express";
import compression from "compression";
import router from "./post.router";
import { errorHandler } from "../../../services/error/error.service";
import { BookmarkedPostModel } from "../models/bookmark/bookmark-post.model";
import { connectToTestDB, disconnectFromTestDB } from "../../../services/test/test-db.service";
import {
  createManyTestPosts,
  createManyTestPromotionalPosts,
  createTestPoll,
  createTestPost,
  createTestReposts,
  createTestUser,
  createTestView,
  getLoginTokenStrForTest,
} from "../../../services/test/test-util.service";
import cookieParser from "cookie-parser";
import setupAsyncLocalStorage from "../../../middlewares/setupAls/setupAls.middleware";
import { Post, PostStats } from "../../../../../shared/interfaces/post.interface";
import { PostModel } from "../models/post/post.model";
import { UserModel } from "../../user/models/user/user.model";
import { RepostModel } from "../models/repost/repost.model";
import {
  assertPoll,
  assertPost,
  assertPostStats,
  assertPromotionalPost,
  assertQuotedPost,
  assertRepost,
} from "../../../services/test/test-assertion.service";
import { PromotionalPostModel } from "../models/post/promotional-post.model";
import { PostStatsModel } from "../models/post-stats/post-stats.model";

const app = express();
app.use(compression());
app.use(express.json());
app.use(cookieParser());
app.all("*", setupAsyncLocalStorage);
app.use(router);
app.use(errorHandler);

describe("Post Router", () => {
  let validUserId: string, validPostId: string, token: string, adminId: string, adminToken: string;

  beforeAll(async () => {
    await connectToTestDB();
    validUserId = (await createTestUser({})).id;
    validPostId = (await createTestPost({ createdById: validUserId })).id;
    adminId = (await createTestUser({ isAdmin: true })).id;
    token = getLoginTokenStrForTest(validUserId);
    adminToken = getLoginTokenStrForTest(adminId);
  });

  afterAll(async () => {
    await PostModel.deleteMany({});
    await UserModel.deleteMany({});
    await PromotionalPostModel.deleteMany({});
    await RepostModel.deleteMany({});
    await PostStatsModel.deleteMany({});
    await disconnectFromTestDB();
  });

  describe("GET /", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("should return a 200 status code and an array of posts", async () => {
      const posts = await createManyTestPosts({ numOfPosts: 12 });
      await createTestReposts(
        {
          postId: posts[0].id,
          repostOwnerId: validUserId,
        },
        {
          postId: posts[1].id,
          repostOwnerId: validUserId,
        }
      );
      const res = await request(app).get("/");

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        status: "success",
        requestedAt: expect.any(String),
        results: expect.any(Number),
        data: expect.any(Array),
      });

      if (!res.body.data.length) throw new Error("No posts found");
      res.body.data.forEach(assertPost);
      expect(res.body.data.length).toEqual(14);
    });
  });

  describe("GET /:id", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("should return a 200 status code and the post", async () => {
      const post = await createTestPost({});

      const res = await request(app).get(`/${post.id}`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        status: "success",
        data: expect.any(Object),
      });

      const postFromRes = res.body.data;
      assertPost(postFromRes);
      expect(postFromRes.id).toBe(post.id);
    });

    it("should return a 200 status code and the post with poll", async () => {
      const post = await createTestPost({ body: { poll: createTestPoll({}) } });

      const res = await request(app).get(`/${post.id}`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        status: "success",
        data: expect.any(Object),
      });

      const postFromRes = res.body.data;
      assertPost(postFromRes);
      expect(postFromRes.id).toBe(post.id);
      const { poll } = postFromRes;
      assertPoll(poll);
    });
  });

  describe("GET /:id/stats", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("should return a 200 status code and the post stats", async () => {
      const post = await createTestPost({});
      await createTestReposts({ postId: post.id, repostOwnerId: validUserId });
      await createTestView({ postId: post.id, userId: validUserId });
      const res = await request(app).get(`/${post.id}/stats`).set("Cookie", [token]);

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        status: "success",
        data: expect.any(Object),
      });

      const postStats = res.body.data as PostStats;
      assertPostStats(postStats);
      expect(postStats.repostCount).toBe(1);
      expect(postStats.viewsCount).toBe(1);
      expect(postStats.engagementCount).toBe(2);
    });
  });

  describe("POST /:id/stats", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("should return a 201 status code and the created post stats", async () => {
      const post = await createTestPost({});
      const res = await request(app).post(`/${post.id}/stats`).set("Cookie", [token]).send({
        isDetailedViewed: true,
        isProfileViewed: true,
      });

      expect(res.status).toBe(204);

      const fetchedPostStats = await PostStatsModel.findOne({
        postId: post.id,
        userId: validUserId,
      });

      expect(fetchedPostStats).toBeTruthy();
      expect(fetchedPostStats?.isViewed).toBe(true);
      expect(fetchedPostStats?.isDetailedViewed).toBe(true);
      expect(fetchedPostStats?.isProfileViewed).toBe(true);
      expect(fetchedPostStats?.isFollowedFromPost).toBe(false);
      expect(fetchedPostStats?.isHashTagClicked).toBe(false);
    });
  });

  describe("PATCH /:id/stats", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("should return a 200 status code and the updated post stats", async () => {
      const post = await createTestPost({});
      await createTestView({ postId: post.id, userId: validUserId });
      const res = await request(app).patch(`/${post.id}/stats`).set("Cookie", [token]).send({
        isDetailedViewed: true,
        isProfileViewed: true,
      });

      expect(res.status).toBe(204);

      const fetchedPostStats = await PostStatsModel.findOne({
        postId: post.id,
        userId: validUserId,
      });

      expect(fetchedPostStats).toBeTruthy();
      expect(fetchedPostStats?.isViewed).toBe(true);
      expect(fetchedPostStats?.isDetailedViewed).toBe(true);
      expect(fetchedPostStats?.isProfileViewed).toBe(true);
      expect(fetchedPostStats?.isFollowedFromPost).toBe(false);
      expect(fetchedPostStats?.isHashTagClicked).toBe(false);
    });
  });

  describe("GET /bookmark", () => {
    afterEach(async () => {
      await BookmarkedPostModel.deleteMany({});
      jest.clearAllMocks();
    });

    it("should return a 200 status code and an array of posts", async () => {
      await BookmarkedPostModel.create({
        postId: validPostId,
        bookmarkOwnerId: validUserId,
      });

      const res = await request(app).get("/bookmark").set("Cookie", [token]);

      expect(res.status).toBe(200);

      expect(res.body).toEqual({
        status: "success",
        requestedAt: expect.any(String),
        results: expect.any(Number),
        data: expect.any(Array),
      });

      if (!res.body.data.length) throw new Error("No posts found");

      res.body.data.forEach((post: Post) => {
        assertPost(post);
        expect(post.loggedInUserActionState.isBookmarked).toBe(true);
      });
    });

    it("should successfully retrieve and send an empty array if there are no bookmarked posts", async () => {
      const res = await request(app).get("/bookmark").set("Cookie", [token]);

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        status: "success",
        requestedAt: expect.any(String),
        results: 0,
        data: [],
      });
    });
  });

  describe("POST /:id/bookmark", () => {
    beforeEach(async () => {
      await BookmarkedPostModel.deleteMany({});
      jest.clearAllMocks();
    });

    it("should return a 200 status code and the bookmarked post", async () => {
      const res = await request(app).post(`/${validPostId}/bookmark`).set("Cookie", [token]);

      expect(res.status).toBe(201);
      expect(res.body).toEqual({
        status: "success",
        data: expect.any(Object),
      });

      const post = res.body.data;
      assertPost(post);
      expect(post.loggedInUserActionState.isBookmarked).toBe(true);
    });
  });

  describe("DELETE /:id/bookmark", () => {
    beforeEach(async () => {
      await BookmarkedPostModel.deleteMany({});
      jest.clearAllMocks();
    });

    it("should return a 200 status code and the deleted bookmarked post", async () => {
      await BookmarkedPostModel.create({
        postId: validPostId,
        bookmarkOwnerId: validUserId,
      });

      const res = await request(app).delete(`/${validPostId}/bookmark`).set("Cookie", [token]);

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        status: "success",
        data: expect.any(Object),
      });

      const post = res.body.data;
      assertPost(post);
      expect(post.loggedInUserActionState.isBookmarked).toBe(false);
    });

    it("should return a 404 status code if the post is not bookmarked", async () => {
      const res = await request(app).delete(`/${validPostId}/bookmark`).set("Cookie", [token]);

      expect(res.status).toBe(404);
      expect(res.body).toEqual(
        expect.objectContaining({
          status: "fail",
          message: expect.stringContaining("Post is not bookmarked"),
        })
      );
    });
  });

  describe("POST /thread", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("should return a 201 status code and the first post from the thread after save", async () => {
      const posts: any = Array.from({ length: 3 }, (_, i) => ({
        text: `test post number: ${i + 1}`,
      }));

      const res = await request(app).post("/thread").set("Cookie", [token]).send(posts);

      expect(res.status).toBe(201);
      expect(res.body).toEqual({
        status: "success",
        data: expect.any(Object),
      });

      const post = res.body.data;
      assertPost(post);
      expect(post.text).toBe(posts[0].text);
    });
  });

  describe("POST /:id/reply", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("should return a 201 status code and the replied post", async () => {
      const replyToPost = await createTestPost({});
      const res = await request(app)
        .post(`/${replyToPost.id}/reply`)
        .set("Cookie", [token])
        .send({ text: "test reply text" });

      expect(res.status).toBe(201);
      expect(res.body).toEqual({
        status: "success",
        data: expect.any(Object),
      });

      const { reply, post } = res.body.data;
      assertPost(reply);
      assertPost(post);

      expect(reply.parentPostId).toBe(replyToPost.id);
      expect(reply.text).toBe("test reply text");
      expect(post.repliesCount).toBe(1);
    });
  });

  describe("POST /:id/repost", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("should return a 201 status code and the reposted post", async () => {
      const res = await request(app).post(`/${validPostId}/repost`).set("Cookie", [token]);
      expect(res.status).toBe(201);

      expect(res.body).toEqual({
        status: "success",
        data: expect.any(Object),
      });

      const { post, repost } = res.body.data;

      assertPost(post);
      expect(post.loggedInUserActionState.isReposted).toBe(true);
      expect(post.repostsCount).toBe(1);
      assertRepost(repost);
    });
  });

  describe("DELETE /:id/repost", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("should return a 200 status code and the deleted reposted post", async () => {
      await request(app).post(`/${validPostId}/repost`).set("Cookie", [token]);

      const res = await request(app).delete(`/${validPostId}/repost`).set("Cookie", [token]);

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        status: "success",
        data: expect.any(Object),
      });

      const post = res.body.data;

      assertPost(post);
      expect(post.loggedInUserActionState.isReposted).toBe(false);
      expect(post.repostsCount).toBe(0);
    });
  });

  describe("Post /quote", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("should return a 201 status code and the quoted post", async () => {
      const postToQuote = await createTestPost({});

      const res = await request(app)
        .post("/quote")
        .set("Cookie", [token])
        .send({ text: "quoted post test text", quotedPostId: postToQuote.id });

      expect(res.status).toBe(201);
      expect(res.body).toEqual({
        status: "success",
        data: expect.any(Object),
      });

      const post = res.body.data;
      assertPost(post);
      assertQuotedPost(post.quotedPost);
    });

    it("should repost if the quoted post i without content", async () => {
      const postToQuote = await createTestPost({});

      const res = await request(app)
        .post("/quote")
        .set("Cookie", [token])
        .send({ quotedPostId: postToQuote.id });

      expect(res.status).toBe(201);
      expect(res.body).toEqual({
        status: "success",
        data: expect.any(Object),
      });

      const { post, repost } = res.body.data;

      assertPost(post);
      expect(post.loggedInUserActionState.isReposted).toBe(true);
      expect(post.repostsCount).toBe(1);
      assertRepost(repost);
    });
  });

  describe("POST /:id/like", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("should return a 201 status code and the liked post", async () => {
      const res = await request(app).post(`/${validPostId}/like`).set("Cookie", [token]);

      expect(res.status).toBe(201);
      expect(res.body).toEqual({
        status: "success",
        data: expect.any(Object),
      });

      const post = res.body.data;

      assertPost(post);
      expect(post.loggedInUserActionState.isLiked).toBe(true);
      expect(post.likesCount).toBe(1);
    });

    it("should return a 400 status code if the post is already liked", async () => {
      await request(app).post(`/${validPostId}/like`).set("Cookie", [token]);

      const res = await request(app).post(`/${validPostId}/like`).set("Cookie", [token]);

      expect(res.status).toBe(500);
      expect(res.body).toEqual(
        expect.objectContaining({
          status: "error",
          message: expect.stringContaining("duplicate key error"),
        })
      );
    });
  });

  describe("DELETE /:id/like", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("should return a 200 status code and the unliked post", async () => {
      await request(app).post(`/${validPostId}/like`).set("Cookie", [token]);

      const res = await request(app).delete(`/${validPostId}/like`).set("Cookie", [token]);

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        status: "success",
        data: expect.any(Object),
      });

      const post = res.body.data;

      assertPost(post);

      expect(post.loggedInUserActionState.isLiked).toBe(false);
      expect(post.likesCount).toBe(0);
    });

    it("should return a 404 status code if the post is not liked", async () => {
      const res = await request(app).delete(`/${validPostId}/like`).set("Cookie", [token]);
      expect(res.status).toBe(404);
      expect(res.body).toEqual(
        expect.objectContaining({
          status: "fail",
          message: expect.stringContaining("Post is not liked"),
        })
      );
    });
  });

  describe("POST /", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("should return a 201 status code and the created post", async () => {
      const res = await request(app)
        .post("/")
        .set("Cookie", [token])
        .send({ text: "test post text" });

      expect(res.status).toBe(201);
      expect(res.body).toEqual({
        status: "success",
        data: expect.any(Object),
      });

      const post = res.body.data;
      assertPost(post);
    });
  });

  describe("PATCH /:id", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("should return a 200 status code and the updated post", async () => {
      const post = await createTestPost({ createdById: validUserId });
      await new Promise(resolve => setTimeout(resolve, 1000));

      const res = await request(app)
        .patch(`/${post.id}`)

        .set("Cookie", [token])

        .send({ text: "updated post text" });

      expect(res.status).toBe(200);

      expect(res.body).toEqual({
        status: "success",
        data: expect.any(Object),
      });

      const updatedPost = res.body.data as Post;
      assertPost(updatedPost);

      expect(updatedPost.id).toBe(post.id);
      expect(updatedPost.text).toBe("updated post text");
      expect(updatedPost.updatedAt).not.toBe(post.updatedAt);
      const updatedPostUpdatedAt = new Date(updatedPost.updatedAt).getTime();
      const postUpdatedAt = new Date(post.updatedAt).getTime();
      expect(updatedPostUpdatedAt).toBeGreaterThan(postUpdatedAt);
      const updatedPostCreatedAt = new Date(updatedPost.createdAt).getTime();
      const postCreatedAt = new Date(post.createdAt).getTime();
      expect(updatedPostCreatedAt).toBe(postCreatedAt);
      expect(updatedPost.createdBy.id).toBe(post.createdBy.id);
    });
  });

  describe("DELETE /:id", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("should return a 204 status code and the deleted post", async () => {
      const post = await createTestPost({ createdById: validUserId });

      const res = await request(app).delete(`/${post.id}`).set("Cookie", [token]);

      expect(res.status).toBe(204);
    });
  });

  describe("POST /poll/:id/vote", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("should return a 200 status code and the updated post", async () => {
      const post = await createTestPost({ body: { poll: createTestPoll({}) } });

      const res = await request(app)
        .post(`/poll/${post.id}/vote`)
        .set("Cookie", [token])
        .send({ optionIdx: 0 });

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        status: "success",
        data: expect.any(Object),
      });

      const updatedPost = res.body.data as Post;

      assertPost(updatedPost);
      expect(updatedPost.poll?.options[0].voteCount).toBe(1);
    });
  });

  describe("GET /promotional", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("should return a 201 status code and the created post", async () => {
      await createManyTestPromotionalPosts({ numOfPosts: 2 });

      const res = await request(app).get("/promotional").set("Cookie", [adminToken]);

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        status: "success",
        requestedAt: expect.any(String),
        results: expect.any(Number),
        data: expect.any(Array),
      });

      if (!res.body.data.length) throw new Error("No posts found");
      res.body.data.forEach(assertPromotionalPost);
    });
  });

  describe("POST /promotional", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("should return a 201 status code and the raw data of the post", async () => {
      const res = await request(app)
        .post("/promotional")
        .set("Cookie", [adminToken])
        .send({ text: "test post text", linkToSite: "TestSite", companyName: "TestCompany" });

      expect(res.status).toBe(201);
      expect(res.body).toEqual({
        status: "success",
        data: expect.any(Object),
      });

      expect(res.body.data).toEqual(
        expect.objectContaining({
          text: "test post text",
          linkToSite: "TestSite",
          companyName: "TestCompany",
        })
      );
    });
  });
});
