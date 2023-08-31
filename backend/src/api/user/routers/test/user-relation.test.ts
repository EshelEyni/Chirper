/* eslint-disable @typescript-eslint/no-explicit-any */
import request from "supertest";
import express from "express";
import router from "../user-relation.router";
import { AppError, errorHandler } from "../../../../services/error/error.service";
import mongoose, { Types } from "mongoose";
import userRelationService from "../../services/user-relation/user-relation.service";
import { UserModel } from "../../models/user/user.model";
import {
  assertPost,
  assertUser,
  connectToTestDB,
  createTestUser,
  getLoginTokenStrForTest,
  getMongoId,
} from "../../../../services/test-util.service";
import { User } from "../../../../../../shared/interfaces/user.interface";
import { UserRelationModel } from "../../models/user-relation/user-relation.model";
import cookieParser from "cookie-parser";
import { Post } from "../../../../../../shared/interfaces/post.interface";
import { PostModel } from "../../../post/models/post.model";
import setupAsyncLocalStorage from "../../../../middlewares/setupAls/setupAls.middleware";
import { PostStatsModel } from "../../../post/models/post-stats.model";

const app = express();
app.use(cookieParser());
app.use(express.json());
app.all("*", setupAsyncLocalStorage);
app.use(router);
app.use(errorHandler);

const mockedPostID = "64dd30f4937431fdad0f6d91";
const mockedUserID = "64dd30f4937431fdad0f6d92";

describe("User Router: User Relation Actions", () => {
  let testLoggedInUser: User, validUser: User, token: string, testPost: Post;

  async function createAndSetTestLoggedInUserAndToken({ isAdmin = false } = {}) {
    testLoggedInUser = (await createTestUser({ id: mockedUserID, isAdmin })) as User;
    token = getLoginTokenStrForTest(testLoggedInUser.id);
  }

  async function createTestPost() {
    await PostModel.findByIdAndDelete(mockedPostID);
    testPost = (
      await PostModel.create({
        _id: mockedPostID,
        text: "User Router Post",
        createdById: validUser.id,
      })
    ).toObject() as unknown as Post;
  }

  async function createTestFollowingFromPost() {
    const fromUserId = testLoggedInUser.id;
    const toUserId = validUser.id;
    const session = await mongoose.startSession();
    session.startTransaction();
    await UserRelationModel.create([{ fromUserId, toUserId, kind: "Follow" }], { session });
    await PostStatsModel.findOneAndUpdate(
      { postId: testPost.id, userId: fromUserId },
      { isFollowedFromPost: true },
      { session, upsert: true }
    );
    await session.commitTransaction();
  }

  beforeAll(async () => {
    // Using a remote DB for testing transactions
    await connectToTestDB({ isRemoteDB: true });
    validUser = await createTestUser({});
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe("POST /:id/follow", () => {
    const id = getMongoId();

    beforeEach(async () => {
      await UserRelationModel.deleteMany({});
      await createAndSetTestLoggedInUserAndToken();
    });

    afterEach(async () => {
      await UserRelationModel.deleteMany({});
    });

    it("should return 200 and the updated users data when following is added", async () => {
      const res = await request(app).post(`/${validUser.id}/follow`).set("Cookie", [token]);
      const followingLinkage = await UserRelationModel.findOne({
        fromUserId: testLoggedInUser.id,
        toUserId: validUser.id,
        kind: "Follow",
      });

      expect(followingLinkage).toBeTruthy();

      expect(res.statusCode).toEqual(200);

      const users = Object.values(res.body.data) as User[];
      expect(users.length).toEqual(2);
      users.forEach(assertUser);

      const [loggedInUser, followedUser] = users;
      expect(loggedInUser.id).toEqual(testLoggedInUser.id);
      expect(followedUser.id).toEqual(validUser.id);
      expect(loggedInUser.followingCount).toEqual(testLoggedInUser.followingCount + 1);
      expect(followedUser.followersCount).toEqual(validUser.followersCount + 1);
    });

    it("should return 400 if the provided ID is not a valid MongoDB ID", async () => {
      const invalidUserId = "12345";
      const res = await request(app).post(`/${invalidUserId}/follow`).set("Cookie", [token]);
      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toContain("Invalid user id");
    });

    it("should return 500 if the user with the given ID is not found", async () => {
      const id = new Types.ObjectId();
      await UserModel.findByIdAndDelete(id);
      const res = await request(app).post(`/${id}/follow`).set("Cookie", [token]);
      expect(res.statusCode).toEqual(500);
      expect(res.body.message).toContain("Target User not found");
    });

    it("should return 500 if an error occurs", async () => {
      jest.spyOn(userRelationService, "add").mockRejectedValueOnce(new Error("Test error"));
      const res = await request(app).post(`/${id}/follow`).set("Cookie", [token]);
      expect(res.statusCode).toEqual(500);
    });
  });

  describe("DELETE /:id/follow", () => {
    beforeAll(async () => {
      await UserRelationModel.deleteMany({});
      await createAndSetTestLoggedInUserAndToken();
    });

    afterAll(async () => {
      await UserRelationModel.deleteMany({});
    });

    it("should successfully remove a following", async () => {
      await UserRelationModel.create({
        fromUserId: testLoggedInUser.id,
        toUserId: validUser.id,
        kind: "Follow",
      });
      const spy = jest.spyOn(userRelationService, "remove");
      const res = await request(app).delete(`/${validUser.id}/follow`).set("Cookie", [token]);
      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toEqual("success");
      expect(spy).toHaveBeenCalled();
    });

    it("should return 401 if the user is not logged in", async () => {
      const res = await request(app).delete(`/${validUser.id}/follow`);
      expect(res.statusCode).toEqual(401);
      expect(res.body.message).toContain("You are not logged in! Please log in to get access.");
    });

    it("should return 400 if the provided ID is not a valid MongoDB ID", async () => {
      const invalidUserId = "12345";
      const res = await request(app).delete(`/${invalidUserId}/follow`).set("Cookie", [token]);
      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toContain("Invalid user id");
    });

    it("should return 404 if the user with the given ID is not found", async () => {
      const id = new Types.ObjectId();
      await UserModel.findByIdAndDelete(id);
      const res = await request(app).delete(`/${id}/follow`).set("Cookie", [token]);
      expect(res.statusCode).toEqual(404);
      expect(res.body.message).toContain("You are not following this User");
    });

    it("should return 500 if an internal server error occurs", async () => {
      const id = new Types.ObjectId();

      jest
        .spyOn(userRelationService, "remove")
        .mockRejectedValueOnce(new Error("Internal server error"));

      const res = await request(app).delete(`/${id}/follow`).set("Cookie", [token]);
      expect(res.statusCode).toEqual(500);
      expect(res.body.message).toContain("Internal server error");
    });
  });

  describe("POST /:userId/follow/:postId/fromPost", () => {
    beforeAll(async () => {
      await createAndSetTestLoggedInUserAndToken();
    });

    beforeEach(async () => {
      jest.clearAllMocks();
      await UserRelationModel.deleteMany({});
    });

    it("should successfully add a following from a post", async () => {
      await createTestPost();

      const res = await request(app)
        .post(`/${validUser.id}/follow/${testPost.id}/fromPost`)
        .set("Cookie", [token]);
      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toEqual("success");
    });

    it("should return a post with loggedInUserActionState.isFollowedFromPost after a succesfull request", async () => {
      await createTestPost();
      const res = await request(app)
        .post(`/${validUser.id}/follow/${testPost.id}/fromPost`)
        .set("Cookie", [token]);
      const post = res.body.data as Post;
      assertPost(post);
      expect(post.loggedInUserActionState.isFollowedFromPost).toEqual(true);
      const user = post.createdBy as User;
      expect(user.followersCount).toEqual(validUser.followersCount + 1);
    });

    it("should return 400 if the provided userId or postId is not a valid MongoDB ID", async () => {
      const invalidUserId = "12345";
      const postId = getMongoId();
      const res = await request(app)
        .post(`/${invalidUserId}/follow/${postId}/fromPost`)
        .set("Cookie", [token]);
      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toContain("Invalid user id: 12345");

      const userId = getMongoId();
      const invalidPostId = "12345";
      const res_2 = await request(app)
        .post(`/${userId}/follow/${invalidPostId}/fromPost`)
        .set("Cookie", [token]);
      expect(res_2.statusCode).toEqual(400);
      expect(res_2.body.message).toContain("Invalid post id: 12345");
    });

    it("should return 404 if the post with the given ID is not found", async () => {
      const userId = getMongoId();
      const nonExistentPostId = getMongoId();

      jest.spyOn(userRelationService, "add").mockRejectedValueOnce(new AppError("Post not found", 404));

      const res = await request(app)
        .post(`/${userId}/follow/${nonExistentPostId}/fromPost`)
        .set("Cookie", [token]);
      expect(res.statusCode).toEqual(404);
      expect(res.body.message).toContain("Post not found");
    });

    it("should return 404 if the Follower or Following with the given ID is not found", async () => {
      const followerId = getMongoId();
      const nonExistentPostId = getMongoId();

      jest
        .spyOn(userRelationService, "add")
        .mockRejectedValueOnce(new AppError("Follower not found", 404));

      const res = await request(app)
        .post(`/${followerId}/follow/${nonExistentPostId}/fromPost`)
        .set("Cookie", [token]);
      expect(res.statusCode).toEqual(404);
      expect(res.body.message).toContain("Follower not found");

      jest
        .spyOn(userRelationService, "add")
        .mockRejectedValueOnce(new AppError("Following not found", 404));

      const res_3 = await request(app)
        .post(`/${followerId}/follow/${nonExistentPostId}/fromPost`)
        .set("Cookie", [token]);
      expect(res_3.statusCode).toEqual(404);
      expect(res_3.body.message).toContain("Following not found");
    });

    it("should return 500 if an internal server error occurs", async () => {
      const userId = getMongoId();
      const postId = getMongoId();

      jest
        .spyOn(userRelationService, "add")
        .mockRejectedValueOnce(new AppError("Internal server error", 500));

      const res = await request(app)
        .post(`/${userId}/follow/${postId}/fromPost`)
        .set("Cookie", [token]);

      expect(res.statusCode).toEqual(500);
      expect(res.body.message).toContain("Internal server error");
    });
  });

  describe("DELETE /:userId/follow/:postId/fromPost", () => {
    beforeAll(async () => {
      await createAndSetTestLoggedInUserAndToken();
    });

    afterEach(async () => {
      await UserRelationModel.deleteMany({});
    });

    it("should successfully remove following from post", async () => {
      await createTestPost();
      await createTestFollowingFromPost();
      const res = await request(app)
        .delete(`/${validUser.id}/follow/${testPost.id}/fromPost`)
        .set("Cookie", [token]);

      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toEqual("success");
    });

    it("should return a post with !loggedInUserActionState.isFollowedFromPost after a succesfull request", async () => {
      await createTestPost();
      await createTestFollowingFromPost();
      const res = await request(app)
        .delete(`/${validUser.id}/follow/${testPost.id}/fromPost`)
        .set("Cookie", [token]);

      const post = res.body.data as Post;
      assertPost(post);
      expect(post.loggedInUserActionState.isFollowedFromPost).toEqual(false);
      const user = post.createdBy as User;
      expect(user.followersCount).toEqual(validUser.followersCount);
    });

    it("should return 400 if the provided userId or postId is not a valid MongoDB ID", async () => {
      const invalidUserId = "12345";
      const postId = getMongoId();

      const res = await request(app)
        .delete(`/${invalidUserId}/follow/${postId}/fromPost`)
        .set("Cookie", [token]);

      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toContain("Invalid user id: 12345");

      const userId = getMongoId();
      const invalidPostId = "12345";

      const res_2 = await request(app)
        .delete(`/${userId}/follow/${invalidPostId}/fromPost`)
        .set("Cookie", [token]);

      expect(res_2.statusCode).toEqual(400);
      expect(res_2.body.message).toContain("Invalid post id: 12345");
    });

    it("should handle unexpected errors", async () => {
      jest.spyOn(userRelationService, "remove").mockRejectedValueOnce(new Error("Unexpected error"));

      const userId = getMongoId();
      const postId = getMongoId();

      const res = await request(app)
        .delete(`/${userId}/follow/${postId}/fromPost`)
        .set("Cookie", [token]);

      expect(res.statusCode).toEqual(500);
      expect(res.body.message).toContain("Unexpected error");
    });
  });
});
