/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from "express";
import { asyncErrorCatcher } from "../../../services/error/error.service";
import bookmarkService from "../services/bookmark/bookmark.service";
import { addBookmarkedPost, getBookmarkedPosts, removeBookmarkedPost } from "./post.controller";
import { getMongoId } from "../../../services/test-util.service";

jest.mock("../services/bookmark/bookmark.service");
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

xdescribe("Post Controller", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;

  function getMockPost() {
    return {
      _id: getMongoId(),
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

  describe("getBookmarkedPosts", () => {
    beforeEach(() => {
      req = { query: {}, loggedInUserId: getMongoId() };
      res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it("should successfully retrieve and send an array bookmarked posts", async () => {
      const mockPosts = Array(5).fill(getMockPost());

      (bookmarkService.get as jest.Mock) = jest.fn().mockResolvedValue(mockPosts);

      const sut = getBookmarkedPosts as any;
      await sut(req as Request, res as Response, nextMock);

      expect(res.send).toHaveBeenCalledWith({
        status: "success",
        requestedAt: expect.any(String),
        results: mockPosts.length,
        data: mockPosts,
      });
    });

    it("should successfully retrieve and send an empty array if there are no bookmarked posts", async () => {
      const mockPosts = [] as any[];

      (bookmarkService.get as jest.Mock) = jest.fn().mockResolvedValue(mockPosts);

      const sut = getBookmarkedPosts as any;
      await sut(req as Request, res as Response, nextMock);

      expect(res.send).toHaveBeenCalledWith({
        status: "success",
        requestedAt: expect.any(String),
        results: mockPosts.length,
        data: mockPosts,
      });
    });

    it("should throw an error if user is not logged in", async () => {
      req.loggedInUserId = undefined;

      const sut = getBookmarkedPosts as any;
      await sut(req as Request, res as Response, nextMock);

      expect(nextMock).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "No loggedInUser id provided",
          statusCode: 401,
        })
      );
    });

    it("should return a 500 error if bookmarkService.get throws an error", async () => {
      const error = new Error("Test Error");
      (bookmarkService.get as jest.Mock) = jest.fn().mockImplementation(() => {
        throw error;
      });

      const sut = getBookmarkedPosts as any;
      await sut(req as Request, res as Response, nextMock);

      expect(nextMock).toHaveBeenCalledWith(error);
    });
  });

  describe("addBookmarkedPost", () => {
    beforeEach(() => {
      req = {
        params: { id: getMongoId() },
        loggedInUserId: getMongoId(),
      };
      res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it("should successfully add a post to bookmarks and respond with the updated post", async () => {
      const mockPost = getMockPost();

      (bookmarkService.add as jest.Mock) = jest.fn().mockResolvedValue(mockPost);

      const sut = addBookmarkedPost as any;
      await sut(req as Request, res as Response, nextMock);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.send).toHaveBeenCalledWith({
        status: "success",
        data: mockPost,
      });
    });

    it("should throw an error if user is not logged in", async () => {
      req.loggedInUserId = undefined;

      const sut = addBookmarkedPost as any;
      await sut(req as Request, res as Response, nextMock);

      expect(nextMock).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "No loggedInUser id provided",
          statusCode: 401,
        })
      );
    });

    it("should throw an error if the postId is invalid", async () => {
      req.params!.id = "invalidPostId";

      const sut = addBookmarkedPost as any;
      await sut(req as Request, res as Response, nextMock);

      expect(nextMock).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Invalid post id: invalidPostId",
          statusCode: 400,
        })
      );
    });

    it("should return a 500 error if bookmarkService.add throws an error", async () => {
      const error = new Error("Test Error");
      (bookmarkService.add as jest.Mock) = jest.fn().mockImplementation(() => {
        throw error;
      });

      const sut = addBookmarkedPost as any;
      await sut(req as Request, res as Response, nextMock);

      expect(nextMock).toHaveBeenCalledWith(error);
    });
  });

  describe("removeBookmarkedPost", () => {
    beforeEach(() => {
      req = {
        params: { id: getMongoId() },
        loggedInUserId: getMongoId(),
      };
      res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it("should successfully remove a post from bookmarks and respond with the updated post", async () => {
      const mockPost = getMockPost();

      (bookmarkService.remove as jest.Mock) = jest.fn().mockResolvedValue(mockPost);

      const sut = removeBookmarkedPost as any;
      await sut(req as Request, res as Response, nextMock);

      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        data: mockPost,
      });
    });

    it("should throw an error if user is not logged in", async () => {
      req.loggedInUserId = undefined;

      const sut = removeBookmarkedPost as any;
      await sut(req as Request, res as Response, nextMock);

      expect(nextMock).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "No loggedInUser id provided",
          statusCode: 401,
        })
      );
    });

    it("should throw an error if the postId is invalid", async () => {
      req.params!.id = "invalidPostId";

      const sut = removeBookmarkedPost as any;
      await sut(req as Request, res as Response, nextMock);

      expect(nextMock).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Invalid post id: invalidPostId",
          statusCode: 400,
        })
      );
    });

    it("should return a 500 error if bookmarkService.remove throws an error", async () => {
      const error = new Error("Test Error");
      (bookmarkService.remove as jest.Mock) = jest.fn().mockImplementation(() => {
        throw error;
      });

      const sut = removeBookmarkedPost as any;
      await sut(req as Request, res as Response, nextMock);

      expect(nextMock).toHaveBeenCalledWith(error);
    });
  });
});
