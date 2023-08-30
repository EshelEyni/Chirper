/* eslint-disable @typescript-eslint/no-explicit-any */
import request from "supertest";
import express from "express";
import router from "../user-relation.router";
import { AppError, errorHandler } from "../../../../services/error/error.service";
import userService from "../../services/user/user.service";
import mongoose from "mongoose";
import { UserModel } from "../../models/user/user.model";
import {
  assertUser,
  connectToTestDB,
  createTestUser,
  deleteTestUser,
  getMongoId,
} from "../../../../services/test-util.service";
import cookieParser from "cookie-parser";
import setupAsyncLocalStorage from "../../../../middlewares/setupAls/setupAls.middleware";
import { User } from "../../../../../../shared/interfaces/user.interface";

const app = express();
app.use(cookieParser());
app.use(express.json());
app.all("*", setupAsyncLocalStorage);
app.use(router);
app.use(errorHandler);

xdescribe("User Router: GET Actions", () => {
  let validUser: User;

  beforeAll(async () => {
    await connectToTestDB();
    validUser = await createTestUser({});
  });

  afterAll(async () => {
    await deleteTestUser(validUser.id);
    await mongoose.connection.close();
  });

  describe("GET /", () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it("should return 200 and an array of users if users match the query", async () => {
      const res = await request(app).get("/");
      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual({
        status: "success",
        requestedAt: expect.any(String),
        results: expect.any(Number),
        data: expect.any(Array),
      });
      const users = res.body.data;
      expect(users.length).toBeGreaterThan(0);
      users.forEach(assertUser);
    });

    it("should return 200 and an empty array if no users match the query", async () => {
      jest.spyOn(userService, "query").mockResolvedValue([]);
      const res = await request(app).get("/");
      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toEqual([]);
    });

    it("should return 500 if an error occurs", async () => {
      jest.spyOn(userService, "query").mockRejectedValueOnce(new AppError("Test error", 500));
      const res = await request(app).get("/");
      expect(res.status).toEqual(500);
      expect(res.body.status).toEqual("error");
      expect(res.body.message).toEqual("Test error");
    });
  });

  describe("GET /:id", () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it("should return 200 and a user if a user with the given ID exists", async () => {
      const res = await request(app).get(`/${validUser.id}`);
      expect(res.statusCode).toEqual(200);
      const user = res.body.data;
      assertUser(user);
      expect(user.username).toEqual(validUser.username);
      expect(user.email).toEqual(validUser.email);
    });

    it("should return 404 if no user with the given ID exists", async () => {
      const id = getMongoId();
      await UserModel.findByIdAndDelete(id);
      const res = await request(app).get(`/${id}`);
      expect(res.statusCode).toEqual(404);
      expect(res.body.message).toEqual(`No user was found with the id: ${id}`);
    });

    it("should return 500 if an error occurs", async () => {
      const id = getMongoId();

      jest.spyOn(UserModel, "findById").mockImplementationOnce(
        () =>
          ({
            populate: jest.fn(),
            exec: jest.fn().mockImplementation(() => Promise.reject(new Error("Database error"))),
          } as any)
      );

      const res = await request(app).get(`/${id}`);
      expect(res.statusCode).toEqual(500);
      expect(res.body.message).toEqual("Database error");
    });

    it("should return 400 for invalid user ID format", async () => {
      const invalidId = "invalid-id";
      const res = await request(app).get(`/${invalidId}`);
      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toEqual(`Invalid user id: ${invalidId}`);
    });
  });

  describe("GET /username/:username", () => {
    it("should return 200 and the user data if the user is found", async () => {
      const res = await request(app).get(`/username/${validUser.username}`);
      expect(res.statusCode).toEqual(200);
      const user = res.body.data;
      assertUser(user);
      expect(user.username).toEqual(validUser.username);
      expect(user.email).toEqual(validUser.email);
    });

    it("should return 404 if the user is not found", async () => {
      const username = "nonexistentuser";
      await UserModel.findOneAndDelete({ username });

      const res = await request(app).get(`/username/${username}`);
      expect(res.statusCode).toEqual(404);
      expect(res.body.message).toEqual(`User with username ${username} not found`);
    });

    it("should return 500 if an error occurs", async () => {
      jest.spyOn(userService, "getByUsername").mockRejectedValueOnce(new Error("Database error"));

      const res = await request(app).get("/username/testuser");
      expect(res.statusCode).toEqual(500);
      expect(res.body.message).toEqual("Database error");
    });
  });
});
