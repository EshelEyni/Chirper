/* eslint-disable @typescript-eslint/no-explicit-any */
import request from "supertest";
import express from "express";
import router from "./post.router";
import { errorHandler } from "../../../services/error/error.service";
import { BookmarkedPostModel } from "../models/bookmark/bookmark-post.model";
import {
  assertPost,
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
  });
});
