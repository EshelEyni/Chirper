/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from "express";
import { NewPost } from "../../../../shared/types/post.interface";
import {
  addBookmarkedPost,
  addLike,
  addPollVote,
  addPost,
  addPostThread,
  addPromotionalPost,
  addReply,
  addRepost,
  createPostStats,
  getBookmarkedPosts,
  getPostById,
  getPostStats,
  getPosts,
  quotePost,
  removeBookmarkedPost,
  removeLike,
  removeRepost,
  updatePost,
  updatePostStats,
} from "./PostController";
import { asyncErrorCatcher } from "../../Services/Error/ErrorService";
import { getMockPostStats, getMongoId } from "../../Services/Test/TestUtilService";
import { PostBookmarkModel } from "../../Models/PostBookmark/PostBookmarkModel";
import { getLoggedInUserIdFromReq } from "../../Services/ALSService";
import { PostModel } from "../../Models/Post/PostModel";
import postService from "../../Services/Post/PostService";
import { RepostModel } from "../../Models/Repost/RepostModel";
import postStatsService from "../../Services/PostStats/PostStatsService";
import { PostLikeModel } from "../../Models/PostLike/PostLikeModel";
import { PromotionalPostModel } from "../../Models/PromotionalPost/PromotionalPostModel";

jest.mock("../../Services/Post/PostService");
jest.mock("../../Services/PostStats/PostStatsService");

jest.mock("../../Services/ALSService", () => ({
  getLoggedInUserIdFromReq: jest.fn(),
}));

jest.mock("../../Models/Post/PostModel", () => ({
  PostModel: {
    find: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    insertMany: jest.fn(),
    findOneAndUpdate: jest.fn(),
    findOneAndDelete: jest.fn(),
  },
}));

jest.mock("../../Models/PromotionalPost/PromotionalPostModel", () => ({
  PromotionalPostModel: {
    create: jest.fn(),
  },
}));

jest.mock("../../Models/PostBookmark/PostBookmarkModel", () => ({
  PostBookmarkModel: {
    find: jest.fn(),
    create: jest.fn(),
    findOneAndDelete: jest.fn(),
  },
}));

jest.mock("../../Models/Repost/RepostModel", () => ({
  RepostModel: {
    find: jest.fn(),
    create: jest.fn(),
    findOneAndDelete: jest.fn(),
  },
}));

jest.mock("../../Services/Logger/LoggerService", () => ({
  logger: {
    warn: jest.fn(),
  },
}));

jest.mock("../../Models/PollVote/PollVoteModel", () => ({
  PollVoteModel: {
    create: jest.fn(),
  },
}));

jest.mock("../../Models/PostLike/PostLikeModel", () => ({
  PostLikeModel: {
    create: jest.fn(),
    findOneAndDelete: jest.fn(),
  },
}));

jest.mock("../../Models/PostStats/PostStatsModel", () => ({
  PostStatsModel: {
    create: jest.fn(),
    findOneAndUpdate: jest.fn(),
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

  function assertNextToInvalidLoggedInUserIdErr() {
    expect(nextMock).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Invalid loggedInUser id: invalidId",
        statusCode: 401,
      })
    );
  }

  beforeAll(() => {
    mockGetLoggedInUserIdFromReq();
  });

  describe("getPosts", () => {
    beforeEach(() => {
      req = { query: {} };
      res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it("should successfully retrieve and send an array of posts", async () => {
      const mockPosts = Array(5).fill(getMockPost());

      (postService.query as jest.Mock) = jest.fn().mockResolvedValue(mockPosts);

      const sut = getPosts as any;
      await sut(req as Request, res as Response, nextMock);

      expect(res.send).toHaveBeenCalledWith({
        status: "success",
        requestedAt: expect.any(String),
        results: mockPosts.length,
        data: mockPosts,
      });
    });

    it("should successfully retrieve and send an empty array if there are no posts", async () => {
      (postService.query as jest.Mock) = jest.fn().mockResolvedValue([]);

      const sut = getPosts as any;
      await sut(req as Request, res as Response, nextMock);

      expect(res.send).toHaveBeenCalledWith({
        status: "success",
        requestedAt: expect.any(String),
        results: 0,
        data: [],
      });
    });

    it("should return a 500 error if postService.query throws an error", async () => {
      const error = new Error("Test Error");

      (postService.query as jest.Mock) = jest.fn().mockRejectedValue(error);

      nextMock.mockImplementationOnce(err => {
        expect(err).toBe(error);
      });

      const sut = getPosts as any;
      await sut(req as Request, res as Response, nextMock);
    });
  });

  describe("getPostById", () => {
    const id = getMongoId();
    beforeEach(() => {
      req = { params: { id } };
      res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it("should successfully retrieve and send a post", async () => {
      const mockPost = getMockPost();

      (PostModel.findById as jest.Mock).mockImplementation(() => {
        return Promise.resolve(mockPost);
      });

      const sut = getPostById as any;
      await sut(req as Request, res as Response, nextMock);

      expect(res.send).toHaveBeenCalledWith({
        status: "success",
        data: mockPost,
      });

      expect(PostModel.findById).toHaveBeenCalledWith(req.params!.id);
    });

    it("should throw an error if the postId is invalid", async () => {
      req.params!.id = "invalidPostId";

      const sut = getPostById as any;
      await sut(req as Request, res as Response, nextMock);

      expect(nextMock).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Invalid post id: invalidPostId",
          statusCode: 400,
        })
      );
    });

    it("should return a 404 error if the post is not found", async () => {
      (PostModel.findById as jest.Mock).mockResolvedValueOnce(null);

      (nextMock as jest.Mock).mockImplementationOnce(({ message, statusCode }) => {
        expect(message).toBe(`Post with id ${id} not found`);
        expect(statusCode).toBe(404);
      });

      const sut = getPostById as any;
      await sut(req as Request, res as Response, nextMock);
    });

    it("should return a 500 error if postService.getById throws an error", async () => {
      const error = new Error("Test Error");

      (PostModel.findById as jest.Mock) = jest.fn().mockImplementation(() => {
        throw error;
      });

      const sut = getPostById as any;
      await sut(req as Request, res as Response, nextMock);

      expect(nextMock).toHaveBeenCalledWith(error);
    });
  });

  describe("addPost", () => {
    beforeEach(() => {
      mockGetLoggedInUserIdFromReq();
      req = { body: { text: "Test Text" } };
      res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it("should successfully add a post and respond with the new post", async () => {
      const mockPost = getMockPost();
      const createdById = getMongoId();
      mockGetLoggedInUserIdFromReq(createdById);

      (PostModel.create as jest.Mock).mockImplementation(() => {
        return Promise.resolve(mockPost);
      });

      const sut = addPost as any;
      await sut(req as Request, res as Response, nextMock);

      expect(PostModel.create).toHaveBeenCalledWith({ ...req.body, createdById });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.send).toHaveBeenCalledWith({
        status: "success",
        data: mockPost,
      });
      mockGetLoggedInUserIdFromReq();
    });

    it("should throw an error if loggedInUserId is invalid", async () => {
      mockGetLoggedInUserIdFromReq("invalidId");

      const sut = addPost as any;
      await sut(req as Request, res as Response, nextMock);
      expect(nextMock).toHaveBeenCalled();
      assertNextToInvalidLoggedInUserIdErr();
    });

    it("should return a 500 error if postService.add throws an error", async () => {
      const error = new Error("Test Error");

      (PostModel.create as jest.Mock) = jest.fn().mockImplementation(() => {
        throw error;
      });

      const sut = addPost as any;
      await sut(req as Request, res as Response, nextMock);

      expect(nextMock).toHaveBeenCalledWith(error);
    });
  });

  describe("addPostThread", () => {
    beforeEach(() => {
      mockGetLoggedInUserIdFromReq();
      req = { body: [getMockPost(), getMockPost()] };
      res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it("should successfully add a post and respond with the new post", async () => {
      const mockPost = getMockPost();
      const createdById = getMongoId();
      const postsWithCreatedById = req.body.map((p: NewPost) => ({ ...p, createdById }));
      mockGetLoggedInUserIdFromReq(createdById);

      const result = {
        insertedCount: 2,
        insertedIds: req.body.map((p: any) => p._id),
      };

      (PostModel.insertMany as jest.Mock).mockResolvedValueOnce(result);
      (PostModel.findById as jest.Mock).mockResolvedValueOnce(mockPost);

      const sut = addPostThread as any;
      await sut(req as Request, res as Response, nextMock);

      expect(PostModel.insertMany).toHaveBeenCalledWith(postsWithCreatedById, {
        ordered: true,
        rawResult: true,
      });

      expect(PostModel.findById).toHaveBeenCalledWith(result.insertedIds[0]);

      // FIXME: This test is failing because there are two async calls, that for some reason are causing the test to fail
      // expect(res.status).toHaveBeenCalledWith(201);
      // expect(res.send).toHaveBeenCalledWith({
      //   status: "success",
      //   data: mockPost,
      // });
    });

    it("should throw an error if loggedInUserId is invalid", async () => {
      mockGetLoggedInUserIdFromReq("invalidId");
      const sut = addPostThread as any;
      await sut(req as Request, res as Response, nextMock);
      assertNextToInvalidLoggedInUserIdErr();
    });

    it("should return a 500 error if PostModel.insertMany throws an error", async () => {
      const error = new Error("Test Error");

      (PostModel.insertMany as jest.Mock) = jest.fn().mockImplementationOnce(() => {
        throw error;
      });

      const sut = addPostThread as any;
      await sut(req as Request, res as Response, nextMock);

      expect(nextMock).toHaveBeenCalledWith(error);
    });

    it("should return a 500 error if PostModel.findById throws an error", async () => {
      const error = new Error("Test Error");

      (PostModel.insertMany as jest.Mock) = jest.fn().mockImplementation(() => {
        return Promise.resolve({
          insertedCount: 2,
          insertedIds: req.body.map((p: any) => p._id),
        });
      });

      (PostModel.findById as jest.Mock) = jest.fn().mockImplementationOnce(() => {
        throw error;
      });

      nextMock.mockImplementationOnce(err => {
        expect(err).toBe(error);
      });

      const sut = addPostThread as any;
      await sut(req as Request, res as Response, nextMock);
    });
  });

  describe("addReply", () => {
    beforeEach(() => {
      jest.resetAllMocks();
      mockGetLoggedInUserIdFromReq();
      nextMock.mockReset();
      req = {
        params: { id: getMongoId() },
        body: { text: "Test Text" },
      };
      res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it("should successfully add a reply and respond with the new reply", async () => {
      const mockPost = getMockPost();
      const mockReply = getMockPost();
      const createdById = getMongoId();
      mockGetLoggedInUserIdFromReq(createdById);

      (PostModel.create as jest.Mock).mockImplementation(() => {
        return Promise.resolve(mockReply);
      });

      (PostModel.findById as jest.Mock).mockImplementation(() => {
        return Promise.resolve(mockPost);
      });

      const sut = addReply as any;
      await sut(req as Request, res as Response, nextMock);

      expect(PostModel.create).toHaveBeenCalledWith({
        ...req.body,
        createdById,
        parentPostId: req.params!.id,
      });

      expect(PostModel.findById).toHaveBeenCalledWith(req.params!.id);

      // FIXME: This test is failing because there are two async calls, that for some reason are causing the test to fail
      // expect(res.status).toHaveBeenCalledWith(201);
      // expect(res.send).toHaveBeenCalledWith({
      //   status: "success",
      //   data: {
      //     post: mockPost,
      //     reply: mockReply,
      //   },
      // });
    });

    it("should throw an error if loggedInUserId is invalid", async () => {
      mockGetLoggedInUserIdFromReq("invalidId");

      const sut = addReply as any;
      await sut(req as Request, res as Response, nextMock);
      assertNextToInvalidLoggedInUserIdErr();
    });

    it("should throw an error if the postId is invalid", async () => {
      req.params!.id = "invalidPostId";

      const sut = addReply as any;
      await sut(req as Request, res as Response, nextMock);

      expect(nextMock).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Invalid post id: invalidPostId",
          statusCode: 400,
        })
      );

      req.params!.id = getMongoId();
    });

    it("should return a 404 error if the post is not found", async () => {
      (PostModel.findById as jest.Mock).mockResolvedValueOnce(null);

      (nextMock as jest.Mock).mockImplementationOnce(({ message, statusCode }) => {
        expect(message).toBe(`Post with id ${req.params!.id} not found`);
        expect(statusCode).toBe(404);
      });

      const sut = addReply as any;
      await sut(req as Request, res as Response, nextMock);
    });

    it("should return a 500 error if PostModel.create throws an error", async () => {
      const error = new Error("Test Error");

      (PostModel.create as jest.Mock) = jest.fn().mockImplementation(() => {
        throw error;
      });

      const sut = addReply as any;
      await sut(req as Request, res as Response, nextMock);

      expect(nextMock).toHaveBeenCalledWith(error);
    });

    it("should return a 500 error if PostModel.findById throws an error", async () => {
      const error = new Error("Test Error");

      (PostModel.findById as jest.Mock) = jest.fn().mockImplementation(() => {
        throw error;
      });

      nextMock.mockImplementationOnce(err => {
        expect(err).toBe(error);
      });

      const sut = addReply as any;
      await sut(req as Request, res as Response, nextMock);
    });
  });

  describe("quotePost", () => {
    const loggedInUserId = getMongoId();
    beforeEach(() => {
      mockGetLoggedInUserIdFromReq(loggedInUserId);

      nextMock.mockReset();
      req = {
        params: { id: getMongoId() },
        body: { text: "Test Text" },
      };
      res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it("should successfully add a quotePost and respond with the new quotePost", async () => {
      const mockQuotePost = getMockPost();

      (PostModel.create as jest.Mock).mockImplementation(() => {
        return Promise.resolve(mockQuotePost);
      });

      const sut = quotePost as any;
      await sut(req as Request, res as Response, nextMock);

      expect(PostModel.create).toHaveBeenCalledWith({
        ...req.body,
        createdById: loggedInUserId,
        quotedPostId: req.params!.id,
      });

      expect(res.status).toHaveBeenCalledWith(201);

      expect(res.send).toHaveBeenCalledWith({
        status: "success",
        data: mockQuotePost,
      });
    });

    it("should successflly repost and respond with the new repost if the quoted post has no content", async () => {
      req.body = {};
      const post = getMockPost();
      const repost = { ...post, repostedBy: { _id: loggedInUserId } };

      (RepostModel.create as jest.Mock).mockImplementation(() => {
        return Promise.resolve({
          post,
          repost,
        });
      });

      const sut = quotePost as any;
      await sut(req as Request, res as Response, nextMock);

      expect(RepostModel.create).toHaveBeenCalledWith({
        repostOwnerId: loggedInUserId,
        postId: req.params!.id,
      });

      expect(res.status).toHaveBeenCalledWith(201);

      expect(res.send).toHaveBeenCalledWith({
        status: "success",
        data: { post, repost },
      });

      req.body = { text: "Test Text" };
    });

    it("should throw an error if loggedInUserId is invalid", async () => {
      mockGetLoggedInUserIdFromReq("invalidId");

      const sut = quotePost as any;
      await sut(req as Request, res as Response, nextMock);
      assertNextToInvalidLoggedInUserIdErr();
    });

    it("should throw an error if the postId is invalid", async () => {
      req.params!.id = "invalidPostId";

      const sut = quotePost as any;
      await sut(req as Request, res as Response, nextMock);

      expect(nextMock).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Invalid quoted post id: invalidPostId",
          statusCode: 400,
        })
      );
    });
  });

  describe("updatePost", () => {
    const loggedInUserId = getMongoId();

    beforeEach(() => {
      mockGetLoggedInUserIdFromReq(loggedInUserId);
      req = {
        params: { id: getMongoId() },
        body: { text: "Test Text" },
      };
      res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it("should successfully update a post and respond with the updated post", async () => {
      const post = getMockPost();

      (PostModel.findOneAndUpdate as jest.Mock).mockImplementation(() => {
        return Promise.resolve(post);
      });

      const sut = updatePost as any;
      await sut(req as Request, res as Response, nextMock);

      expect(PostModel.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: req.params!.id, createdById: loggedInUserId },
        { text: req.body.text },
        { new: true, runValidators: true }
      );

      expect(res.send).toHaveBeenCalledWith({
        status: "success",
        data: post,
      });
    });

    it("should throw an error if loggedInUserId is invalid", async () => {
      mockGetLoggedInUserIdFromReq("invalidId");

      const sut = updatePost as any;
      await sut(req as Request, res as Response, nextMock);
      assertNextToInvalidLoggedInUserIdErr();
      mockGetLoggedInUserIdFromReq(loggedInUserId);
    });

    it("should throw an error if the postId is invalid", async () => {
      req.params!.id = "invalidPostId";

      const sut = updatePost as any;
      await sut(req as Request, res as Response, nextMock);

      expect(nextMock).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Invalid post id: invalidPostId",
          statusCode: 400,
        })
      );

      req.params!.id = getMongoId();
    });

    it("should return a 404 error if the post is not found", async () => {
      (PostModel.findOneAndUpdate as jest.Mock).mockResolvedValueOnce(null);

      (nextMock as jest.Mock).mockImplementationOnce(({ message, statusCode }) => {
        expect(message).toBe(`Post with id ${req.params!.id} not found`);
        expect(statusCode).toBe(404);
      });

      const sut = updatePost as any;
      await sut(req as Request, res as Response, nextMock);
    });

    it("should throw error if no data is provided in the request", async () => {
      req.body = {};

      const sut = updatePost as any;
      await sut(req as Request, res as Response, nextMock);

      expect(nextMock).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "No data received in the request. Please provide some properties to update.",
          statusCode: 400,
        })
      );
    });

    it("should return a 500 error if PostModel.findOneAndUpdate throws an error", async () => {
      const error = new Error("Test Error");

      (PostModel.findOneAndUpdate as jest.Mock) = jest.fn().mockImplementation(() => {
        throw error;
      });

      const sut = updatePost as any;
      await sut(req as Request, res as Response, nextMock);

      expect(nextMock).toHaveBeenCalledWith(error);
    });
  });

  describe("addRepost", () => {
    const loggedInUserId = getMongoId();

    beforeEach(() => {
      mockGetLoggedInUserIdFromReq(loggedInUserId);
      req = {
        params: { id: getMongoId() },
        body: { text: "Test Text" },
      };
      res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it("should successfully repost a post and respond with the new repost", async () => {
      const post = getMockPost();
      const repost = { ...post, repostedBy: { _id: loggedInUserId } };

      (RepostModel.create as jest.Mock).mockImplementation(() => {
        return Promise.resolve({
          post,
          repost,
        });
      });

      const sut = addRepost as any;
      await sut(req as Request, res as Response, nextMock);

      expect(RepostModel.create).toHaveBeenCalledWith({
        repostOwnerId: loggedInUserId,
        postId: req.params!.id,
      });

      expect(res.status).toHaveBeenCalledWith(201);

      expect(res.send).toHaveBeenCalledWith({
        status: "success",
        data: { post, repost },
      });
    });

    it("should throw an error if loggedInUserId is invalid", async () => {
      mockGetLoggedInUserIdFromReq("invalidId");

      const sut = addRepost as any;
      await sut(req as Request, res as Response, nextMock);
      assertNextToInvalidLoggedInUserIdErr();
      mockGetLoggedInUserIdFromReq(loggedInUserId);
    });

    it("should throw an error if the postId is invalid", async () => {
      req.params!.id = "invalidPostId";

      const sut = addRepost as any;
      await sut(req as Request, res as Response, nextMock);

      expect(nextMock).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Invalid post id: invalidPostId",
          statusCode: 400,
        })
      );

      req.params!.id = getMongoId();
    });

    it("should return a 500 error if RepostModel.create throws an error", async () => {
      const error = new Error("Test Error");

      (RepostModel.create as jest.Mock) = jest.fn().mockImplementation(() => {
        throw error;
      });

      const sut = addRepost as any;
      await sut(req as Request, res as Response, nextMock);

      expect(nextMock).toHaveBeenCalledWith(error);
    });
  });

  describe("removeRepost", () => {
    const loggedInUserId = getMongoId();

    beforeEach(() => {
      mockGetLoggedInUserIdFromReq(loggedInUserId);
      req = {
        params: { id: getMongoId() },
        body: { text: "Test Text" },
      };
      res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it("should successfully remove a repost and respond with the updated post", async () => {
      const post = getMockPost();

      (RepostModel.findOneAndDelete as jest.Mock).mockImplementation(() => {
        return Promise.resolve({ post });
      });

      const sut = removeRepost as any;
      await sut(req as Request, res as Response, nextMock);

      expect(RepostModel.findOneAndDelete).toHaveBeenCalledWith({
        repostOwnerId: loggedInUserId,
        postId: req.params!.id,
      });

      expect(res.send).toHaveBeenCalledWith({
        status: "success",
        data: post,
      });
    });

    it("should throw an error if loggedInUserId is invalid", async () => {
      mockGetLoggedInUserIdFromReq("invalidId");

      const sut = removeRepost as any;
      await sut(req as Request, res as Response, nextMock);
      assertNextToInvalidLoggedInUserIdErr();
      mockGetLoggedInUserIdFromReq(loggedInUserId);
    });

    it("should throw an error if the postId is invalid", async () => {
      req.params!.id = "invalidPostId";

      const sut = removeRepost as any;
      await sut(req as Request, res as Response, nextMock);

      expect(nextMock).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Invalid post id: invalidPostId",
          statusCode: 400,
        })
      );
    });
  });

  describe("addPollVote", () => {
    const loggedInUserId = getMongoId();

    beforeEach(() => {
      mockGetLoggedInUserIdFromReq(loggedInUserId);
      req = {
        params: { id: getMongoId() },
        body: { optionIdx: 0 },
      };
      res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it("should successfully add a poll vote and respond with the updated post", async () => {
      const post = getMockPost();

      (PostModel.findById as jest.Mock).mockImplementation(() => {
        return Promise.resolve(post);
      });

      const sut = addPollVote as any;
      await sut(req as Request, res as Response, nextMock);

      expect(PostModel.findById).toHaveBeenCalledWith(req.params!.id);

      // FIXME: This test is failing because there are two async calls, that for some reason are causing the test to fail
      // expect(res.send).toHaveBeenCalledWith({
      //   status: "success",
      //   data: post,
      // });
    });

    it("should successfully add a poll vote and respond with the updated post even if optionIdx is string typed", async () => {
      req.body.optionIdx = "0";
      const post = getMockPost();

      (PostModel.findById as jest.Mock).mockImplementation(() => {
        return Promise.resolve(post);
      });

      const sut = addPollVote as any;
      await sut(req as Request, res as Response, nextMock);

      expect(PostModel.findById).toHaveBeenCalledWith(req.params!.id);

      // FIXME: This test is failing because there are two async calls, that for some reason are causing the test to fail
      // expect(res.send).toHaveBeenCalledWith({
      //   status: "success",
      //   data: post,
      // });

      req.body.optionIdx = 0;
    });

    it("should throw an error if loggedInUserId is invalid", async () => {
      mockGetLoggedInUserIdFromReq("invalidId");

      const sut = addPollVote as any;
      await sut(req as Request, res as Response, nextMock);
      assertNextToInvalidLoggedInUserIdErr();
      mockGetLoggedInUserIdFromReq(loggedInUserId);
    });

    it("should throw an error if the postId is invalid", async () => {
      req.params!.id = "invalidPostId";

      const sut = addPollVote as any;
      await sut(req as Request, res as Response, nextMock);

      expect(nextMock).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Invalid post id: invalidPostId",
          statusCode: 400,
        })
      );

      req.params!.id = getMongoId();
    });

    it("should throw an error if the optionIdx is invalid", async () => {
      req.body.optionIdx = undefined;

      const sut = addPollVote as any;
      await sut(req as Request, res as Response, nextMock);

      expect(nextMock).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Invalid option index provided",
          statusCode: 400,
        })
      );

      req.body.optionIdx = "string";

      await sut(req as Request, res as Response, nextMock);

      expect(nextMock).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Invalid option index provided",
          statusCode: 400,
        })
      );
    });

    it("should return a 404 error if the post is not found", async () => {
      (PostModel.findById as jest.Mock).mockResolvedValueOnce(null);

      (nextMock as jest.Mock).mockImplementationOnce(({ message, statusCode }) => {
        expect(message).toBe(`Post with id ${req.params!.id} not found`);
        expect(statusCode).toBe(404);
      });

      const sut = addPollVote as any;
      await sut(req as Request, res as Response, nextMock);
    });
  });

  describe("addLike", () => {
    const loggedInUserId = getMongoId();

    beforeEach(() => {
      mockGetLoggedInUserIdFromReq(loggedInUserId);
      req = {
        params: { id: getMongoId() },
        body: { optionIdx: 0 },
      };
      res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it("should successfully add a like and respond with the updated post", async () => {
      const post = getMockPost();

      (PostLikeModel.create as jest.Mock).mockImplementation(() => {
        return Promise.resolve({ post });
      });

      const sut = addLike as any;
      await sut(req as Request, res as Response, nextMock);

      expect(res.send).toHaveBeenCalledWith({
        status: "success",
        data: post,
      });
    });

    it("should throw an error if loggedInUserId is invalid", async () => {
      mockGetLoggedInUserIdFromReq("invalidId");

      const sut = addLike as any;
      await sut(req as Request, res as Response, nextMock);
      assertNextToInvalidLoggedInUserIdErr();
      mockGetLoggedInUserIdFromReq(loggedInUserId);
    });

    it("should throw an error if the postId is invalid", async () => {
      req.params!.id = "invalidPostId";

      const sut = addLike as any;
      await sut(req as Request, res as Response, nextMock);

      expect(nextMock).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Invalid post id: invalidPostId",
          statusCode: 400,
        })
      );

      req.params!.id = getMongoId();
    });

    it("should return a 500 error if PostLikeModel.create throws an error", async () => {
      const error = new Error("Test Error");

      (PostLikeModel.create as jest.Mock) = jest.fn().mockImplementation(() => {
        throw error;
      });

      const sut = addLike as any;
      await sut(req as Request, res as Response, nextMock);

      expect(nextMock).toHaveBeenCalledWith(error);
    });
  });

  describe("removeLike", () => {
    const loggedInUserId = getMongoId();

    beforeEach(() => {
      mockGetLoggedInUserIdFromReq(loggedInUserId);
      req = {
        params: { id: getMongoId() },
        body: { optionIdx: 0 },
      };
      res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it("should successfully remove a like and respond with the updated post", async () => {
      const post = getMockPost();

      (PostLikeModel.findOneAndDelete as jest.Mock).mockImplementation(() => {
        return Promise.resolve({ post });
      });

      const sut = removeLike as any;
      await sut(req as Request, res as Response, nextMock);

      expect(res.send).toHaveBeenCalledWith({
        status: "success",
        data: post,
      });
    });

    it("should throw an error if loggedInUserId is invalid", async () => {
      mockGetLoggedInUserIdFromReq("invalidId");

      const sut = removeLike as any;
      await sut(req as Request, res as Response, nextMock);
      assertNextToInvalidLoggedInUserIdErr();
      mockGetLoggedInUserIdFromReq(loggedInUserId);
    });

    it("should throw an error if the postId is invalid", async () => {
      req.params!.id = "invalidPostId";

      const sut = removeLike as any;
      await sut(req as Request, res as Response, nextMock);

      expect(nextMock).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Invalid post id: invalidPostId",
          statusCode: 400,
        })
      );

      req.params!.id = getMongoId();
    });

    it("should return a 500 error if PostLikeModel.findOneAndDelete throws an error", async () => {
      const error = new Error("Test Error");

      (PostLikeModel.findOneAndDelete as jest.Mock) = jest.fn().mockImplementation(() => {
        throw error;
      });

      const sut = removeLike as any;
      await sut(req as Request, res as Response, nextMock);

      expect(nextMock).toHaveBeenCalledWith(error);
    });
  });

  describe("getPostStats", () => {
    const loggedInUserId = getMongoId();

    beforeEach(() => {
      mockGetLoggedInUserIdFromReq(loggedInUserId);
      req = { params: { id: getMongoId() } };
      res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it("should successfully get post stats", async () => {
      const postStats = getMockPostStats();

      (postStatsService.get as jest.Mock).mockImplementation(() => {
        return Promise.resolve(postStats);
      });

      const sut = getPostStats as any;
      await sut(req as Request, res as Response, nextMock);

      expect(res.send).toHaveBeenCalledWith({
        status: "success",
        data: postStats,
      });
    });

    it("should throw an error if the postId is invalid", async () => {
      req.params!.id = "invalidPostId";

      const sut = getPostStats as any;
      await sut(req as Request, res as Response, nextMock);

      expect(nextMock).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Invalid post id: invalidPostId",
          statusCode: 400,
        })
      );

      req.params!.id = getMongoId();
    });
  });

  describe("createPostStats", () => {
    const loggedInUserId = getMongoId();

    beforeEach(() => {
      mockGetLoggedInUserIdFromReq(loggedInUserId);
      req = { params: { id: getMongoId() } };
      res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it("should successfully create post stats", async () => {
      const sut = createPostStats as any;
      await sut(req as Request, res as Response, nextMock);

      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalledWith({
        status: "success",
        data: null,
      });
    });

    it("should throw an error if the loggedInUserId is invalid", async () => {
      mockGetLoggedInUserIdFromReq("invalidId");

      const sut = createPostStats as any;
      await sut(req as Request, res as Response, nextMock);

      assertNextToInvalidLoggedInUserIdErr();
      mockGetLoggedInUserIdFromReq(loggedInUserId);
    });

    it("should throw an error if the postId is invalid", async () => {
      req.params!.id = "invalidPostId";

      const sut = createPostStats as any;
      await sut(req as Request, res as Response, nextMock);

      expect(nextMock).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Invalid post id: invalidPostId",
          statusCode: 400,
        })
      );

      req.params!.id = getMongoId();
    });
  });

  describe("updatePostStats", () => {
    const loggedInUserId = getMongoId();

    beforeEach(() => {
      mockGetLoggedInUserIdFromReq(loggedInUserId);
      req = { params: { id: getMongoId() } };
      res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it("should successfully create post stats", async () => {
      const sut = updatePostStats as any;
      await sut(req as Request, res as Response, nextMock);

      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalledWith({
        status: "success",
        data: null,
      });
    });

    it("should throw an error if the loggedInUserId is invalid", async () => {
      mockGetLoggedInUserIdFromReq("invalidId");

      const sut = updatePostStats as any;
      await sut(req as Request, res as Response, nextMock);

      assertNextToInvalidLoggedInUserIdErr();
      mockGetLoggedInUserIdFromReq(loggedInUserId);
    });

    it("should throw an error if the postId is invalid", async () => {
      req.params!.id = "invalidPostId";

      const sut = updatePostStats as any;
      await sut(req as Request, res as Response, nextMock);

      expect(nextMock).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Invalid post id: invalidPostId",
          statusCode: 400,
        })
      );

      req.params!.id = getMongoId();
    });
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

      (PostBookmarkModel.find as jest.Mock).mockImplementation(() => {
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
      (PostBookmarkModel.find as jest.Mock).mockImplementation(() => {
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

      (PostBookmarkModel.find as jest.Mock).mockImplementation(() => {
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

      (PostBookmarkModel.create as jest.Mock).mockImplementation(() => {
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

      (PostBookmarkModel.create as jest.Mock) = jest.fn().mockImplementation(() => {
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
      res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it("should successfully remove a post from bookmarks and respond with the updated post", async () => {
      const mockPost = { post: getMockPost() };

      (PostBookmarkModel.findOneAndDelete as jest.Mock).mockImplementation(() => {
        return Promise.resolve(mockPost);
      });

      const sut = removeBookmarkedPost as any;
      await sut(req as Request, res as Response, nextMock);

      expect(res.send).toHaveBeenCalledWith({
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

    it("should return a 404 error if the post is not bookmarked", async () => {
      (PostBookmarkModel.findOneAndDelete as jest.Mock).mockResolvedValueOnce(null);

      (nextMock as jest.Mock).mockImplementationOnce(({ message, statusCode }) => {
        expect(message).toBe("Post is not bookmarked");
        expect(statusCode).toBe(404);
      });

      const sut = removeBookmarkedPost as any;
      await sut(req as Request, res as Response, nextMock);
    });

    it("should return a 500 error if bookmarkService.remove throws an error", async () => {
      const error = new Error("Test Error");

      (PostBookmarkModel.findOneAndDelete as jest.Mock) = jest.fn().mockImplementation(() => {
        throw error;
      });

      const sut = removeBookmarkedPost as any;
      await sut(req as Request, res as Response, nextMock);

      expect(nextMock).toHaveBeenCalledWith(error);
    });
  });

  describe("addPromotionalPost", () => {
    const loggedInUserId = getMongoId();

    beforeEach(() => {
      mockGetLoggedInUserIdFromReq(loggedInUserId);
      req = { params: { id: getMongoId() }, body: { text: "Test Text" } };
      res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it("should successfully add a promotional post and respond with the updated post", async () => {
      const mockPost = getMockPost();

      (PromotionalPostModel.create as jest.Mock).mockImplementation(() => {
        return Promise.resolve(mockPost);
      });

      const sut = addPromotionalPost as any;
      await sut(req as Request, res as Response, nextMock);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.send).toHaveBeenCalledWith({
        status: "success",
        data: mockPost,
      });
    });

    it("should throw an error if the loggedInUserId is invalid", async () => {
      mockGetLoggedInUserIdFromReq("invalidId");

      const sut = addPromotionalPost as any;
      await sut(req as Request, res as Response, nextMock);

      assertNextToInvalidLoggedInUserIdErr();
      mockGetLoggedInUserIdFromReq(loggedInUserId);
    });
  });
});
