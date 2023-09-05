import { asyncLocalStorage } from "../../../../services/als.service";
import { BookmarkedPostModel } from "../../models/bookmark/bookmark-post.model";
import { PostLikeModel } from "../../models/like/post-like.model";
import { PostStatsModel } from "../../models/post-stats/post-stats.model";
import { RepostModel } from "../../models/repost/repost.model";
import postUtilService, { loggedInUserActionDefaultState } from "./util.service";
import { Types } from "mongoose";
import { getMongoId } from "../../../../services/test/test-util.service";
import { assertLoggedInUserState } from "../../../../services/test/test-assertion.service";

jest.mock("../../../../services/als.service");
jest.mock("../../../../services/util/util.service", () => ({
  ...jest.requireActual("../../../../services/util/util.service"),
  queryEntityExists: jest.fn(),
}));

jest.mock("../../models/repost.model", () => ({
  RepostModel: {
    find: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnThis(),
      exec: jest.fn(),
    }),
  },
}));

jest.mock("../../models/post-like.model", () => ({
  PostLikeModel: {
    find: jest.fn(),
  },
}));

jest.mock("../../models/bookmark-post.model", () => ({
  BookmarkedPostModel: {
    find: jest.fn(),
  },
}));

jest.mock("../../models/post-stats.model", () => ({
  PostStatsModel: {
    find: jest.fn(),
  },
}));

describe("Post Util Service", () => {
  describe("getPostLoggedInUserActionState", () => {
    function getPostsStats() {
      const keys = [
        "isViewed",
        "isDetailedViewed",
        "isProfileViewed",
        "isFollowedFromPost",
        "isHashTagClicked",
        "isLinkClicked",
        "isPostLinkCopied",
        "isPostShared",
        "isPostSendInMessage",
        "isPostBookmarked",
      ] as const;

      return keys.reduce((acc, key) => ({ ...acc, [key]: Math.random() > 0.5 }), {});
    }

    const userId = new Types.ObjectId(getMongoId());
    beforeEach(() => {
      (asyncLocalStorage.getStore as jest.Mock).mockReturnValueOnce({
        loggedInUserId: userId,
      });
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it("should return proper action states for the logged-in user", async () => {
      const postStats = getPostsStats();
      const postId = getMongoId();
      const loggedInUserId = getMongoId();

      (asyncLocalStorage.getStore as jest.Mock).mockReturnValue({ loggedInUserId });
      (RepostModel.find().exec as jest.Mock).mockReturnValueOnce([{ postId }]);
      (PostLikeModel.find as jest.Mock).mockReturnValueOnce([{ postId }]);
      (BookmarkedPostModel.find as jest.Mock).mockReturnValueOnce([{ postId }]);
      (PostStatsModel.find as jest.Mock).mockReturnValueOnce([{ postId, ...postStats }]);

      const result = await postUtilService.getPostLoggedInUserActionState(postId);

      expect(asyncLocalStorage.getStore).toBeCalledTimes(1);

      expect(RepostModel.find).toBeCalledWith({
        postId: { $in: [postId] },
        repostOwnerId: userId,
      });

      expect(PostLikeModel.find).toBeCalledWith({
        postId: { $in: [postId] },
        userId,
      });

      expect(BookmarkedPostModel.find).toBeCalledWith({
        postId: { $in: [postId] },
        bookmarkOwnerId: userId,
      });

      expect(PostStatsModel.find).toBeCalledWith({
        postId: { $in: [postId] },
        userId,
      });

      expect(Object.keys(result)).toEqual([postId]);
      assertLoggedInUserState(result[postId]);

      expect(result[postId]).toEqual({
        isReposted: true,
        isLiked: true,
        isBookmarked: true,
        ...postStats,
      });
    });

    it("should return proper action states for the logged-in user for multiple posts", async () => {
      const [postId1, postId2, postId3] = [getMongoId(), getMongoId(), getMongoId()];
      const [postStats1, postStats2] = [getPostsStats(), getPostsStats()];

      (RepostModel.find().exec as jest.Mock).mockReturnValueOnce([
        { postId: postId1 },
        { postId: postId2 },
      ]);
      (PostLikeModel.find as jest.Mock).mockReturnValueOnce([
        { postId: postId1 },
        { postId: postId2 },
      ]);
      (BookmarkedPostModel.find as jest.Mock).mockReturnValueOnce([
        { postId: postId1 },
        { postId: postId2 },
      ]);
      (PostStatsModel.find as jest.Mock).mockReturnValueOnce([
        { postId: postId1, ...postStats1 },
        { postId: postId2, ...postStats2 },
      ]);

      const result = await postUtilService.getPostLoggedInUserActionState(
        postId1,
        postId2,
        postId3
      );

      expect(asyncLocalStorage.getStore).toBeCalledTimes(1);

      expect(RepostModel.find).toBeCalledWith({
        postId: { $in: [postId1, postId2, postId3] },
        repostOwnerId: userId,
      });

      expect(PostLikeModel.find).toBeCalledWith({
        postId: { $in: [postId1, postId2, postId3] },
        userId,
      });

      expect(BookmarkedPostModel.find).toBeCalledWith({
        postId: { $in: [postId1, postId2, postId3] },
        bookmarkOwnerId: userId,
      });

      expect(PostStatsModel.find).toBeCalledWith({
        postId: { $in: [postId1, postId2, postId3] },
        userId,
      });

      expect(Object.keys(result)).toEqual([postId1, postId2, postId3]);

      expect(result[postId1]).toEqual({
        isReposted: true,
        isLiked: true,
        isBookmarked: true,
        ...postStats1,
      });

      expect(result[postId2]).toEqual({
        isReposted: true,
        isLiked: true,
        isBookmarked: true,
        ...postStats2,
      });

      expect(result[postId3]).toEqual({
        ...loggedInUserActionDefaultState,
        isReposted: false,
        isLiked: false,
        isBookmarked: false,
      });

      Object.values(result).forEach(assertLoggedInUserState);
    });

    it("should return default action states for the logged-in user if the user is not logged in", async () => {
      const postId = getMongoId();
      (asyncLocalStorage.getStore as jest.Mock).mockReset();
      (asyncLocalStorage.getStore as jest.Mock).mockReturnValueOnce({});
      const result = await postUtilService.getPostLoggedInUserActionState(postId);

      expect(asyncLocalStorage.getStore).toBeCalledTimes(1);

      expect(RepostModel.find).not.toBeCalled();
      expect(PostLikeModel.find).not.toBeCalled();
      expect(BookmarkedPostModel.find).not.toBeCalled();
      expect(PostStatsModel.find).not.toBeCalled();

      expect(Object.keys(result)).toEqual([postId]);
      assertLoggedInUserState(result[postId]);
      expect(result[postId]).toEqual(loggedInUserActionDefaultState);
    });

    it("should return default action states for the logged-in user if the user is not logged in for multiple posts", async () => {
      const [postId1, postId2, postId3] = [getMongoId(), getMongoId(), getMongoId()];
      (asyncLocalStorage.getStore as jest.Mock).mockReset();
      (asyncLocalStorage.getStore as jest.Mock).mockReturnValueOnce({});
      const result = await postUtilService.getPostLoggedInUserActionState(
        postId1,
        postId2,
        postId3
      );

      expect(asyncLocalStorage.getStore).toBeCalledTimes(1);

      expect(RepostModel.find).not.toBeCalled();
      expect(PostLikeModel.find).not.toBeCalled();
      expect(BookmarkedPostModel.find).not.toBeCalled();
      expect(PostStatsModel.find).not.toBeCalled();

      expect(Object.keys(result)).toEqual([postId1, postId2, postId3]);

      expect(result[postId1]).toEqual(loggedInUserActionDefaultState);
      expect(result[postId2]).toEqual(loggedInUserActionDefaultState);
      expect(result[postId3]).toEqual(loggedInUserActionDefaultState);
      Object.values(result).forEach(assertLoggedInUserState);
    });

    it("should return an empty object if no post IDs are provided", async () => {
      const result = await postUtilService.getPostLoggedInUserActionState();
      expect(result).toEqual({});
    });

    it("should return default states for non-existent posts", async () => {
      const postId = getMongoId();
      (RepostModel.find().exec as jest.Mock).mockReturnValueOnce([]);
      (PostLikeModel.find as jest.Mock).mockReturnValueOnce([]);
      (BookmarkedPostModel.find as jest.Mock).mockReturnValueOnce([]);
      (PostStatsModel.find as jest.Mock).mockReturnValueOnce([]);

      const result = await postUtilService.getPostLoggedInUserActionState(postId);
      expect(result[postId]).toEqual(loggedInUserActionDefaultState);
    });

    it("should handle duplicate post IDs properly", async () => {
      const postId = getMongoId();

      (RepostModel.find().exec as jest.Mock).mockReturnValueOnce([]);
      (PostLikeModel.find as jest.Mock).mockReturnValueOnce([]);
      (BookmarkedPostModel.find as jest.Mock).mockReturnValueOnce([]);
      (PostStatsModel.find as jest.Mock).mockReturnValueOnce([]);

      const result = await postUtilService.getPostLoggedInUserActionState(postId, postId);
      const resultNumKeys = Object.keys(result).length;
      expect(resultNumKeys).toEqual(1);
    });
  });

  describe("populateRepostedBy", () => {
    it("should populate repostedBy", () => {
      const expected = {
        path: "repostedBy",
        select: {
          _id: 1,
          username: 1,
          fullname: 1,
          imgUrl: 1,
          isVerified: 1,
          isAdmin: 1,
          bio: 1,
          followersCount: 1,
          followingCount: 1,
        },
      };

      const result = postUtilService.populateRepostedBy();

      expect(result).toEqual(expected);
    });
  });
});
