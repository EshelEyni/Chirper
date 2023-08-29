import { asyncLocalStorage } from "../../../../services/als.service";
import { UserRelationModel } from "../../models/user-relation/user-relation.model";
import followerService from "./user-relation.service";
import { UserModel } from "../../models/user/user.model";
import postService from "../../../post/services/post/post.service";
import * as mongoose from "mongoose";
import { isValidMongoId } from "../../../../services/util/util.service";
import { PostStatsModel } from "../../../post/models/post-stats.model";
import { AppError } from "../../../../services/error/error.service";

jest.mock("../../../../services/als.service");
jest.mock("mongoose");
jest.mock("../../models/user/user.model", () => ({
  UserModel: {
    findById: jest.fn(),
  },
}));
jest.mock("../../models/follower/follower.model", () => ({
  UserRelationModel: {
    create: jest.fn(),
    findOneAndDelete: jest.fn().mockReturnValue({
      setOptions: jest.fn().mockReturnThis(),
    }),
    find: jest.fn().mockReturnValue({
      setOptions: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      exec: jest.fn(),
    }),
  },
}));
jest.mock("../../../post/models/post-stats.model", () => ({
  PostStatsModel: {
    findOneAndUpdate: jest.fn(),
  },
}));
jest.mock("../../../post/services/post/post.service");
jest.mock("../../../../services/util/util.service", () => ({
  isValidMongoId: jest.fn().mockReturnValue(true),
}));

describe("Followers Service", () => {
  function getMockUser(id: string) {
    return {
      id,
      isFollowing: false,
      toObject: jest.fn().mockReturnThis(),
    };
  }

  describe("getIsFollowing", () => {
    const mockUser = getMockUser("1");

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("should set isFollowing to false if loggedInUserId is not valid", async () => {
      (asyncLocalStorage.getStore as jest.Mock).mockReturnValueOnce({ loggedInUserId: null });
      (isValidMongoId as jest.Mock).mockReturnValueOnce(false);
      const result = await followerService.getIsFollowing(mockUser.id);
      expect(result).toEqual({ [mockUser.id]: false });
      expect(UserRelationModel.find).not.toHaveBeenCalled();
    });

    it("should return correct isFollowing status when loggedInUserId is valid and followers are found", async () => {
      const loggedInUserId = "1";
      const mockFollowerData = [{ toUserId: mockUser.id }];

      (asyncLocalStorage.getStore as jest.Mock).mockReturnValueOnce({ loggedInUserId });
      (isValidMongoId as jest.Mock).mockReturnValueOnce(true);
      (UserRelationModel.find().exec as jest.Mock).mockResolvedValueOnce(mockFollowerData);

      const result = await followerService.getIsFollowing(mockUser.id);
      expect(result).toEqual({ [mockUser.id]: true });
      expect(UserRelationModel.find).toHaveBeenCalledWith({
        fromUserId: loggedInUserId,
        toUserId: { $in: [mockUser.id] },
      });
    });

    it("should return false for isFollowing status when loggedInUserId is valid but no followers are found", async () => {
      const loggedInUserId = "1";

      (asyncLocalStorage.getStore as jest.Mock).mockReturnValueOnce({ loggedInUserId });
      (isValidMongoId as jest.Mock).mockReturnValueOnce(true);
      (UserRelationModel.find().exec as jest.Mock).mockResolvedValueOnce([]);

      const result = await followerService.getIsFollowing(mockUser.id);
      expect(result).toEqual({ [mockUser.id]: false });
    });

    it("should handle multiple IDs correctly and return corresponding isFollowing status", async () => {
      const loggedInUserId = "1";
      const anotherUserId = "2";
      const mockFollowerData = [{ toUserId: mockUser.id }];

      (asyncLocalStorage.getStore as jest.Mock).mockReturnValueOnce({ loggedInUserId });
      (isValidMongoId as jest.Mock).mockReturnValueOnce(true);
      (UserRelationModel.find().exec as jest.Mock).mockResolvedValueOnce(mockFollowerData);

      const result = await followerService.getIsFollowing(mockUser.id, anotherUserId);
      expect(result).toEqual({ [mockUser.id]: true, [anotherUserId]: false });
    });

    it("should return an empty object when called with an empty array of IDs", async () => {
      const loggedInUserId = "1";

      (asyncLocalStorage.getStore as jest.Mock).mockReturnValueOnce({ loggedInUserId });
      (isValidMongoId as jest.Mock).mockReturnValueOnce(true);

      const result = await followerService.getIsFollowing();
      expect(result).toEqual({});
      expect(UserRelationModel.find).not.toHaveBeenCalled();
    });
  });

  describe("addFollowings", () => {
    const mockSession = {
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      abortTransaction: jest.fn(),
      inTransaction: jest.fn().mockReturnValue(true),
      endSession: jest.fn(),
    };

    beforeEach(() => {
      jest.clearAllMocks();
      (mongoose.startSession as jest.Mock).mockImplementation(() => Promise.resolve(mockSession));
    });

    it("should add followings and return updated users", async () => {
      const [mockUser, mockUser2] = [getMockUser("1"), getMockUser("2")];

      (UserModel.findById as jest.Mock)
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(mockUser2);

      const result = (await followerService.add("1", "2")) as any;
      expect(mongoose.startSession).toHaveBeenCalled();
      expect(mockSession.startTransaction).toHaveBeenCalled();
      expect(UserRelationModel.create).toHaveBeenCalledWith(
        [
          {
            fromUserId: "1",
            toUserId: "2",
          },
        ],
        { session: mockSession }
      );
      expect(UserModel.findById).toHaveBeenCalledTimes(2);
      expect(UserModel.findById).toHaveBeenNthCalledWith(1, "1");
      expect(UserModel.findById).toHaveBeenNthCalledWith(2, "2");
      expect(mockSession.commitTransaction).toHaveBeenCalled();
      expect(result.loggedInUser).toEqual(mockUser);
      expect(result.followedUser).toEqual(mockUser2);
      expect(result.followedUser.isFollowing).toBe(true);
      expect(mockSession.endSession).toHaveBeenCalledTimes(1);
    });

    it("should add followings and return updated post if postId is provided", async () => {
      const [mockUser, mockUser2] = [getMockUser("1"), getMockUser("2")];
      const mockPost = {
        _id: "postId",
        createdBy: {
          ...mockUser2,
          isFollowing: true,
        },
      };

      (postService.getById as jest.Mock).mockResolvedValueOnce(mockPost);

      const result = (await followerService.add("1", "2", "postId")) as any;

      expect(mongoose.startSession).toHaveBeenCalled();
      expect(mockSession.startTransaction).toHaveBeenCalled();
      expect(UserRelationModel.create).toHaveBeenCalledWith(
        [
          {
            fromUserId: "1",
            toUserId: "2",
          },
        ],
        { session: mockSession }
      );
      expect(PostStatsModel.findOneAndUpdate).toHaveBeenCalledWith(
        { postId: "postId", userId: mockUser.id },
        { isFollowedFromPost: true },
        { session: mockSession, upsert: true }
      );
      expect(mockSession.commitTransaction).toHaveBeenCalled();
      expect(postService.getById).toHaveBeenCalledWith("postId");
      expect(result).toEqual(mockPost);
      expect(result.createdBy.isFollowing).toEqual(true);
      expect(mockSession.endSession).toHaveBeenCalledTimes(1);
    });

    it("should abort transaction and throw error if an error occurs", async () => {
      (UserRelationModel.create as jest.Mock).mockRejectedValueOnce(new Error("Test error"));

      await expect(followerService.add("1", "2")).rejects.toThrow("Test error");
      expect(mockSession.abortTransaction).toHaveBeenCalled();
      expect(mockSession.endSession).toHaveBeenCalledTimes(1);
    });

    it("should throw error if follower is not found", async () => {
      (UserModel.findById as jest.Mock).mockResolvedValueOnce(null);

      await expect(followerService.add("1", "2")).rejects.toThrow(
        new AppError("Follower not found", 404)
      );
      expect(mockSession.abortTransaction).toHaveBeenCalled();
      expect(mockSession.endSession).toHaveBeenCalledTimes(1);
    });

    it("should throw error if following is not found", async () => {
      (UserModel.findById as jest.Mock)
        .mockResolvedValueOnce(getMockUser("1"))
        .mockResolvedValueOnce(null);

      await expect(followerService.add("1", "2")).rejects.toThrow(
        new AppError("Following not found", 404)
      );
      expect(mockSession.abortTransaction).toHaveBeenCalled();
      expect(mockSession.endSession).toHaveBeenCalledTimes(1);
    });

    it("should throw an error if post is not found", async () => {
      const [mockUser, mockUser2] = [getMockUser("1"), getMockUser("2")];

      (UserModel.findById as jest.Mock)
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(mockUser2);

      (postService.getById as jest.Mock).mockResolvedValueOnce(null);

      await expect(followerService.add("1", "2", "postId")).rejects.toThrow(
        new AppError("Post not found", 404)
      );
      expect(mockSession.abortTransaction).toHaveBeenCalled();
      expect(mockSession.endSession).toHaveBeenCalledTimes(1);
    });
  });

  describe("removeFollowings", () => {
    const mockSession = {
      startTransaction: jest.fn(),
      inTransaction: jest.fn().mockReturnValue(true),
      commitTransaction: jest.fn(),
      abortTransaction: jest.fn(),
      endSession: jest.fn(),
    };

    const mockQuery = {
      setOptions: jest.fn().mockReturnThis(),
    };

    beforeEach(() => {
      jest.resetAllMocks();
      jest.clearAllMocks();
      (mongoose.startSession as jest.Mock).mockImplementation(() => Promise.resolve(mockSession));
      (UserRelationModel.findOneAndDelete as jest.Mock).mockReturnValueOnce(mockQuery);
      mockQuery.setOptions.mockResolvedValueOnce({} as any);
    });

    it("should remove followings and return updated users", async () => {
      const [mockUser, mockUser2] = [getMockUser("1"), getMockUser("2")];

      (UserModel.findById as jest.Mock)
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(mockUser2);

      const result = (await followerService.remove("1", "2")) as any;
      expect(mongoose.startSession).toHaveBeenCalled();
      expect(mockSession.startTransaction).toHaveBeenCalled();
      expect(UserRelationModel.findOneAndDelete).toHaveBeenCalledWith(
        {
          fromUserId: "1",
          toUserId: "2",
        },
        { session: mockSession }
      );
      expect(UserModel.findById).toHaveBeenCalledTimes(2);
      expect(UserModel.findById).toHaveBeenNthCalledWith(1, "1");
      expect(UserModel.findById).toHaveBeenNthCalledWith(2, "2");
      expect(mockSession.commitTransaction).toHaveBeenCalled();
      expect(result.loggedInUser).toEqual(mockUser);
      expect(result.followedUser).toEqual(mockUser2);
      expect(result.followedUser.isFollowing).toBe(false);
      expect(mockSession.endSession).toHaveBeenCalledTimes(1);
    });

    it("should remove followings and return updated post if posId is provided", async () => {
      const [mockUser, mockUser2] = [getMockUser("1"), getMockUser("2")];
      const mockPost = {
        _id: "postId",
        createdBy: {
          ...mockUser2,
          isFollowing: false,
        },
      };

      (UserModel.findById as jest.Mock)
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(mockUser2);

      (postService.getById as jest.Mock).mockResolvedValueOnce(mockPost);

      const result = (await followerService.remove("1", "2", "postId")) as any;
      expect(mongoose.startSession).toHaveBeenCalled();
      expect(mockSession.startTransaction).toHaveBeenCalled();
      expect(UserRelationModel.findOneAndDelete).toHaveBeenCalledWith(
        {
          fromUserId: "1",
          toUserId: "2",
        },
        { session: mockSession }
      );
      expect(mockSession.commitTransaction).toHaveBeenCalled();
      expect(postService.getById).toHaveBeenCalledWith("postId");
      expect(result).toEqual(mockPost);
      expect(result.createdBy.isFollowing).toEqual(false);
      expect(mockSession.endSession).toHaveBeenCalledTimes(1);
    });

    it("should abort transaction and throw error if an error occurs", async () => {
      mockQuery.setOptions.mockReset();
      (UserRelationModel.findOneAndDelete as jest.Mock).mockReturnValueOnce(mockQuery);
      mockQuery.setOptions.mockRejectedValueOnce(new Error("Test error"));

      await expect(followerService.remove("1", "2")).rejects.toThrow("Test error");
      expect(mockSession.abortTransaction).toHaveBeenCalled();
      expect(mockSession.endSession).toHaveBeenCalledTimes(1);
    });

    it("should throw error if follow Linkage is not found", async () => {
      mockQuery.setOptions.mockReset();
      (UserRelationModel.findOneAndDelete as jest.Mock).mockReturnValueOnce(mockQuery);
      mockQuery.setOptions.mockResolvedValueOnce(null);

      await expect(followerService.remove("1", "2")).rejects.toThrow(
        new AppError("You are not following this User", 404)
      );
      expect(mockSession.abortTransaction).toHaveBeenCalled();
      expect(mockSession.endSession).toHaveBeenCalledTimes(1);
    });

    it("should throw error if follower is not found", async () => {
      (UserModel.findById as jest.Mock).mockResolvedValueOnce(null);

      await expect(followerService.remove("1", "2")).rejects.toThrow(
        new AppError("Follower not found", 404)
      );
      expect(mockSession.abortTransaction).toHaveBeenCalled();
      expect(mockSession.endSession).toHaveBeenCalledTimes(1);
    });

    it("should throw error if following is not found", async () => {
      (UserModel.findById as jest.Mock)
        .mockResolvedValueOnce(getMockUser("1"))
        .mockResolvedValueOnce(null);

      await expect(followerService.remove("1", "2")).rejects.toThrow(
        new AppError("Following not found", 404)
      );
      expect(mockSession.abortTransaction).toHaveBeenCalled();
      expect(mockSession.endSession).toHaveBeenCalledTimes(1);
    });

    it("should throw an error if post is not found", async () => {
      (UserModel.findById as jest.Mock)
        .mockResolvedValueOnce(getMockUser("1"))
        .mockResolvedValueOnce(getMockUser("2"));

      (postService.getById as jest.Mock).mockResolvedValueOnce(null);

      await expect(followerService.remove("1", "2", "postId")).rejects.toThrow(
        new AppError("Post not found", 404)
      );
      expect(mockSession.abortTransaction).toHaveBeenCalled();
      expect(mockSession.endSession).toHaveBeenCalledTimes(1);
    });
  });
});
