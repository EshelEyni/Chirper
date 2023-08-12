/* eslint-disable @typescript-eslint/no-explicit-any */
require("dotenv").config();
import request from "supertest";
import express from "express";
import router from "./post.router";
import { AppError, errorHandler } from "../../../services/error/error.service";
import mongoose from "mongoose";
import { PostModel } from "../models/post.model";
import { BookmarkedPostModel } from "../models/bookmark-post.model";
import { assertPost, getLoginTokenStrForTest } from "../../../services/test-util.service";
import { UserModel } from "../../user/models/user.model";
import cookieParser from "cookie-parser";

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(router);
app.use(errorHandler);

describe("Post Router", () => {
  async function connectToDB() {
    const { DB_URL } = process.env;
    if (!DB_URL) throw new AppError("DB_URL URL is not defined.", 500);

    await mongoose.connect(DB_URL, {
      dbName: process.env.TEST_DB_NAME,
    });
  }

  beforeAll(async () => {
    await connectToDB();
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe("GET /bookmark", () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it("should return a 200 status code and an array of posts", async () => {
      const res = await request(app).get("/bookmark");

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        status: "success",
        requestedAt: expect.any(String),
        results: expect.any(Number),
        data: expect.any(Array),
      });

      if (res.body.data.length) {
        res.body.data.forEach((post: any) => {
          assertPost(post);
        });
      }
    });
  });

  describe("POST /:id/bookmark", () => {
    beforeEach(async () => {
      await BookmarkedPostModel.deleteMany({}).exec();
      jest.clearAllMocks();
    });

    it("should return a 200 status code and the bookmarked post", async () => {
      const post = (await PostModel.findOne({})
        .setOptions({ skipHooks: true })
        .select("_id")
        .lean()
        .exec()) as unknown as { _id: string };

      const validPostId = post?._id.toString();

      const res = await request(app).post(`/${validPostId}/bookmark`);
      expect(res.status).toBe(201);
      expect(res.body).toEqual({
        status: "success",
        data: expect.any(Object),
      });
      assertPost(res.body.data);
    });
  });

  fdescribe("DELETE /:id/bookmark", () => {
    beforeEach(async () => {
      await BookmarkedPostModel.deleteMany({}).exec();
      jest.clearAllMocks();
    });

    fit("should return a 200 status code and the deleted bookmarked post", async () => {
      const post = (await PostModel.findOne({})
        .setOptions({ skipHooks: true })
        .select("_id")
        .lean()
        .exec()) as unknown as { _id: any };

      const user = (await UserModel.findOne({})
        .setOptions({ skipHooks: true })
        .select("_id")
        .lean()
        .exec()) as unknown as { _id: any };

      const [validPostId, validUserId] = [post?._id.toHexString(), user?._id.toHexString()];

      await BookmarkedPostModel.create({
        postId: validPostId,
        bookmarkOwnerId: validUserId,
      });

      const res = await request(app)
        .delete(`/${validPostId}/bookmark`)
        .set("Cookie", [getLoginTokenStrForTest(validUserId)]);

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        status: "success",
        data: expect.any(Object),
      });
      assertPost(res.body.data);
    });
  });
});
