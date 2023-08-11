/* eslint-disable @typescript-eslint/no-explicit-any */
import request from "supertest";
import express from "express";
import router from "./user.router";
import { AppError, errorHandler } from "../../../services/error/error.service";
import userService from "../services/user/user.service";
import { Types } from "mongoose";
import followerService from "../services/follower/follower.service";
import { UserModel } from "../models/user.model";
import { logger } from "../../../services/logger/logger.service";
import { checkUserAuthentication } from "../../../middlewares/authGuards/authGuards.middleware";

jest.mock("../../../middlewares/authGuards/authGuards.middleware", () => ({
  checkUserAuthentication: jest.fn().mockImplementation((req, res, next) => {
    req.loggedInUserId = new Types.ObjectId().toHexString();
    next();
  }),
  checkAdminAuthorization: jest.fn().mockImplementation((req, res, next) => {
    next();
  }),
}));

jest.mock("../services/user/user.service", () => ({
  query: jest.fn(),
  getById: jest.fn(),
  getByUsername: jest.fn(),
  add: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  removeAccount: jest.fn(),
}));

jest.mock("../services/follower/follower.service", () => ({
  add: jest.fn(),
  remove: jest.fn(),
}));

jest.mock("../models/user.model", () => ({
  UserModel: {
    collection: {
      collectionName: "users",
    },
    findById: jest.fn().mockImplementation(() => ({
      populate: jest.fn(),
      exec: jest.fn(),
    })),
    create: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
  },
}));

jest.mock("../../../services/logger/logger.service", () => ({
  logger: {
    warn: jest.fn(),
  },
}));

const app = express();
app.use(express.json());
app.use(router);
app.use(errorHandler);

describe("User Router", () => {
  describe("GET /", () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it("should return 200 and an array of users if users match the query", async () => {
      const users = [{ id: "1", username: "test" }];
      (userService.query as jest.Mock).mockImplementation(() => Promise.resolve(users));
      const res = await request(app).get("/");
      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toEqual(users);
    });

    it("should return 200 and an empty array if no users match the query", async () => {
      (userService.query as jest.Mock).mockImplementation(() => Promise.resolve([]));
      const res = await request(app).get("/");
      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toEqual([]);
    });

    it("should return 500 if an error occurs", async () => {
      (userService.query as jest.Mock).mockImplementation(() => Promise.reject(new Error()));
      const res = await request(app).get("/");
      expect(res.statusCode).toEqual(500);
    });

    it("should return specific error message on failure", async () => {
      (userService.query as jest.Mock).mockImplementation(() =>
        Promise.reject(new Error("Database error"))
      );
      const res = await request(app).get("/");
      expect(res.statusCode).toEqual(500);
      expect(res.body.message).toEqual("Database error");
    });
  });

  describe("GET /:id", () => {
    const id = new Types.ObjectId().toHexString();
    function _setupUserModeMockForGetOneFactory(value: any) {
      (UserModel.findById as jest.Mock).mockImplementation(() => ({
        populate: jest.fn(),
        exec: jest.fn().mockResolvedValueOnce(value),
      }));
    }

    afterEach(() => {
      jest.clearAllMocks();
    });

    it("should return 200 and a user if a user with the given ID exists", async () => {
      const user = { id, username: "test" };
      _setupUserModeMockForGetOneFactory(user);
      const res = await request(app).get(`/${id}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toEqual(user);
    });

    it("should return 404 if no user with the given ID exists", async () => {
      //   (userService.getById as jest.Mock).mockImplementation(() => Promise.resolve(null));
      _setupUserModeMockForGetOneFactory(null);
      const res = await request(app).get(`/${id}`);
      expect(res.statusCode).toEqual(404);
      expect(res.body.message).toEqual(`No user was found with the id: ${id}`);
    });

    it("should return 500 if an error occurs", async () => {
      (UserModel.findById as jest.Mock).mockImplementation(() => ({
        populate: jest.fn(),
        exec: jest.fn().mockImplementation(() => Promise.reject(new Error("Database error"))),
      }));
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
    afterEach(() => {
      jest.clearAllMocks();
    });

    it("should return 200 and the user data if the user is found", async () => {
      const mockUser = { id: "1", username: "testuser" };
      (userService.getByUsername as jest.Mock).mockResolvedValue(mockUser);

      const res = await request(app).get("/username/testuser");
      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toEqual(mockUser);
    });

    it("should return 404 if the user is not found", async () => {
      const username = "nonexistentuser";
      (userService.getByUsername as jest.Mock).mockRejectedValue(
        new AppError(`User with username ${username} not found`, 404)
      );

      const res = await request(app).get(`/username/${username}`);
      expect(res.statusCode).toEqual(404);
      expect(res.body.message).toEqual(`User with username ${username} not found`);
    });

    it("should return 500 if an error occurs", async () => {
      (userService.getByUsername as jest.Mock).mockRejectedValue(new Error("Test error"));

      const res = await request(app).get("/username/testuser");
      expect(res.statusCode).toEqual(500);
      expect(res.body.message).toEqual("Test error");
    });
  });

  describe("POST /:id/following", () => {
    const id = new Types.ObjectId().toHexString();

    afterEach(() => {
      jest.clearAllMocks();
    });

    it("should return 200 and the updated user data when following is added", async () => {
      const mockUser = { id, username: "testuser", following: ["2"] };
      (followerService.add as jest.Mock).mockResolvedValue(mockUser);

      const res = await request(app).post(`/${id}/following`);
      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toEqual(mockUser);
    });

    it("should return 404 if the user ID to follow is not provided", async () => {
      const res = await request(app).post("/following").send({});
      expect(res.statusCode).toEqual(404);
    });

    it("should return 400 if the provided ID is not a valid MongoDB ID", async () => {
      const invalidUserId = "12345";
      const res = await request(app).post(`/${invalidUserId}/following`);
      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toContain("Invalid user id");
    });

    it("should return 500 if an error occurs", async () => {
      (followerService.add as jest.Mock).mockRejectedValue(new Error("Test error"));
      const res = await request(app).post(`/${id}/following`);
      expect(res.statusCode).toEqual(500);
    });
  });

  describe("DELETE /:id/following", () => {
    const id = new Types.ObjectId();
    afterEach(() => {
      jest.clearAllMocks();
    });

    it("should successfully remove a following", async () => {
      (followerService.remove as jest.Mock).mockImplementation(() => Promise.resolve({}));
      const res = await request(app).delete(`/${id}/following`);
      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toEqual("success");
    });

    it("should return 400 if the provided ID is not a valid MongoDB ID", async () => {
      const invalidUserId = "12345";
      const res = await request(app).delete(`/${invalidUserId}/following`);
      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toContain("Invalid user id");
    });

    it("should return 404 if the user with the given ID is not found", async () => {
      (followerService.remove as jest.Mock).mockImplementation(() => {
        throw new AppError("User not found", 404);
      });

      const res = await request(app).delete(`/${id}/following`);
      expect(res.statusCode).toEqual(404);
      expect(res.body.message).toContain("User not found");
    });

    it("should return 500 if an internal server error occurs", async () => {
      (followerService.remove as jest.Mock).mockImplementation(() => {
        throw new Error("Internal server error");
      });

      const res = await request(app).delete(`/${id}/following`);
      expect(res.statusCode).toEqual(500);
      expect(res.body.message).toContain("Internal server error");
    });
  });

  describe("POST /:userId/following/:postId/fromPost", () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it("should successfully add a following from a post", async () => {
      const userId = new Types.ObjectId().toHexString();
      const postId = new Types.ObjectId().toHexString();
      (followerService.add as jest.Mock).mockImplementation(() => Promise.resolve({}));

      const res = await request(app).post(`/${userId}/following/${postId}/fromPost`);
      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toEqual("success");
    });

    it("should return 400 if the provided userId or postId is not a valid MongoDB ID", async () => {
      const invalidUserId = "12345";
      const postId = new Types.ObjectId().toHexString();
      const res = await request(app).post(`/${invalidUserId}/following/${postId}/fromPost`);
      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toContain("Invalid user id: 12345");

      const userId = new Types.ObjectId().toHexString();
      const invalidPostId = "12345";
      const res_2 = await request(app).post(`/${userId}/following/${invalidPostId}/fromPost`);
      expect(res_2.statusCode).toEqual(400);
      expect(res_2.body.message).toContain("Invalid post id: 12345");
    });

    it("should return 404 if the post with the given ID is not found", async () => {
      const userId = new Types.ObjectId().toHexString();
      const nonExistentPostId = new Types.ObjectId().toHexString();
      (followerService.add as jest.Mock).mockImplementationOnce(() => {
        throw new AppError("Post not found", 404);
      });

      const res = await request(app).post(`/${userId}/following/${nonExistentPostId}/fromPost`);
      expect(res.statusCode).toEqual(404);
      expect(res.body.message).toContain("Post not found");
    });

    it("should return 404 if the Follower or Following with the given ID is not found", async () => {
      const followerId = new Types.ObjectId().toHexString();
      const nonExistentPostId = new Types.ObjectId().toHexString();

      (followerService.add as jest.Mock).mockImplementationOnce(() => {
        throw new AppError("Follower not found", 404);
      });

      const res = await request(app).post(`/${followerId}/following/${nonExistentPostId}/fromPost`);
      expect(res.statusCode).toEqual(404);
      expect(res.body.message).toContain("Follower not found");

      (followerService.add as jest.Mock).mockImplementationOnce(() => {
        throw new AppError("Following not found", 404);
      });
      const res_3 = await request(app).post(
        `/${followerId}/following/${nonExistentPostId}/fromPost`
      );
      expect(res_3.statusCode).toEqual(404);
      expect(res_3.body.message).toContain("Following not found");
    });

    it("should return 500 if an internal server error occurs", async () => {
      const userId = new Types.ObjectId().toHexString();
      const postId = new Types.ObjectId().toHexString();
      (followerService.add as jest.Mock).mockImplementation(() => {
        throw new Error("Internal server error");
      });

      const res = await request(app).post(`/${userId}/following/${postId}/fromPost`);
      expect(res.statusCode).toEqual(500);
      expect(res.body.message).toContain("Internal server error");
    });
  });

  describe("DELETE /:userId/following/:postId/fromPost", () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it("should successfully remove following from post", async () => {
      const userId = new Types.ObjectId().toHexString();
      const postId = new Types.ObjectId().toHexString();
      const mockPost = { _id: postId };
      (followerService.remove as jest.Mock).mockImplementation(() => Promise.resolve(mockPost));
      const res = await request(app).delete(`/${userId}/following/${postId}/fromPost`);
      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toEqual("success");
      expect(res.body.data).toEqual(mockPost);
    });

    it("should return 400 if the provided userId or postId is not a valid MongoDB ID", async () => {
      const invalidUserId = "12345";
      const postId = new Types.ObjectId().toHexString();
      const res = await request(app).delete(`/${invalidUserId}/following/${postId}/fromPost`);
      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toContain("Invalid user id: 12345");

      const userId = new Types.ObjectId().toHexString();
      const invalidPostId = "12345";
      const res_2 = await request(app).delete(`/${userId}/following/${invalidPostId}/fromPost`);
      expect(res_2.statusCode).toEqual(400);
      expect(res_2.body.message).toContain("Invalid post id: 12345");
    });

    it("should handle unexpected errors", async () => {
      (followerService.remove as jest.Mock).mockImplementation(() => {
        throw new Error("Unexpected error");
      });

      const userId = new Types.ObjectId().toHexString();
      const postId = new Types.ObjectId().toHexString();

      const res = await request(app).delete(`/${userId}/following/${postId}/fromPost`);
      expect(res.statusCode).toEqual(500);
      expect(res.body.message).toContain("Unexpected error");
    });

    // Add more tests based on other edge cases or scenarios you can think of
  });

  describe("PATCH /loggedInUser", () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it("should successfully update logged in user", async () => {
      const updateData = {
        username: "newUsername",
        email: "newEmail@example.com",
      };

      (userService.update as jest.Mock).mockImplementation(() => Promise.resolve(updateData));

      const res = await request(app).patch(`/loggedInUser`).send(updateData);
      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toEqual("success");
      expect(res.body.data.username).toEqual(updateData.username);
      expect(res.body.data.email).toEqual(updateData.email);
    });

    it("should return 400 for invalid update data", async () => {
      const invalidUpdateData = {};

      const res = await request(app).patch(`/loggedInUser`).send(invalidUpdateData);
      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toContain(
        "No data received in the request. Please provide some properties to update."
      );
    });

    it("should handle unexpected errors", async () => {
      (userService.update as jest.Mock).mockImplementation(() => {
        throw new Error("Unexpected error");
      });

      const updateData = {
        username: "newUsername",
        email: "newEmail@example.com",
      };

      const res = await request(app).patch(`/loggedInUser`).send(updateData);
      expect(res.statusCode).toEqual(500);
      expect(res.body.message).toContain("Unexpected error");
    });

    it("should return 401 if the user is not logged in", async () => {
      (checkUserAuthentication as jest.Mock).mockImplementationOnce((req, res, next) => {
        req.loggedInUserId = undefined;
        next();
      });

      const updateData = {
        username: "newUsername",
        email: "newEmail@example.com",
      };

      (userService.update as jest.Mock).mockImplementation(() => {
        throw new AppError("User not logged in", 401);
      });

      const res = await request(app).patch(`/loggedInUser`).send(updateData);
      expect(res.statusCode).toEqual(401);
      expect(res.body.message).toContain("User not logged in");
    });
  });

  describe("DELETE /loggedInUser", () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it("should successfully delete the logged in user's account", async () => {
      const user = { username: "testUser" };
      (userService.removeAccount as jest.Mock).mockResolvedValue(user);
      const res = await request(app).delete(`/loggedInUser`);
      expect(res.statusCode).toEqual(204);
      expect(logger.warn).toHaveBeenCalledWith("User testUser was deactivated");
    });

    it("should return an error if user is not logged in", async () => {
      (checkUserAuthentication as jest.Mock).mockImplementationOnce((req, res, next) => {
        req.loggedInUserId = undefined;
        next();
      });

      const res = await request(app).delete(`/loggedInUser`);
      expect(res.statusCode).toEqual(401);
      expect(res.body.message).toEqual("User not logged in");
    });

    it("should return an error if there's an issue deleting the user", async () => {
      (userService.removeAccount as jest.Mock).mockImplementation(() => {
        throw new Error("Deletion error");
      });

      const res = await request(app).delete(`/loggedInUser`);
      expect(res.statusCode).toEqual(500);
      expect(res.body.message).toEqual("Deletion error");
    });
  });

  describe("POST /", () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it("should successfully add a new user", async () => {
      const newUser = {
        username: "testUser",
        email: "test@example.com",
      };

      (UserModel.create as jest.Mock).mockResolvedValue(newUser);

      const res = await request(app).post(`/`).send(newUser);
      expect(res.statusCode).toEqual(201); // 201 Created
      expect(res.body.status).toEqual("success");
      expect(res.body.data.username).toEqual(newUser.username);
      expect(res.body.data.email).toEqual(newUser.email);
    });

    it("should return an error if there's an unexpected issue during user creation", async () => {
      const newUser = {
        username: "testUser",
        email: "test@example.com",
      };

      (UserModel.create as jest.Mock).mockImplementationOnce(() => {
        throw new Error("Database error");
      });

      const res = await request(app).post(`/`).send(newUser);
      expect(res.statusCode).toEqual(500); // Internal Server Error
      expect(res.body.message).toEqual("Database error");
    });
  });

  describe("User Router - PATCH /:id", () => {
    const updateData = {
      username: "updatedUsername",
      email: "updatedEmail@example.com",
    };

    afterEach(() => {
      jest.clearAllMocks();
    });

    it("should successfully update a user by id", async () => {
      const userId = new Types.ObjectId().toHexString();

      (UserModel.findByIdAndUpdate as jest.Mock).mockResolvedValue(updateData);

      const res = await request(app).patch(`/${userId}`).send(updateData);
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

  describe("DELETE /:id", () => {
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
