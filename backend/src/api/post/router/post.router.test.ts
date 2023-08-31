/* eslint-disable @typescript-eslint/no-explicit-any */
import request from "supertest";
import express from "express";
import router from "./post.router";
import { AppError, errorHandler } from "../../../services/error/error.service";
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
import bookmarkService from "../services/bookmark/bookmark.service";
import setupAsyncLocalStorage from "../../../middlewares/setupAls/setupAls.middleware";

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

  fdescribe("GET /bookmark", () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    fit("should return a 200 status code and an array of posts", async () => {
      await bookmarkService.add(validPostId, validUserId);

      const res = await request(app).get("/bookmark").set("Cookie", [token]);
      console.log("res.body", res.body);

      expect(res.status).toBe(200);

      expect(res.body).toEqual({
        status: "success",
        requestedAt: expect.any(String),
        results: expect.any(Number),
        data: expect.any(Array),
      });

      if (res.body.data.length) res.body.data.forEach(assertPost);
    });

    it("should successfully retrieve and send an empty array if there are no bookmarked posts", async () => {
      jest.spyOn(bookmarkService, "get").mockResolvedValue([]);
      const res = await request(app).get("/bookmark").set("Cookie", [token]);

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        status: "success",
        requestedAt: expect.any(String),
        results: 0,
        data: [],
      });
    });

    it("should return a 500 error if bookmarkService.get throws an error", async () => {
      jest.spyOn(bookmarkService, "get").mockRejectedValue(new AppError("Test Error", 500));
      const res = await request(app).get("/bookmark").set("Cookie", [token]);
      expect(res.status).toBe(500);
      expect(res.body).toEqual(
        expect.objectContaining({
          status: "error",
          message: "Test Error",
        })
      );
    });

    it("should throw an error if user is not logged in", async () => {
      const res = await request(app).get("/bookmark");
      expect(res.status).toBe(401);
      expect(res.body).toEqual(
        expect.objectContaining({
          status: "fail",
          message: "You are not logged in! Please log in to get access.",
        })
      );
    });

    it("should throw an error if loggedInUser is not valid", async () => {
      const res = await request(app).get("/bookmark").set("Cookie", [`loginToken=invalidToken`]);
      expect(res.status).toBe(401);
      expect(res.body).toEqual(
        expect.objectContaining({
          status: "fail",
          message: "Invalid Token",
        })
      );
    });

    it("should handle errors in production environment", async () => {
      process.env.NODE_ENV = "production";
      jest.spyOn(bookmarkService, "get").mockRejectedValue(new Error("Test Error"));
      const res = await request(app).get("/bookmark").set("Cookie", [token]);
      expect(res.status).toBe(500);
      expect(res.body).toEqual(
        expect.objectContaining({
          status: "error",
          message: "Something went wrong!",
        })
      );
      process.env.NODE_ENV = "test";
      jest.spyOn(bookmarkService, "get").mockRestore();
    });

    it("should handle operational errors in development environment", async () => {
      process.env.NODE_ENV = "development";
      jest.spyOn(bookmarkService, "get").mockRejectedValue(new AppError("Test Error", 500));
      const res = await request(app).get("/bookmark").set("Cookie", [token]);
      expect(res.status).toBe(500);
      expect(res.body).toEqual(
        expect.objectContaining({
          status: "error",
          message: "Test Error",
        })
      );
      process.env.NODE_ENV = "test";
      jest.spyOn(bookmarkService, "get").mockRestore();
    });
  });

  describe("POST /:id/bookmark", () => {
    beforeEach(async () => {
      await BookmarkedPostModel.deleteMany({}).exec();
      jest.clearAllMocks();
    });

    it("should return a 200 status code and the bookmarked post", async () => {
      const res = await request(app).post(`/${validPostId}/bookmark`).set("Cookie", [token]);

      expect(res.status).toBe(201);
      expect(res.body).toEqual({
        status: "success",
        data: expect.any(Object),
      });
      assertPost(res.body.data);
    });

    it("should return a 500 error if bookmarkService.add throws an error", async () => {
      jest.spyOn(bookmarkService, "add").mockRejectedValue(new AppError("Test Error", 500));
      const res = await request(app).post(`/${validPostId}/bookmark`).set("Cookie", [token]);
      expect(res.status).toBe(500);
      expect(res.body).toEqual(
        expect.objectContaining({
          status: "error",
          message: "Test Error",
        })
      );
      jest.spyOn(bookmarkService, "add").mockRestore();
    });

    it("should throw an error if user is not logged in", async () => {
      const res = await request(app).post(`/${validPostId}/bookmark`);
      expect(res.status).toBe(401);
      expect(res.body).toEqual(
        expect.objectContaining({
          status: "fail",
          message: "You are not logged in! Please log in to get access.",
        })
      );
    });

    it("should throw an error if loggedInUser is not valid", async () => {
      const res = await request(app)
        .post(`/${validPostId}/bookmark`)
        .set("Cookie", [`loginToken=invalidToken`]);
      expect(res.status).toBe(401);
      expect(res.body).toEqual(
        expect.objectContaining({
          status: "fail",
          message: "Invalid Token",
        })
      );
    });

    it("should throw an error if the postId is invalid", async () => {
      const res = await request(app).post(`/invalidPostId/bookmark`).set("Cookie", [token]);
      expect(res.status).toBe(400);
      expect(res.body).toEqual(
        expect.objectContaining({
          status: "fail",
          message: "Invalid post id: invalidPostId",
        })
      );
    });

    it("should throw an error if the post is already bookmarked", async () => {
      await BookmarkedPostModel.create({
        postId: validPostId,
        bookmarkOwnerId: validUserId,
      });

      const res = await request(app).post(`/${validPostId}/bookmark`).set("Cookie", [token]);

      expect(res.status).toBe(500);
      expect(res.body).toEqual(
        expect.objectContaining({
          status: "error",
          message: expect.stringContaining("E11000 duplicate key error collection"),
        })
      );
    });

    it("should handle errors in production environment", async () => {
      process.env.NODE_ENV = "production";
      jest.spyOn(bookmarkService, "add").mockRejectedValue(new Error("Test Error"));
      const res = await request(app).post(`/${validPostId}/bookmark`).set("Cookie", [token]);
      expect(res.status).toBe(500);
      expect(res.body).toEqual(
        expect.objectContaining({
          status: "error",
          message: "Something went wrong!",
        })
      );
      process.env.NODE_ENV = "test";
      jest.spyOn(bookmarkService, "add").mockRestore();
    });

    it("should handle operational errors in development environment", async () => {
      process.env.NODE_ENV = "development";
      jest.spyOn(bookmarkService, "add").mockRejectedValue(new AppError("Test Error", 500));
      const res = await request(app).post(`/${validPostId}/bookmark`).set("Cookie", [token]);
      expect(res.status).toBe(500);
      expect(res.body).toEqual(
        expect.objectContaining({
          status: "error",
          message: "Test Error",
        })
      );
      process.env.NODE_ENV = "test";
      jest.spyOn(bookmarkService, "add").mockRestore();
    });
  });

  describe("DELETE /:id/bookmark", () => {
    beforeEach(async () => {
      await BookmarkedPostModel.deleteMany({}).exec();
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
      assertPost(res.body.data);
    });

    it("should return a 500 error if bookmarkService.remove throws an error", async () => {
      jest.spyOn(bookmarkService, "remove").mockRejectedValue(new AppError("Test Error", 500));
      const res = await request(app).delete(`/${validPostId}/bookmark`).set("Cookie", [token]);
      expect(res.status).toBe(500);
      expect(res.body).toEqual(
        expect.objectContaining({
          status: "error",
          message: "Test Error",
        })
      );
      jest.spyOn(bookmarkService, "remove").mockRestore();
    });

    it("should throw an error if user is not logged in", async () => {
      const res = await request(app).delete(`/${validPostId}/bookmark`);
      expect(res.status).toBe(401);
      expect(res.body).toEqual(
        expect.objectContaining({
          status: "fail",
          message: "You are not logged in! Please log in to get access.",
        })
      );
    });

    it("should throw an error if loggedInUser is not valid", async () => {
      const res = await request(app)
        .delete(`/${validPostId}/bookmark`)
        .set("Cookie", [`loginToken=invalidToken`]);
      expect(res.status).toBe(401);
      expect(res.body).toEqual(
        expect.objectContaining({
          status: "fail",
          message: "Invalid Token",
        })
      );
    });

    it("should throw an error if the postId is invalid", async () => {
      const res = await request(app).delete(`/invalidPostId/bookmark`).set("Cookie", [token]);
      expect(res.status).toBe(400);
      expect(res.body).toEqual(
        expect.objectContaining({
          status: "fail",
          message: "Invalid post id: invalidPostId",
        })
      );
    });

    it("should throw an error if the post is not bookmarked", async () => {
      const res = await request(app).delete(`/${validPostId}/bookmark`).set("Cookie", [token]);
      expect(res.status).toBe(404);
      expect(res.body).toEqual(
        expect.objectContaining({
          status: "fail",
          message: "This Post is not Bookmarked",
        })
      );
    });

    it("should handle errors in production environment", async () => {
      process.env.NODE_ENV = "production";
      jest.spyOn(bookmarkService, "remove").mockRejectedValue(new Error("Test Error"));
      const res = await request(app).delete(`/${validPostId}/bookmark`).set("Cookie", [token]);
      expect(res.status).toBe(500);
      expect(res.body).toEqual(
        expect.objectContaining({
          status: "error",
          message: "Something went wrong!",
        })
      );
      process.env.NODE_ENV = "test";
      jest.spyOn(bookmarkService, "remove").mockRestore();
    });

    it("should handle operational errors in development environment", async () => {
      process.env.NODE_ENV = "development";
      jest.spyOn(bookmarkService, "remove").mockRejectedValue(new AppError("Test Error", 500));
      const res = await request(app).delete(`/${validPostId}/bookmark`).set("Cookie", [token]);
      expect(res.status).toBe(500);
      expect(res.body).toEqual(
        expect.objectContaining({
          status: "error",
          message: "Test Error",
        })
      );
      process.env.NODE_ENV = "test";
      jest.spyOn(bookmarkService, "remove").mockRestore();
    });
  });
});
