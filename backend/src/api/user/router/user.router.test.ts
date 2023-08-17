/* eslint-disable @typescript-eslint/no-explicit-any */
import request from "supertest";
import express from "express";
import router from "./user.router";
import { AppError, errorHandler } from "../../../services/error/error.service";
import userService from "../services/user/user.service";
import mongoose, { Types } from "mongoose";
import followerService from "../services/follower/follower.service";
import { UserModel } from "../models/user.model";
import {
  assertPost,
  assertUser,
  connectToTestDB,
  getLoginTokenStrForTest,
} from "../../../services/test-util.service";
import { User } from "../../../../../shared/interfaces/user.interface";
import { FollowerModel } from "../models/followers.model";
import cookieParser from "cookie-parser";
import { Post } from "../../../../../shared/interfaces/post.interface";
import { PostModel } from "../../post/models/post.model";
import setupAsyncLocalStorage from "../../../middlewares/setupAls/setupAls.middleware";
import { PostStatsModel } from "../../post/models/post-stats.model";

const app = express();
app.use(cookieParser());
app.use(express.json());
app.all("*", setupAsyncLocalStorage);
app.use(router);
app.use(errorHandler);

describe("User Router", () => {
  const mockedPostID = "64dd30f4937431fdad0f6d91";
  const mockedUserID = "64dd30f4937431fdad0f6d92";

  let testLoggedInUser: User, validUser: User, token: string, testPost: Post;

  async function createTestUserAndToken({ isAdmin = false } = {}) {
    await UserModel.findByIdAndDelete(mockedUserID).setOptions({ active: false });
    const password = "password";
    testLoggedInUser = (
      await UserModel.create({
        _id: mockedUserID,
        username: "test-user-router",
        fullname: "Test User",
        email: "userRouter@testemail.com",
        password,
        isAdmin,
        passwordConfirm: password,
      })
    ).toObject() as unknown as User;
    token = getLoginTokenStrForTest(testLoggedInUser.id);
  }

  async function deleteTestUser(id?: string) {
    const idToDelete = id || mockedUserID;
    await UserModel.findByIdAndDelete(idToDelete).setOptions({ active: false });
  }

  async function createTestPost() {
    await PostModel.findByIdAndDelete(mockedPostID);
    const validUser = await getValidUser();
    testPost = (
      await PostModel.create({
        _id: mockedPostID,
        text: "User Router Post",
        audience: "everyone",
        repliersType: "everyone",
        isPublic: "true",
        createdById: validUser.id,
      })
    ).toObject() as unknown as Post;
  }

  async function createTestFollowingFromPost() {
    const fromUserId = testLoggedInUser.id;
    const toUserId = validUser.id;
    const session = await mongoose.startSession();
    session.startTransaction();
    await FollowerModel.create([{ fromUserId, toUserId }], { session });
    await PostStatsModel.findOneAndUpdate(
      { postId: testPost.id, userId: fromUserId },
      { isFollowedFromPost: true },
      { session, upsert: true }
    );
    await session.commitTransaction();
  }

  async function getValidUser(): Promise<User> {
    const user = await UserModel.findOne();
    return user?.toObject() as unknown as User;
  }

  beforeAll(async () => {
    // Using a remote DB for testing transactions
    await connectToTestDB({ isRemoteDB: true });
    validUser = await getValidUser();
  });

  afterAll(async () => {
    await deleteTestUser();
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
      const id = new Types.ObjectId().toHexString();
      await UserModel.findByIdAndDelete(id);
      const res = await request(app).get(`/${id}`);
      expect(res.statusCode).toEqual(404);
      expect(res.body.message).toEqual(`No user was found with the id: ${id}`);
    });

    it("should return 500 if an error occurs", async () => {
      const id = new Types.ObjectId().toHexString();

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

  describe("POST /:id/following", () => {
    const id = new Types.ObjectId().toHexString();

    beforeEach(async () => {
      await FollowerModel.deleteMany({});
      await createTestUserAndToken();
    });

    afterEach(async () => {
      await FollowerModel.deleteMany({});
    });

    it("should return 200 and the updated users data when following is added", async () => {
      const res = await request(app).post(`/${validUser.id}/following`).set("Cookie", [token]);

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
      const res = await request(app).post(`/${invalidUserId}/following`).set("Cookie", [token]);
      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toContain("Invalid user id");
    });

    it("should return 404 if the user with the given ID is not found", async () => {
      const id = new Types.ObjectId();
      await UserModel.findByIdAndDelete(id);
      const res = await request(app).post(`/${id}/following`).set("Cookie", [token]);
      expect(res.statusCode).toEqual(404);
      expect(res.body.message).toContain("Following not found");
    });

    it("should return 500 if an error occurs", async () => {
      // (followerService.add as jest.Mock).mockRejectedValueOnce(new Error("Test error"));
      jest.spyOn(followerService, "add").mockRejectedValueOnce(new Error("Test error"));
      const res = await request(app).post(`/${id}/following`).set("Cookie", [token]);
      expect(res.statusCode).toEqual(500);
    });
  });

  describe("DELETE /:id/following", () => {
    beforeAll(async () => {
      await FollowerModel.deleteMany({});
      await createTestUserAndToken();
    });

    afterAll(async () => {
      await FollowerModel.deleteMany({});
    });

    it("should successfully remove a following", async () => {
      await FollowerModel.create([{ fromUserId: testLoggedInUser.id, toUserId: validUser.id }]);
      const spy = jest.spyOn(followerService, "remove");
      const res = await request(app).delete(`/${validUser.id}/following`).set("Cookie", [token]);
      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toEqual("success");
      expect(spy).toHaveBeenCalled();
    });

    it("should return 401 if the user is not logged in", async () => {
      const res = await request(app).delete(`/${validUser.id}/following`);
      expect(res.statusCode).toEqual(401);
      expect(res.body.message).toContain("You are not logged in! Please log in to get access.");
    });

    it("should return 400 if the provided ID is not a valid MongoDB ID", async () => {
      const invalidUserId = "12345";
      const res = await request(app).delete(`/${invalidUserId}/following`).set("Cookie", [token]);
      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toContain("Invalid user id");
    });

    it("should return 404 if the user with the given ID is not found", async () => {
      const id = new Types.ObjectId();
      await UserModel.findByIdAndDelete(id);
      const res = await request(app).delete(`/${id}/following`).set("Cookie", [token]);
      expect(res.statusCode).toEqual(404);
      expect(res.body.message).toContain("You are not following this User");
    });

    it("should return 500 if an internal server error occurs", async () => {
      const id = new Types.ObjectId();

      jest
        .spyOn(followerService, "remove")
        .mockRejectedValueOnce(new Error("Internal server error"));

      const res = await request(app).delete(`/${id}/following`).set("Cookie", [token]);
      expect(res.statusCode).toEqual(500);
      expect(res.body.message).toContain("Internal server error");
    });
  });

  describe("POST /:userId/following/:postId/fromPost", () => {
    beforeAll(async () => {
      await createTestUserAndToken();
    });

    beforeEach(async () => {
      jest.clearAllMocks();
      await FollowerModel.deleteMany({});
    });

    it("should successfully add a following from a post", async () => {
      await createTestPost();

      const res = await request(app)
        .post(`/${validUser.id}/following/${testPost.id}/fromPost`)
        .set("Cookie", [token]);

      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toEqual("success");
    });

    it("should return a post with loggedInUserActionState.isFollowedFromPost after a succesfull request", async () => {
      await createTestPost();
      const res = await request(app)
        .post(`/${validUser.id}/following/${testPost.id}/fromPost`)
        .set("Cookie", [token]);
      const post = res.body.data as Post;
      assertPost(post);
      expect(post.loggedInUserActionState.isFollowedFromPost).toEqual(true);
      const user = post.createdBy as User;
      expect(user.followersCount).toEqual(validUser.followersCount + 1);
    });

    it("should return 400 if the provided userId or postId is not a valid MongoDB ID", async () => {
      const invalidUserId = "12345";
      const postId = new Types.ObjectId().toHexString();
      const res = await request(app)
        .post(`/${invalidUserId}/following/${postId}/fromPost`)
        .set("Cookie", [token]);
      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toContain("Invalid user id: 12345");

      const userId = new Types.ObjectId().toHexString();
      const invalidPostId = "12345";
      const res_2 = await request(app)
        .post(`/${userId}/following/${invalidPostId}/fromPost`)
        .set("Cookie", [token]);
      expect(res_2.statusCode).toEqual(400);
      expect(res_2.body.message).toContain("Invalid post id: 12345");
    });

    it("should return 404 if the post with the given ID is not found", async () => {
      const userId = new Types.ObjectId().toHexString();
      const nonExistentPostId = new Types.ObjectId().toHexString();

      jest.spyOn(followerService, "add").mockRejectedValueOnce(new AppError("Post not found", 404));

      const res = await request(app)
        .post(`/${userId}/following/${nonExistentPostId}/fromPost`)
        .set("Cookie", [token]);
      expect(res.statusCode).toEqual(404);
      expect(res.body.message).toContain("Post not found");
    });

    it("should return 404 if the Follower or Following with the given ID is not found", async () => {
      const followerId = new Types.ObjectId().toHexString();
      const nonExistentPostId = new Types.ObjectId().toHexString();

      jest
        .spyOn(followerService, "add")
        .mockRejectedValueOnce(new AppError("Follower not found", 404));

      const res = await request(app)
        .post(`/${followerId}/following/${nonExistentPostId}/fromPost`)
        .set("Cookie", [token]);
      expect(res.statusCode).toEqual(404);
      expect(res.body.message).toContain("Follower not found");

      jest
        .spyOn(followerService, "add")
        .mockRejectedValueOnce(new AppError("Following not found", 404));

      const res_3 = await request(app)
        .post(`/${followerId}/following/${nonExistentPostId}/fromPost`)
        .set("Cookie", [token]);
      expect(res_3.statusCode).toEqual(404);
      expect(res_3.body.message).toContain("Following not found");
    });

    it("should return 500 if an internal server error occurs", async () => {
      const userId = new Types.ObjectId().toHexString();
      const postId = new Types.ObjectId().toHexString();

      jest
        .spyOn(followerService, "add")
        .mockRejectedValueOnce(new AppError("Internal server error", 500));

      const res = await request(app)
        .post(`/${userId}/following/${postId}/fromPost`)
        .set("Cookie", [token]);

      expect(res.statusCode).toEqual(500);
      expect(res.body.message).toContain("Internal server error");
    });
  });

  describe("DELETE /:userId/following/:postId/fromPost", () => {
    beforeAll(async () => {
      await createTestUserAndToken();
    });

    afterEach(async () => {
      await FollowerModel.deleteMany({});
    });

    it("should successfully remove following from post", async () => {
      await createTestPost();
      await createTestFollowingFromPost();
      const res = await request(app)
        .delete(`/${validUser.id}/following/${testPost.id}/fromPost`)
        .set("Cookie", [token]);

      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toEqual("success");
    });

    it("should return a post with !loggedInUserActionState.isFollowedFromPost after a succesfull request", async () => {
      await createTestPost();
      await createTestFollowingFromPost();
      const res = await request(app)
        .delete(`/${validUser.id}/following/${testPost.id}/fromPost`)
        .set("Cookie", [token]);

      const post = res.body.data as Post;
      assertPost(post);
      expect(post.loggedInUserActionState.isFollowedFromPost).toEqual(false);
      const user = post.createdBy as User;
      expect(user.followersCount).toEqual(validUser.followersCount);
    });

    it("should return 400 if the provided userId or postId is not a valid MongoDB ID", async () => {
      const invalidUserId = "12345";
      const postId = new Types.ObjectId().toHexString();

      const res = await request(app)
        .delete(`/${invalidUserId}/following/${postId}/fromPost`)
        .set("Cookie", [token]);

      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toContain("Invalid user id: 12345");

      const userId = new Types.ObjectId().toHexString();
      const invalidPostId = "12345";

      const res_2 = await request(app)
        .delete(`/${userId}/following/${invalidPostId}/fromPost`)
        .set("Cookie", [token]);

      expect(res_2.statusCode).toEqual(400);
      expect(res_2.body.message).toContain("Invalid post id: 12345");
    });

    it("should handle unexpected errors", async () => {
      jest.spyOn(followerService, "remove").mockRejectedValueOnce(new Error("Unexpected error"));

      const userId = new Types.ObjectId().toHexString();
      const postId = new Types.ObjectId().toHexString();

      const res = await request(app)
        .delete(`/${userId}/following/${postId}/fromPost`)
        .set("Cookie", [token]);

      expect(res.statusCode).toEqual(500);
      expect(res.body.message).toContain("Unexpected error");
    });

    // Add more tests based on other edge cases or scenarios you can think of
  });

  describe("PATCH /loggedInUser", () => {
    beforeAll(async () => {
      await createTestUserAndToken();
    });

    it("should successfully update logged in user", async () => {
      await UserModel.findByIdAndUpdate(testLoggedInUser.id, { bio: "" });
      const updateData = {
        bio: "testing update user bio",
      };

      const res = await request(app).patch(`/loggedInUser`).send(updateData).set("Cookie", [token]);
      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toEqual("success");
      const updatedUser = res.body.data as User;
      expect(updatedUser.id).toEqual(testLoggedInUser.id);
      expect(updatedUser.bio).toEqual(updateData.bio);
    });

    it("should not update unallowed fields", async () => {
      const updateData = {
        isAdmin: true,
      };

      const res = await request(app).patch(`/loggedInUser`).send(updateData).set("Cookie", [token]);
      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toEqual("success");
      const updatedUser = res.body.data as User;
      expect(updatedUser.id).toEqual(testLoggedInUser.id);
      expect(updatedUser.isAdmin).toEqual(false);
    });

    it("should return 400 for invalid update data", async () => {
      const invalidUpdateData = {};

      const res = await request(app)
        .patch(`/loggedInUser`)
        .send(invalidUpdateData)
        .set("Cookie", [token]);

      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toContain(
        "No data received in the request. Please provide some properties to update."
      );
    });

    it("should handle unexpected errors", async () => {
      jest.spyOn(userService, "update").mockRejectedValueOnce(new Error("Unexpected error"));

      const updateData = {
        bio: "testing update user bio",
      };

      const res = await request(app).patch(`/loggedInUser`).send(updateData).set("Cookie", [token]);
      expect(res.statusCode).toEqual(500);
      expect(res.body.message).toContain("Unexpected error");
    });

    it("should return 401 if the user is not logged in", async () => {
      const updateData = {
        username: "newUsername",
        email: "newEmail@example.com",
      };

      const res = await request(app).patch(`/loggedInUser`).send(updateData);
      expect(res.statusCode).toEqual(401);
      expect(res.body.message).toContain("You are not logged in! Please log in to get access.");
    });
  });

  describe("DELETE /loggedInUser", () => {
    async function setUserToActive() {
      await UserModel.findByIdAndUpdate(testLoggedInUser.id, { active: true }).setOptions({
        active: false,
        skipHooks: true,
      });
    }

    beforeAll(async () => {
      await createTestUserAndToken();
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it("should successfully deactivate the logged in user's account", async () => {
      await setUserToActive();
      const res = await request(app).delete(`/loggedInUser`).set("Cookie", [token]);
      expect(res.statusCode).toEqual(204);
      const deactivatedUser = await UserModel.findOne({
        _id: testLoggedInUser.id,
        active: false,
      }).setOptions({
        active: false,
        skipHooks: true,
      });

      expect(deactivatedUser?.id).toEqual(testLoggedInUser.id);
      await setUserToActive();
    });

    it("should return an error if user is not logged in", async () => {
      const res = await request(app).delete(`/loggedInUser`);
      expect(res.statusCode).toEqual(401);
      expect(res.body.message).toEqual("You are not logged in! Please log in to get access.");
    });

    it("should return an error if there's an issue deleting the user", async () => {
      jest.spyOn(userService, "removeAccount").mockRejectedValueOnce(new Error("Deletion error"));

      const res = await request(app).delete(`/loggedInUser`).set("Cookie", [token]);
      expect(res.statusCode).toEqual(500);
      expect(res.body.message).toEqual("Deletion error");
    });
  });

  describe("POST /", () => {
    const requiredUserProps = ["username", "fullname", "email", "password", "passwordConfirm"];

    const id = new Types.ObjectId().toHexString();
    const newUser = {
      _id: id,
      username: "testUser",
      fullname: "Test User",
      email: "test@example.com",
      password: "password",
      passwordConfirm: "password",
    };

    beforeAll(async () => {
      await createTestUserAndToken({ isAdmin: true });
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it("should successfully add a new user", async () => {
      await deleteTestUser(id);
      const res = await request(app).post(`/`).send(newUser).set("Cookie", [token]);

      expect(res.statusCode).toEqual(201); // 201 Created
      expect(res.body.status).toEqual("success");
      const user = res.body.data;

      assertUser(user);
      expect(user.username).toEqual(newUser.username);
      expect(user.fullname).toEqual(newUser.fullname);
      expect(user.email).toEqual(newUser.email);

      await deleteTestUser(id);
    });

    it.each(requiredUserProps)("should return 400 if %s is not provided", async (prop: string) => {
      const invalidUser = { ...newUser };
      delete invalidUser[prop as keyof typeof invalidUser];
      const res = await request(app).post(`/`).send(invalidUser).set("Cookie", [token]);
      expect(res.statusCode).toEqual(500);
      expect(res.body.message).toContain(`User validation failed:`);
    });

    it("should return an error if there's an unexpected issue during user creation", async () => {
      const newUser = {
        username: "testUser",
        email: "test@example.com",
      };

      jest.spyOn(UserModel, "create").mockRejectedValueOnce(new Error("Database error"));

      const res = await request(app).post(`/`).send(newUser).set("Cookie", [token]);
      expect(res.statusCode).toEqual(500); // Internal Server Error
      expect(res.body.message).toEqual("Database error");
    });
  });

  // TODO: Fix this test
  fdescribe("User Router - PATCH /:id", () => {
    beforeAll(async () => {
      await createTestUserAndToken({ isAdmin: true });
    });

    const updateData = {
      username: "updatedUsername",
      email: "updatedEmail@example.com",
    };

    afterEach(() => {
      jest.clearAllMocks();
    });

    it("should successfully update a user by id", async () => {
      const userId = new Types.ObjectId().toHexString();

      const res = await request(app).patch(`/${userId}`).send(updateData).set("Cookie", [token]);
      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toEqual("success");
      expect(res.body.data.username).toEqual(updateData.username);
      expect(res.body.data.email).toEqual(updateData.email);
    });

    it("should return 400 if provided id is not a valid MongoDB ObjectId", async () => {
      const invalidUserId = "invalidId";
      const res = await request(app).patch(`/${invalidUserId}`).send(updateData);
      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toContain("Invalid user id: invalidId");
    });

    it("should return 404 if user with provided id is not found", async () => {
      const nonExistentUserId = new Types.ObjectId().toHexString();
      (UserModel.findByIdAndUpdate as jest.Mock).mockResolvedValue(null);
      const res = await request(app).patch(`/${nonExistentUserId}`).send(updateData);
      expect(res.statusCode).toEqual(404);
      expect(res.body.message).toContain(`No user was found with the id: ${nonExistentUserId}`);
    });

    it("should return 500 if an internal server error occurs", async () => {
      const userId = new Types.ObjectId().toHexString();
      (UserModel.findByIdAndUpdate as jest.Mock).mockImplementation(() => {
        throw new Error("Internal server error");
      });

      const res = await request(app).patch(`/${userId}`).send(updateData);
      expect(res.statusCode).toEqual(500);
      expect(res.body.message).toContain("Internal server error");
    });
  });

  xdescribe("DELETE /:id", () => {
    const mockId = new Types.ObjectId().toHexString();
    afterEach(() => {
      jest.clearAllMocks();
    });

    it("should successfully delete a user by ID", async () => {
      (UserModel.findByIdAndDelete as jest.Mock).mockResolvedValue(mockId);

      const res = await request(app).delete(`/${mockId}`);
      expect(res.statusCode).toEqual(204);
    });

    it("should return 404 if user is not found", async () => {
      (UserModel.findByIdAndDelete as jest.Mock).mockResolvedValue(null);

      const res = await request(app).delete(`/${mockId}`);
      expect(res.statusCode).toEqual(404);
      expect(res.body.message).toEqual(`No user was found with the id: ${mockId}`);
    });

    it("should return 400 for invalid MongoDB ID", async () => {
      const invalidId = "invalidId";
      const res = await request(app).delete(`/${invalidId}`);
      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toEqual(`Invalid user id: ${invalidId}`);
    });

    it("should handle unexpected errors", async () => {
      (UserModel.findByIdAndDelete as jest.Mock).mockImplementation(() => {
        throw new Error("Unexpected error");
      });

      const res = await request(app).delete(`/${mockId}`);
      expect(res.statusCode).toEqual(500);
    });
  });
});
