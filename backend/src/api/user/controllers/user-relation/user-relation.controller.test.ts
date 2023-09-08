/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from "express";
import { AppError, asyncErrorCatcher } from "../../../../services/error/error.service";
import { addFollow, removeFollow } from "./user-relation.controller";
import userRelationService from "../../services/user-relation/user-relation.service";
import { getMongoId } from "../../../../services/test/test-util.service";
import { getLoggedInUserIdFromReq } from "../../../../services/als.service";

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
  (getLoggedInUserIdFromReq as jest.Mock).mockReturnValue(getMongoId());

  let req: Partial<Request>;
  let res: Partial<Response>;

  describe("addFollowings", () => {
    beforeEach(() => {
      req = {
        params: { id: getMongoId() },
        body: {},
      };
      res = { send: jest.fn() };
      nextMock.mockClear();
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it("should throw an error if no user id is provided", async () => {
      req.params = {};
      const sut = addFollow as any;
      await sut(req as Request, res as Response, nextMock);
      expect(nextMock).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "No user id provided",
          statusCode: 400,
        })
      );
    });

    it("should throw an error if logged in user id is not a valid MongoDB id", async () => {
      (getLoggedInUserIdFromReq as jest.Mock).mockReturnValueOnce("123");

      const sut = addFollow as any;
      await sut(req as Request, res as Response, nextMock);
      expect(nextMock).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining("Invalid loggedInUser id: 123"),
          statusCode: 401,
        })
      );
    });

    it("should throw an error if user id is not a valid MongoDB id", async () => {
      req.params!.id = "123";
      const sut = addFollow as any;
      await sut(req as Request, res as Response, nextMock);
      expect(nextMock).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Invalid user id: 123",
          statusCode: 400,
        })
      );
    });

    it("should throw an error if user is not found", async () => {
      (userRelationService.add as jest.Mock).mockImplementationOnce(() => {
        throw new AppError("User not found", 404);
      });
      const sut = addFollow as any;
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
      (userRelationService.add as jest.Mock).mockResolvedValue(mockUpdatedUser);
      const sut = addFollow as any;
      await sut(req as Request, res as Response, nextMock);
      expect(res.send).toHaveBeenCalledWith({
        status: "success",
        data: mockUpdatedUser,
      });
    });

    it("should add followings from post and return updated post data", async () => {
      req = {
        params: {
          postId: getMongoId(),
          userId: getMongoId(),
        },
      };

      const mockUpdatedPost = { id: "67890", title: "TestPost" };
      (userRelationService.add as jest.Mock).mockResolvedValue(mockUpdatedPost);
      const sut = addFollow as any;
      await sut(req as Request, res as Response, nextMock);
      expect(res.send).toHaveBeenCalledWith({
        status: "success",
        data: mockUpdatedPost,
      });
    });

    it("should pass errors from the userRelationService to the next middleware", async () => {
      (userRelationService.add as jest.Mock).mockImplementationOnce(() => {
        throw new Error("Test error");
      });
      const sut = addFollow as any;
      await sut(req as Request, res as Response, nextMock);
      expect(nextMock).toHaveBeenCalledWith(new Error("Test error"));
    });
  });

  describe("removeFollowings", () => {
    beforeEach(() => {
      req = { params: { id: getMongoId() } };
      res = { send: jest.fn() };
      nextMock.mockClear();
      jest.clearAllMocks();
    });

    it("should throw an error if no user id is provided", async () => {
      req.params = {};
      const sut = removeFollow as any;
      await sut(req as Request, res as Response, nextMock);
      expect(nextMock).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "No user id provided",
          statusCode: 400,
        })
      );
    });

    it("should throw an error if user is not found", async () => {
      (userRelationService.remove as jest.Mock).mockImplementationOnce(() => {
        throw new AppError("User not found", 404);
      });
      const sut = removeFollow as any;
      await sut(req as Request, res as Response, nextMock);
      expect(nextMock).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "User not found",
          statusCode: 404,
        })
      );
    });

    it("should throw an error if logged in user id is not a valid MongoDB id", async () => {
      (getLoggedInUserIdFromReq as jest.Mock).mockReturnValueOnce("123");

      const sut = addFollow as any;
      await sut(req as Request, res as Response, nextMock);
      expect(nextMock).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining("Invalid loggedInUser id: 123"),
          statusCode: 401,
        })
      );
    });

    it("should throw an error if user id is not a valid MongoDB id", async () => {
      req.params!.id = "123";
      const sut = removeFollow as any;
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
      (userRelationService.remove as jest.Mock).mockResolvedValue(mockUpdatedUser);
      const sut = removeFollow as any;
      await sut(req as Request, res as Response, nextMock);
      expect(res.send).toHaveBeenCalledWith({
        status: "success",
        data: mockUpdatedUser,
      });
    });

    it("should remove followings from post and return updated post data", async () => {
      const mockUpdatedPost = { id: "67890", title: "TestPost" };
      (userRelationService.remove as jest.Mock).mockResolvedValue(mockUpdatedPost);
      const sut = removeFollow as any;
      await sut(req as Request, res as Response, nextMock);
      expect(res.send).toHaveBeenCalledWith({
        status: "success",
        data: mockUpdatedPost,
      });
    });

    it("should pass errors from the userRelationService to the next middleware", async () => {
      (userRelationService.remove as jest.Mock).mockImplementationOnce(() => {
        throw new Error("Test error");
      });
      const sut = removeFollow as any;
      await sut(req as Request, res as Response, nextMock);
      expect(nextMock).toHaveBeenCalledWith(new Error("Test error"));
    });
  });
});
