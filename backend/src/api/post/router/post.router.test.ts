/* eslint-disable @typescript-eslint/no-explicit-any */
import request from "supertest";
import express from "express";
import router from "./post.router";
import { AppError, errorHandler } from "../../../services/error/error.service";
import { Types } from "mongoose";
import bookmarkService from "../services/bookmark/bookmark.service";

jest.mock("../../../middlewares/authGuards/authGuards.middleware", () => ({
  checkUserAuthentication: jest.fn().mockImplementation((req, res, next) => {
    req.loggedInUserId = new Types.ObjectId().toHexString();
    next();
  }),
  checkAdminAuthorization: jest.fn().mockImplementation((req, res, next) => {
    next();
  }),
}));

jest.mock("../services/bookmark/bookmark.service");

const app = express();
app.use(express.json());
app.use(router);
app.use(errorHandler);

describe("Post Router", () => {
  describe("GET /bookmark", () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    function getMockPost() {
      return {
        _id: new Types.ObjectId().toHexString(),
        title: "Test Post",
        content: "Test Content",
        createdBy: {
          _id: "test-user-id",
          username: "test-user",
        },
        loggedInUserActionState: {
          isBookmarked: true,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }

    it("should return a 200 status code and an array of posts", async () => {
      const mockPosts = Array(5).fill(null).map(getMockPost);
      const res = await request(app).get("/bookmark");

      (bookmarkService.get as jest.Mock).mockResolvedValueOnce([]);

      expect(res.status).toBe(200);
    //   expect(res.body).toEqual({ data: [] });
    });
  });
});
