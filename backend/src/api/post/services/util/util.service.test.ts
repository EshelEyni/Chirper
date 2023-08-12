import { LoggedInUserActionState, Post } from "../../../../../../shared/interfaces/post.interface";
import { asyncLocalStorage } from "../../../../services/als.service";
import { queryEntityExists } from "../../../../services/util/util.service";
import { BookmarkedPostModel } from "../../models/bookmark-post.model";
import { PostLikeModel } from "../../models/post-like.model";
import { PostStatsModel } from "../../models/post-stats.model";
import { RepostModel } from "../../models/repost.model";
import postUtilService from "./util.service";
import { Types } from "mongoose";

jest.mock("../../../../services/als.service");
jest.mock("../../../../services/util/util.service", () => ({
  ...jest.requireActual("../../../../services/util/util.service"),
  queryEntityExists: jest.fn(),
}));

jest.mock("../../models/repost.model", () => ({
  RepostModel: {},
}));

jest.mock("../../models/post-like.model", () => ({
  PostLikeModel: {},
}));

jest.mock("../../models/bookmark-post.model", () => ({
  BookmarkedPostModel: {},
}));

jest.mock("../../models/post-stats.model", () => ({
  PostStatsModel: {
    findOne: jest.fn(),
  },
}));

describe("Post Util Service", () => {
  describe("getLoggedInUserActionState", () => {
    const mockPost = { id: new Types.ObjectId().toHexString() };
    const postId = new Types.ObjectId(mockPost.id);
    const userId = new Types.ObjectId(new Types.ObjectId().toHexString());
    const defaultState: LoggedInUserActionState = {
      isLiked: false,
      isReposted: false,
      isViewed: false,
      isDetailedViewed: false,
      isProfileViewed: false,
      isFollowedFromPost: false,
      isHashTagClicked: false,
      isLinkClicked: false,
      isBookmarked: false,
      isPostLinkCopied: false,
      isPostShared: false,
      isPostSendInMessage: false,
      isPostBookmarked: false,
    };

    beforeEach(() => {
      (asyncLocalStorage.getStore as jest.Mock).mockReturnValueOnce({
        loggedInUserId: userId,
      });
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it("should return default state when isDefault is true", async () => {
      const result = await postUtilService.getLoggedInUserActionState(mockPost as Post, {
        isDefault: true,
      });
      expect(result).toEqual(defaultState);
      expect(asyncLocalStorage.getStore).toHaveBeenCalled();
    });

    it("should return default state when loggedInUserId is not valid", async () => {
      (asyncLocalStorage.getStore as jest.Mock).mockReset();
      (asyncLocalStorage.getStore as jest.Mock).mockReturnValueOnce({});
      const result = await postUtilService.getLoggedInUserActionState(mockPost as Post);
      expect(result).toEqual(defaultState);
      expect(asyncLocalStorage.getStore).toHaveBeenCalled();
    });

    it("should query the database for current user's post action state", async () => {
      await postUtilService.getLoggedInUserActionState(mockPost as Post);
      expect(asyncLocalStorage.getStore).toHaveBeenCalled();
      expect(asyncLocalStorage.getStore).toHaveBeenCalledTimes(1);
      expect(queryEntityExists).toHaveBeenCalled();
      expect(queryEntityExists).toHaveBeenCalledTimes(3);
      expect(queryEntityExists).toHaveBeenNthCalledWith(1, RepostModel, {
        postId,
        repostOwnerId: userId,
      });
      expect(queryEntityExists).toHaveBeenNthCalledWith(2, PostLikeModel, {
        postId,
        userId,
      });
      expect(queryEntityExists).toHaveBeenNthCalledWith(3, BookmarkedPostModel, {
        postId,
        bookmarkOwnerId: userId,
      });

      expect(PostStatsModel.findOne).toHaveBeenCalledWith({
        postId,
        userId,
      });
    });

    it("should return the post action state based on the data from the DB", async () => {
      const postStats = {
        isViewed: true,
        isDetailedViewed: true,
        isProfileViewed: false,
        isFollowedFromPost: false,
        isHashTagClicked: true,
        isLinkClicked: true,
        isPostLinkCopied: true,
        isPostShared: true,
        isPostSendInMessage: true,
        isPostBookmarked: true,
      };

      (queryEntityExists as jest.Mock)
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(false)
        .mockResolvedValueOnce(true);

      (PostStatsModel.findOne as jest.Mock).mockReturnValueOnce(postStats);

      const result = await postUtilService.getLoggedInUserActionState(mockPost as Post);

      expect(result).toEqual({
        ...defaultState,
        isReposted: true,
        isLiked: false,
        isBookmarked: true,
        ...postStats,
      });
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
