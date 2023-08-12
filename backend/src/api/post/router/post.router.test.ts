/* eslint-disable @typescript-eslint/no-explicit-any */
require("dotenv").config();
import request from "supertest";
import express from "express";
import router from "./post.router";
import { AppError, errorHandler } from "../../../services/error/error.service";
import mongoose, { Types } from "mongoose";

jest.mock("../../../middlewares/authGuards/authGuards.middleware", () => ({
  checkUserAuthentication: jest.fn().mockImplementation((req, res, next) => {
    req.loggedInUserId = new Types.ObjectId().toHexString();
    next();
  }),
  checkAdminAuthorization: jest.fn().mockImplementation((req, res, next) => {
    next();
  }),
}));

const app = express();
app.use(express.json());
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
    });
  });
});
