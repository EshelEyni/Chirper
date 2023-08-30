/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from "express";
import { AppError, asyncErrorCatcher } from "../../../../services/error/error.service";
import {
  addFollowings,
  addFollowingsFromPost,
  removeFollowings,
  removeFollowingsFromPost,
} from "./user-relation.controller";
import followerService from "../../services/user-relation/user-relation.service";
import { getMongoId } from "../../../../services/test-util.service";

jest.mock("../../services/user-relation/user-relation.service");
jest.mock("../../../../services/als.service", () => ({
  getLoggedInUserIdFromReq: jest.fn(),
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

describe("User Relation Controller", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;

  describe("addFollowings", () => {
    beforeEach(() => {
      req = {
        loggedInUserId: getMongoId(),
        params: {
          id: getMongoId(),
        },
        body: {},
      };
      res = {
        send: jest.fn(),
      };
      nextMock.mockClear();
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    fit("should throw an error if no user id is provided", async () => {
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
        loggedInUserId: getMongoId(),
        params: {
          id: getMongoId(),
        },
      };
      res = {
        send: jest.fn(),
      };
      nextMock.mockClear();
      jest.clearAllMocks();
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
        loggedInUserId: getMongoId(),
        params: {
          postId: getMongoId(),
          userId: getMongoId(),
        },
      };
      res = {
        send: jest.fn(),
      };
    });

    afterEach(() => {
      jest.clearAllMocks();
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
        loggedInUserId: getMongoId(),
        params: {
          postId: getMongoId(),
          userId: getMongoId(),
        },
      };
      res = {
        send: jest.fn(),
      };
    });

    afterEach(() => {
      jest.clearAllMocks();
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
