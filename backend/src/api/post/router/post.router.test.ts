/* eslint-disable @typescript-eslint/no-explicit-any */
import request from "supertest";
import express from "express";
import router from "./post.router";
import { errorHandler } from "../../../services/error/error.service";
import { BookmarkedPostModel } from "../models/bookmark/bookmark-post.model";
import {
  assertPost,
  assertRepost,
  connectToTestDB,
  createTestPost,
  createTestUser,
  deleteTestPost,
  deleteTestUser,
  disconnectFromTestDB,
  getLoginTokenStrForTest,
} from "../../../services/test-util.service";
import cookieParser from "cookie-parser";
import setupAsyncLocalStorage from "../../../middlewares/setupAls/setupAls.middleware";
import { Post } from "../../../../../shared/interfaces/post.interface";

const app = express();
app.use(express.json());
app.use(cookieParser());
app.all("*", setupAsyncLocalStorage);
app.use(router);
app.use(errorHandler);

describe("Post Router", () => {
  let validUserId: string, validPostId: string, token: string;

  beforeAll(async () => {
    await connectToTestDB();
    validUserId = (await createTestUser({})).id;
    validPostId = (await createTestPost({ createdById: validUserId })).id;
    token = getLoginTokenStrForTest(validUserId);
  });

  afterAll(async () => {
    await deleteTestPost(validPostId);
    await deleteTestUser(validUserId);
    await disconnectFromTestDB();
  });

  fdescribe("POST /:id/repost", () => {
    beforeEach(async () => {
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

  describe("POST /:id/like", () => {
    beforeEach(async () => {
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
    beforeEach(async () => {
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
});
