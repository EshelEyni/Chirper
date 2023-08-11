import { NextFunction, Request, Response } from "express";
import { AppError, asyncErrorCatcher } from "../../../services/error/error.service";
import userService from "../services/user/user.service";
import { User } from "../../../../../shared/interfaces/user.interface";
import {
  addFollowings,
  addFollowingsFromPost,
  getUserByUsername,
  getUsers,
  removeFollowings,
  removeFollowingsFromPost,
  removeLoggedInUser,
  updateLoggedInUser,
} from "./user.controller";
import { logger } from "../../../services/logger/logger.service";
import followerService from "../services/follower/follower.service";
import { Types } from "mongoose";

jest.mock("../services/user/user.service");
jest.mock("../services/follower/follower.service");
jest.mock("../../../services/logger/logger.service", () => ({
  logger: {
    warn: jest.fn(),
  },
}));

const nextMock = jest.fn() as jest.MockedFunction<NextFunction>;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
(asyncErrorCatcher as jest.Mock) = jest.fn().mockImplementation(fn => {
  return async (...args: unknown[]) => {
    try {
      return await fn(...args);
    } catch (error) {
      return nextMock(error);
    }
  };
});

describe("User Controller", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;

  function getMockedUser(id: number) {
    return {
      _id: id.toString(),
      username: "test1",
      email: "email@email.com",
      fullname: "fullname1",
      imgUrl: "imgUrl1",
      isApprovedLocation: true,
      active: true,
    };
  }

  describe("getUsers", () => {
    beforeEach(() => {
      req = { query: {} };
      res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it("should return a list of users", async () => {
      // Arrange
      const mockUsers = Array(3)
        .fill(null)
        .map((_, i) => getMockedUser(i + 1));

      jest.spyOn(userService, "query").mockResolvedValue(mockUsers as unknown as User[]);
      req.query = { limit: "10", page: "1" };

      // Act
      const sut = getUsers as any;
      await sut(req as Request, res as Response, nextMock);

      // Assert
      expect(res.send).toHaveBeenCalledWith({
        status: "success",
        requestedAt: expect.any(String),
        results: mockUsers.length,
        data: mockUsers,
      });
    });

    it("should handle errors and pass them to next", async () => {
      const mockError = new Error("Test error");
      jest.spyOn(userService, "query").mockImplementationOnce(() => {
        throw mockError;
      });
      const sut = getUsers as any;
      await sut(req as Request, res as Response, nextMock);
      expect(nextMock).toHaveBeenCalledWith(mockError);
      expect(res.send).not.toHaveBeenCalled();
    });

    it("should pass query parameters to userService", async () => {
      req.query = { name: "John", age: "25" };
      const sut = getUsers as any;
      await sut(req as Request, res as Response, nextMock);
      expect(userService.query).toHaveBeenCalledWith(req.query);
    });

    it("should handle empty result set", async () => {
      jest.spyOn(userService, "query").mockResolvedValue([]);
      const sut = getUsers as any;
      await sut(req as Request, res as Response, nextMock);
      expect(res.send).toHaveBeenCalledWith({
        status: "success",
        requestedAt: expect.any(String),
        results: 0,
        data: [],
      });
    });
  });

  describe("getUserByUsername", () => {
    beforeEach(() => {
      req = { params: {} };
      res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it("should throw an error if no username is provided", async () => {
      const sut = getUserByUsername as any;
      await sut(req as Request, res as Response, nextMock);

      expect(nextMock).toHaveBeenCalledWith(new AppError("No user username provided", 400));
      expect(nextMock).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "No user username provided",
          statusCode: 400,
        })
      );
    });

    it("should throw an error if user is not found", async () => {
      const username = "testuser";
      req = { params: { username } };
      (userService.getByUsername as jest.Mock).mockImplementationOnce(() => {
        throw new AppError(`User with username ${username} not found`, 404);
      });
      const sut = getUserByUsername as any;
      await sut(req as Request, res as Response, nextMock);
      expect(nextMock).toHaveBeenCalled();
      expect(nextMock).toHaveBeenCalledWith(
        new AppError("User with username testuser not found", 404)
      );
      expect(nextMock).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "User with username testuser not found",
          statusCode: 404,
        })
      );
    });

    it("should return user data if user is found", async () => {
      const mockUser = { id: "1", username: "testuser" };
      req = { params: { username: "testuser" } };
      (userService.getByUsername as jest.Mock).mockResolvedValue(mockUser);

      const sut = getUserByUsername as any;
      await sut(req as Request, res as Response, nextMock);

      expect(res.send).toHaveBeenCalledWith({
        status: "success",
        requestedAt: expect.any(String),
        data: mockUser,
      });
    });
  });

  describe("updateLoggedInUser", () => {
    beforeEach(() => {
      req = {
        body: {},
        loggedInUserId: "12345",
      };
      res = {
        send: jest.fn(),
        status: jest.fn().mockReturnThis(),
      };
      nextMock.mockClear();
    });

    it("should throw an error if no data is provided in the request body", async () => {
      const sut = updateLoggedInUser as any;
      await sut(req as Request, res as Response, nextMock);
      expect(nextMock).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "No data received in the request. Please provide some properties to update.",
          statusCode: 400,
        })
      );
    });

    it("should throw an error if user is not logged in", async () => {
      req.loggedInUserId = undefined;
      req.body = { name: "Updated Name" };
      const sut = updateLoggedInUser as any;
      await sut(req as Request, res as Response, nextMock);
      expect(nextMock).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "User not logged in",
          statusCode: 401,
        })
      );
    });

    it("should update the user and return the updated data", async () => {
      const mockUpdatedUser = { id: "12345", name: "Updated Name" };
      (userService.update as jest.Mock).mockResolvedValue(mockUpdatedUser);
      req.body = { name: "Updated Name" };
      const sut = updateLoggedInUser as any;
      await sut(req as Request, res as Response, nextMock);
      expect(userService.update).toHaveBeenCalledWith("12345", { name: "Updated Name" });
      expect(res.send).toHaveBeenCalledWith({
        status: "success",
        data: mockUpdatedUser,
      });
    });

    it("should pass errors from the userService to the next middleware", async () => {
      (userService.update as jest.Mock).mockImplementationOnce(() => {
        throw new Error("Test error");
      });
      req.body = { name: "Updated Name" };
      const sut = updateLoggedInUser as any;
      await sut(req as Request, res as Response, nextMock);
      expect(nextMock).toHaveBeenCalledWith(new Error("Test error"));
    });
  });

  describe("removeLoggedInUser", () => {
    beforeEach(() => {
      req = {
        loggedInUserId: "12345",
      };
      res = {
        send: jest.fn(),
        status: jest.fn().mockReturnThis(),
      };
      nextMock.mockClear();
      jest.clearAllMocks();
    });

    it("should throw an error if user is not logged in", async () => {
      req.loggedInUserId = undefined;
      const sut = removeLoggedInUser as any;
      await sut(req as Request, res as Response, nextMock);
      expect(nextMock).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "User not logged in",
          statusCode: 401,
        })
      );
    });

    it("should throw an error if user is not found", async () => {
      (userService.removeAccount as jest.Mock).mockImplementationOnce(() => {
        throw new AppError("User not found", 404);
      });
      const sut = removeLoggedInUser as any;
      await sut(req as Request, res as Response, nextMock);
      expect(nextMock).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "User not found",
          statusCode: 404,
        })
      );
    });

    it("should remove the user and return a 204 status", async () => {
      const mockRemovedUser = { id: "12345", username: "TestUser" };
      (userService.removeAccount as jest.Mock).mockResolvedValue(mockRemovedUser);
      const sut = removeLoggedInUser as any;
      await sut(req as Request, res as Response, nextMock);
      expect(userService.removeAccount).toHaveBeenCalledWith("12345");
      expect(logger.warn).toHaveBeenCalledWith("User TestUser was deactivated");
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalledWith({
        status: "success",
        data: null,
      });
    });

    it("should pass errors from the userService to the next middleware", async () => {
      (userService.removeAccount as jest.Mock).mockImplementationOnce(() => {
        throw new Error("Test error");
      });
      const sut = removeLoggedInUser as any;
      await sut(req as Request, res as Response, nextMock);
      expect(nextMock).toHaveBeenCalledWith(new Error("Test error"));
    });
  });

  describe("addFollowings", () => {
    beforeEach(() => {
      req = {
        loggedInUserId: new Types.ObjectId().toHexString(),
        params: {
          id: new Types.ObjectId().toHexString(),
        },
      };
      res = {
        send: jest.fn(),
      };
      nextMock.mockClear();
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it("should throw an error if no logged in user id is provided", async () => {
      req.loggedInUserId = undefined;
      const sut = addFollowings as any;
      await sut(req as Request, res as Response, nextMock);
      expect(nextMock).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "No loggedInUser id provided",
          statusCode: 400,
        })
      );
    });

    it("should throw an error if no user id is provided", async () => {
      req.params = {};
      const sut = addFollowings as any;
      await sut(req as Request, res as Response, nextMock);
      expect(nextMock).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "No user id provided",
          statusCode: 400,
        })
      );
    });

    it("should throw an error if user id is not a valid MongoDB id", async () => {
      req.params!.id = "123";
      const sut = addFollowings as any;
      await sut(req as Request, res as Response, nextMock);
      expect(nextMock).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Invalid user id: 123",
          statusCode: 400,
        })
      );
    });

    it("should throw an error if user is not found", async () => {
      (followerService.add as jest.Mock).mockImplementationOnce(() => {
        throw new AppError("User not found", 404);
      });
      const sut = addFollowings as any;
      await sut(req as Request, res as Response, nextMock);
      expect(nextMock).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "User not found",
          statusCode: 404,
        })
      );
    });

    it("should add followings and return updated user data", async () => {
      const mockUpdatedUser = { id: "12345", username: "TestUser" };
      (followerService.add as jest.Mock).mockResolvedValue(mockUpdatedUser);
      const sut = addFollowings as any;
      await sut(req as Request, res as Response, nextMock);
      expect(res.send).toHaveBeenCalledWith({
        status: "success",
        data: mockUpdatedUser,
      });
    });

    it("should pass errors from the followerService to the next middleware", async () => {
      (followerService.add as jest.Mock).mockImplementationOnce(() => {
        throw new Error("Test error");
      });
      const sut = addFollowings as any;
      await sut(req as Request, res as Response, nextMock);
      expect(nextMock).toHaveBeenCalledWith(new Error("Test error"));
    });
  });

  describe("removeFollowings", () => {
    beforeEach(() => {
      req = {
        loggedInUserId: new Types.ObjectId().toHexString(),
        params: {
          id: new Types.ObjectId().toHexString(),
        },
      };
      res = {
        send: jest.fn(),
      };
      nextMock.mockClear();
      jest.clearAllMocks();
    });

    it("should throw an error if no logged in user id is provided", async () => {
      req.loggedInUserId = undefined;
      const sut = removeFollowings as any;
      await sut(req as Request, res as Response, nextMock);
      expect(nextMock).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "No loggedInUser id provided",
          statusCode: 400,
        })
      );
    });

    it("should throw an error if no user id is provided", async () => {
      req.params = {};
      const sut = removeFollowings as any;
      await sut(req as Request, res as Response, nextMock);
      expect(nextMock).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "No user id provided",
          statusCode: 400,
        })
      );
    });

    it("should throw an error if user is not found", async () => {
      (followerService.remove as jest.Mock).mockImplementationOnce(() => {
        throw new AppError("User not found", 404);
      });
      const sut = removeFollowings as any;
      await sut(req as Request, res as Response, nextMock);
      expect(nextMock).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "User not found",
          statusCode: 404,
        })
      );
    });

    it("should throw an error if user id is not a valid MongoDB id", async () => {
      req.params!.id = "123";
      const sut = removeFollowings as any;
      await sut(req as Request, res as Response, nextMock);
      expect(nextMock).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Invalid user id: 123",
          statusCode: 400,
        })
      );
    });

    it("should remove followings and return updated user data", async () => {
      const mockUpdatedUser = { id: "12345", username: "TestUser" };
      (followerService.remove as jest.Mock).mockResolvedValue(mockUpdatedUser);
      const sut = removeFollowings as any;
      await sut(req as Request, res as Response, nextMock);
      expect(res.send).toHaveBeenCalledWith({
        status: "success",
        data: mockUpdatedUser,
      });
    });

    it("should pass errors from the followerService to the next middleware", async () => {
      (followerService.remove as jest.Mock).mockImplementationOnce(() => {
        throw new Error("Test error");
      });
      const sut = removeFollowings as any;
      await sut(req as Request, res as Response, nextMock);
      expect(nextMock).toHaveBeenCalledWith(new Error("Test error"));
    });
  });

  describe("addFollowingsFromPost", () => {
    beforeEach(() => {
      req = {
        loggedInUserId: new Types.ObjectId().toHexString(),
        params: {
          postId: new Types.ObjectId().toHexString(),
          userId: new Types.ObjectId().toHexString(),
        },
      };
      res = {
        send: jest.fn(),
      };
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it("should throw an error if no logged in user id is provided", async () => {
      req.loggedInUserId = undefined;
      const sut = addFollowingsFromPost as any;
      await sut(req as Request, res as Response, nextMock);
      expect(nextMock).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "No loggedInUser id provided",
          statusCode: 400,
        })
      );
    });

    it("should throw an error if no user id is provided", async () => {
      delete req.params!.userId;
      const sut = addFollowingsFromPost as any;
      await sut(req as Request, res as Response, nextMock);
      expect(nextMock).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "No user id provided",
          statusCode: 400,
        })
      );
    });

    it("should throw an error if user id is not a valid MongoDB id", async () => {
      req.params!.userId = "123";
      const sut = addFollowingsFromPost as any;
      await sut(req as Request, res as Response, nextMock);
      expect(nextMock).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Invalid user id: 123",
          statusCode: 400,
        })
      );
    });

    it("should throw an error if no post id is provided", async () => {
      delete req.params!.postId;
      const sut = addFollowingsFromPost as any;
      await sut(req as Request, res as Response, nextMock);
      expect(nextMock).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "No post id provided",
          statusCode: 400,
        })
      );
    });

    it("should throw an error if post id is not a valid MongoDB id", async () => {
      req.params!.postId = "123";
      const sut = addFollowingsFromPost as any;
      await sut(req as Request, res as Response, nextMock);
      expect(nextMock).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Invalid post id: 123",
          statusCode: 400,
        })
      );
    });

    it("should throw an error if user is not found", async () => {
      (followerService.add as jest.Mock).mockImplementationOnce(() => {
        throw new AppError("User not found", 404);
      });
      const sut = addFollowingsFromPost as any;
      await sut(req as Request, res as Response, nextMock);
      expect(nextMock).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "User not found",
          statusCode: 404,
        })
      );
    });

    it("should add followings from post and return updated post data", async () => {
      const mockUpdatedPost = { id: "67890", title: "TestPost" };
      (followerService.add as jest.Mock).mockResolvedValue(mockUpdatedPost);
      const sut = addFollowingsFromPost as any;
      await sut(req as Request, res as Response, nextMock);
      expect(res.send).toHaveBeenCalledWith({
        status: "success",
        data: mockUpdatedPost,
      });
    });

    it("should pass errors from the followerService to the next middleware", async () => {
      (followerService.add as jest.Mock).mockImplementationOnce(() => {
        throw new Error("Test error");
      });
      const sut = addFollowingsFromPost as any;
      await sut(req as Request, res as Response, nextMock);
      expect(nextMock).toHaveBeenCalledWith(new Error("Test error"));
    });
  });

  describe("removeFollowingsFromPost", () => {
    beforeEach(() => {
      req = {
        loggedInUserId: new Types.ObjectId().toHexString(),
        params: {
          postId: new Types.ObjectId().toHexString(),
          userId: new Types.ObjectId().toHexString(),
        },
      };
      res = {
        send: jest.fn(),
      };
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it("should throw an error if no logged in user id is provided", async () => {
      req.loggedInUserId = undefined;
      const sut = removeFollowingsFromPost as any;
      await sut(req as Request, res as Response, nextMock);
      expect(nextMock).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "No loggedInUser id provided",
          statusCode: 400,
        })
      );
    });

    it("should throw an error if no user id is provided", async () => {
      delete req.params!.userId;
      const sut = removeFollowingsFromPost as any;
      await sut(req as Request, res as Response, nextMock);
      expect(nextMock).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "No user id provided",
          statusCode: 400,
        })
      );
    });

    it("should throw an error if user id is not a valid MongoDB id", async () => {
      req.params!.userId = "123";
      const sut = removeFollowingsFromPost as any;
      await sut(req as Request, res as Response, nextMock);
      expect(nextMock).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Invalid user id: 123",
          statusCode: 400,
        })
      );
    });

    it("should throw an error if no post id is provided", async () => {
      delete req.params!.postId;
      const sut = removeFollowingsFromPost as any;
      await sut(req as Request, res as Response, nextMock);
      expect(nextMock).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "No post id provided",
          statusCode: 400,
        })
      );
    });

    it("should throw an error if post id is not a valid MongoDB id", async () => {
      req.params!.postId = "123";
      const sut = removeFollowingsFromPost as any;
      await sut(req as Request, res as Response, nextMock);
      expect(nextMock).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Invalid post id: 123",
          statusCode: 400,
        })
      );
    });

    it("should throw an error if user is not found", async () => {
      (followerService.remove as jest.Mock).mockImplementationOnce(() => {
        throw new AppError("User not found", 404);
      });
      const sut = removeFollowingsFromPost as any;
      await sut(req as Request, res as Response, nextMock);
      expect(nextMock).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "User not found",
          statusCode: 404,
        })
      );
    });

    it("should remove followings from post and return updated post data", async () => {
      const mockUpdatedPost = { id: "67890", title: "TestPost" };
      (followerService.remove as jest.Mock).mockResolvedValue(mockUpdatedPost);
      const sut = removeFollowingsFromPost as any;
      await sut(req as Request, res as Response, nextMock);
      expect(res.send).toHaveBeenCalledWith({
        status: "success",
        data: mockUpdatedPost,
      });
    });

    it("should pass errors from the followerService to the next middleware", async () => {
      (followerService.remove as jest.Mock).mockImplementationOnce(() => {
        throw new Error("Test error");
      });
      const sut = removeFollowingsFromPost as any;
      await sut(req as Request, res as Response, nextMock);
      expect(nextMock).toHaveBeenCalledWith(new Error("Test error"));
    });
  });
});

/*
Notes: 

this function are not tested, because they are factory functions and are tested in the service test file
- getById
- addUser
- updateUser
- removeUser

*/
