import { Types } from "mongoose";
import { BookmarkedPostModel } from "../../models/bookmark-post.model";
import bookmarkService from "./bookmark.service";
import postUtilService, { loggedInUserActionDefaultState } from "../util/util.service";
import followerService from "../../../user/services/follower/follower.service";
import { AppError } from "../../../../services/error/error.service";

jest.mock("../../models/post.model", () => ({
  PostModel: {
    findById: jest.fn(),
  },
}));

jest.mock("../../models/bookmark-post.model", () => ({
  BookmarkedPostModel: {
    find: jest.fn().mockReturnValue({ exec: jest.fn() }),
    findOneAndRemove: jest.fn(),
    create: jest.fn(),
  },
}));

jest.mock("../../../user/services/follower/follower.service");
jest.mock("../util/util.service");

describe("BookmarkService", () => {
  function getMockBookmarkPost(): any {
    return {
      bookmarkOwnerId: new Types.ObjectId().toHexString(),
      post: getMockPost(),
      toObject: jest.fn().mockReturnThis(),
    };
  }

  function getMockPost(): any {
    return {
      _id: new Types.ObjectId().toHexString(),
      createdBy: {
        _id: new Types.ObjectId().toHexString(),
        isFollowing: false,
      },
      loggedInUserActionState: {},
      toObject: jest.fn().mockReturnThis(),
    };
  }

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("get", () => {
    const userId = new Types.ObjectId().toHexString();
    const mockedBookMarkedPosts = [getMockBookmarkPost(), getMockBookmarkPost()];

    it("should return bookmarked posts", async () => {
      const expected = mockedBookMarkedPosts.map(post => post.post);
      (BookmarkedPostModel.find as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockedBookMarkedPosts),
      });
      const res = await bookmarkService.get(userId);
      expect(res).toEqual(expected);
    });

    it("should handle errors from fetching bookmarked posts", async () => {
      (BookmarkedPostModel.find as jest.Mock).mockReturnValueOnce({
        exec: jest.fn().mockRejectedValue(new Error("Test error")),
      });
      await expect(bookmarkService.get(userId)).rejects.toThrow("Test error");
    });

    it("should integrate loggedInUserActionState for each post", async () => {
      const mockActionStates = mockedBookMarkedPosts.map(() => {
        const keys = Object.keys(loggedInUserActionDefaultState);
        const randomBoolean = () => Math.random() >= 0.5;
        return keys.reduce((acc, key) => ({ ...acc, [key]: randomBoolean() }), {});
      });

      (BookmarkedPostModel.find as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockedBookMarkedPosts),
      });

      mockActionStates.forEach((actionState, index) => {
        (postUtilService.getLoggedInUserActionState as jest.Mock).mockResolvedValueOnce(
          actionState
        );
        mockedBookMarkedPosts[index].post.loggedInUserActionState = actionState;
      });

      const res = await bookmarkService.get(userId);

      expect(postUtilService.getLoggedInUserActionState).toHaveBeenCalledTimes(
        mockedBookMarkedPosts.length
      );
      res.forEach((post, index) => {
        expect(post.loggedInUserActionState).toEqual(mockActionStates[index]);
      });
    });

    it("should populate isFollowing for createdBy user of each post", async () => {
      const mockIsFollowing = mockedBookMarkedPosts.map(() => Math.random() >= 0.5);
      (BookmarkedPostModel.find as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockedBookMarkedPosts),
      });
      mockIsFollowing.forEach(isFollowing => {
        (followerService.getIsFollowing as jest.Mock).mockResolvedValueOnce(isFollowing);
      });
      const res = await bookmarkService.get(userId);
      expect(followerService.getIsFollowing).toHaveBeenCalledTimes(mockedBookMarkedPosts.length);
      res.forEach((post, index) => {
        expect(post.createdBy.isFollowing).toEqual(mockIsFollowing[index]);
      });
    });

    it("should return an empty array if there are no bookmarked posts", async () => {
      (BookmarkedPostModel.find as jest.Mock).mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue([]),
      });
      const res = await bookmarkService.get(userId);
      expect(res).toEqual([]);
    });
  });

  describe("add", () => {
    const postId = new Types.ObjectId().toHexString();
    const userId = new Types.ObjectId().toHexString();
    const mockedBookMarkedPost = getMockBookmarkPost();

    it("should add a bookmarked post", async () => {
      (BookmarkedPostModel.create as jest.Mock).mockResolvedValueOnce(mockedBookMarkedPost);
      (postUtilService.getLoggedInUserActionState as jest.Mock).mockResolvedValueOnce({});
      (followerService.getIsFollowing as jest.Mock).mockResolvedValueOnce(false);

      const res = await bookmarkService.add(postId, userId);
      expect(res).toEqual(mockedBookMarkedPost.post);
    });

    it("should integrate loggedInUserActionState for the post", async () => {
      const mockActionState = {
        ...loggedInUserActionDefaultState,
        isBookmarked: true,
      };

      (BookmarkedPostModel.create as jest.Mock).mockResolvedValueOnce(mockedBookMarkedPost);
      (postUtilService.getLoggedInUserActionState as jest.Mock).mockResolvedValueOnce(
        mockActionState
      );

      const res = await bookmarkService.add(postId, userId);
      expect(postUtilService.getLoggedInUserActionState).toHaveBeenCalledTimes(1);
      expect(res.loggedInUserActionState).toEqual(mockActionState);
    });

    it("should populate isFollowing for createdBy user of the post", async () => {
      const mockIsFollowing = Math.random() >= 0.5;

      (BookmarkedPostModel.create as jest.Mock).mockResolvedValueOnce(mockedBookMarkedPost);
      (followerService.getIsFollowing as jest.Mock).mockResolvedValueOnce(mockIsFollowing);

      const res = await bookmarkService.add(postId, userId);
      expect(followerService.getIsFollowing).toHaveBeenCalledTimes(1);
      expect(res.createdBy.isFollowing).toEqual(mockIsFollowing);
    });

    it("should handle error where adding a bookmark to post that doesn't exists", async () => {
      (BookmarkedPostModel.create as jest.Mock).mockRejectedValueOnce(
        new AppError("Referenced post does not exist", 404)
      );
      await expect(bookmarkService.add(postId, userId)).rejects.toThrow(
        new AppError("Referenced post does not exist", 404)
      );
    });

    it("should handle errors from adding a bookmarked post", async () => {
      (BookmarkedPostModel.create as jest.Mock).mockRejectedValueOnce(new Error("Test error"));
      await expect(bookmarkService.add(postId, userId)).rejects.toThrow("Test error");
    });
  });

  describe("remove", () => {
    const postId = new Types.ObjectId().toHexString();
    const userId = new Types.ObjectId().toHexString();
    const mockedBookMarkedPost = getMockBookmarkPost();

    afterEach(() => {
      jest.clearAllMocks();
    });

    it("should remove a bookmarked post", async () => {
      (BookmarkedPostModel.findOneAndRemove as jest.Mock).mockResolvedValueOnce(
        mockedBookMarkedPost
      );

      await bookmarkService.remove(postId, userId);
      expect(BookmarkedPostModel.findOneAndRemove).toHaveBeenCalledTimes(1);
      expect(BookmarkedPostModel.findOneAndRemove).toHaveBeenCalledWith({
        postId,
        bookmarkOwnerId: userId,
      });
    });

    it("should integrate loggedInUserActionState for the post", async () => {
      const mockActionState = {
        ...loggedInUserActionDefaultState,
        isBookmarked: true,
      };

      (BookmarkedPostModel.findOneAndRemove as jest.Mock).mockResolvedValueOnce(
        mockedBookMarkedPost
      );
      (postUtilService.getLoggedInUserActionState as jest.Mock).mockResolvedValueOnce(
        mockActionState
      );

      const res = await bookmarkService.remove(postId, userId);
      expect(postUtilService.getLoggedInUserActionState).toHaveBeenCalledTimes(1);
      expect(res.loggedInUserActionState).toEqual(mockActionState);
    });

    it("should populate isFollowing for createdBy user of the post", async () => {
      const mockIsFollowing = Math.random() >= 0.5;

      (BookmarkedPostModel.findOneAndRemove as jest.Mock).mockResolvedValueOnce(
        mockedBookMarkedPost
      );
      (followerService.getIsFollowing as jest.Mock).mockResolvedValueOnce(mockIsFollowing);

      const res = await bookmarkService.remove(postId, userId);
      expect(followerService.getIsFollowing).toHaveBeenCalledTimes(1);
      expect(res.createdBy.isFollowing).toEqual(mockIsFollowing);
    });

    it("should handle error where removing a bookmark to post that doesn't exists", async () => {
      (BookmarkedPostModel.findOneAndRemove as jest.Mock).mockResolvedValueOnce(null);
      await expect(bookmarkService.remove(postId, userId)).rejects.toThrow(
        new AppError("This Post is not Bookmarked", 404)
      );
    });

    it("should handle error where removing a bookmark from a post that is not bookmarked", async () => {
      (BookmarkedPostModel.findOneAndRemove as jest.Mock).mockRejectedValueOnce(
        new AppError("Referenced post does not exist", 404)
      );
      await expect(bookmarkService.remove(postId, userId)).rejects.toThrow(
        new AppError("Referenced post does not exist", 404)
      );
    });

    it("should handle errors from removing a bookmarked post", async () => {
      (BookmarkedPostModel.findOneAndRemove as jest.Mock).mockRejectedValueOnce(
        new Error("Test error")
      );
      await expect(bookmarkService.remove(postId, userId)).rejects.toThrow("Test error");
    });
  });
});

// Path: src\api\post\services\comment\comment.service.test.ts