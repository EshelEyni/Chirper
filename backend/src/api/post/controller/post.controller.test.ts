/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from "express";
import { asyncErrorCatcher } from "../../../services/error/error.service";
import { addBookmarkedPost, getBookmarkedPosts, removeBookmarkedPost } from "./post.controller";
import { getMongoId } from "../../../services/test-util.service";
import { BookmarkedPostModel } from "../models/bookmark/bookmark-post.model";
import { getLoggedInUserIdFromReq } from "../../../services/als.service";

jest.mock("../../../services/als.service", () => ({
  getLoggedInUserIdFromReq: jest.fn(),
}));

jest.mock("../models/bookmark/bookmark-post.model", () => ({
  BookmarkedPostModel: {
    find: jest.fn(),
    create: jest.fn(),
    findOneAndDelete: jest.fn(),
  },
}));

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

describe("Post Controller", () => {
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

  function mockGetLoggedInUserIdFromReq(value?: any) {
    (getLoggedInUserIdFromReq as jest.Mock).mockReturnValue(
      value !== undefined ? value : getMongoId()
    );
  }

  beforeAll(() => {
    mockGetLoggedInUserIdFromReq();
  });

  describe("getBookmarkedPosts", () => {
    beforeEach(() => {
      req = { query: {} };
      res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it("should successfully retrieve and send an array bookmarked posts", async () => {
      // Putting the post into a post property of the bookmarked post is a
      // workaround for the populate virtual not working in the test environment
      const mockBookmarkedPosts = Array(5)
        .fill(getMockPost())
        .map(post => ({ post }));

      (BookmarkedPostModel.find as jest.Mock).mockImplementation(() => {
        return Promise.resolve(mockBookmarkedPosts);
      });

      const sut = getBookmarkedPosts as any;
      await sut(req as Request, res as Response, nextMock);

      expect(res.send).toHaveBeenCalledWith({
        status: "success",
        requestedAt: expect.any(String),
        results: mockBookmarkedPosts.length,
        data: mockBookmarkedPosts.map(({ post }) => post),
      });
    });

    it("should successfully retrieve and send an empty array if there are no bookmarked posts", async () => {
      (BookmarkedPostModel.find as jest.Mock).mockImplementation(() => {
        return Promise.resolve([]);
      });

      const sut = getBookmarkedPosts as any;
      await sut(req as Request, res as Response, nextMock);

      expect(res.send).toHaveBeenCalledWith({
        status: "success",
        requestedAt: expect.any(String),
        results: 0,
        data: [],
      });
    });

    it("should throw an error if user is not logged in", async () => {
      mockGetLoggedInUserIdFromReq(null);
      const sut = getBookmarkedPosts as any;
      await sut(req as Request, res as Response, nextMock);

      expect(nextMock).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "No loggedInUser id provided",
          statusCode: 401,
        })
      );

      mockGetLoggedInUserIdFromReq(getMongoId());
    });

    it("should return a 500 error if bookmarkService.get throws an error", async () => {
      const error = new Error("Test Error");

      (BookmarkedPostModel.find as jest.Mock).mockImplementation(() => {
        throw error;
      });

      const sut = getBookmarkedPosts as any;
      await sut(req as Request, res as Response, nextMock);

      expect(nextMock).toHaveBeenCalledWith(error);
    });
  });

  describe("addBookmarkedPost", () => {
    beforeEach(() => {
      req = { params: { id: getMongoId() } };
      res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it("should successfully add a post to bookmarks and respond with the updated post", async () => {
      const mockPost = { post: getMockPost() };

      (BookmarkedPostModel.create as jest.Mock).mockImplementation(() => {
        return Promise.resolve(mockPost);
      });

      const sut = addBookmarkedPost as any;
      await sut(req as Request, res as Response, nextMock);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.send).toHaveBeenCalledWith({
        status: "success",
        data: mockPost.post,
      });
    });

    it("should throw an error if user is not logged in", async () => {
      mockGetLoggedInUserIdFromReq(null);

      const sut = addBookmarkedPost as any;
      await sut(req as Request, res as Response, nextMock);

      expect(nextMock).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "No loggedInUser id provided",
          statusCode: 401,
        })
      );

      mockGetLoggedInUserIdFromReq(getMongoId());
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

      (BookmarkedPostModel.create as jest.Mock) = jest.fn().mockImplementation(() => {
        throw error;
      });

      const sut = addBookmarkedPost as any;
      await sut(req as Request, res as Response, nextMock);

      expect(nextMock).toHaveBeenCalledWith(error);
    });
  });

  describe("removeBookmarkedPost", () => {
    beforeEach(() => {
      req = { params: { id: getMongoId() } };
      res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it("should successfully remove a post from bookmarks and respond with the updated post", async () => {
      const mockPost = { post: getMockPost() };

      (BookmarkedPostModel.findOneAndDelete as jest.Mock).mockImplementation(() => {
        return Promise.resolve(mockPost);
      });

      const sut = removeBookmarkedPost as any;
      await sut(req as Request, res as Response, nextMock);

      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        data: mockPost.post,
      });
    });

    it("should throw an error if user is not logged in", async () => {
      mockGetLoggedInUserIdFromReq(null);

      const sut = removeBookmarkedPost as any;
      await sut(req as Request, res as Response, nextMock);

      expect(nextMock).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "No loggedInUser id provided",
          statusCode: 401,
        })
      );

      mockGetLoggedInUserIdFromReq(getMongoId());
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

      (BookmarkedPostModel.findOneAndDelete as jest.Mock) = jest.fn().mockImplementation(() => {
        throw error;
      });

      const sut = removeBookmarkedPost as any;
      await sut(req as Request, res as Response, nextMock);

      expect(nextMock).toHaveBeenCalledWith(error);
    });
  });
});
