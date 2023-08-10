import { asyncLocalStorage } from "../../../../services/als.service";
import { FollowerModel } from "../../models/followers.model";
import followerService from "./follower.service";
import { UserModel } from "../../models/user.model";
import postService from "../../../post/post.service";
import * as mongoose from "mongoose";
import { isValidId } from "../../../../services/util/util.service";
import { PostStatsModel } from "../../../post/models/post-stats.model";
import { AppError } from "../../../../services/error/error.service";

jest.mock("../../../../services/als.service");
jest.mock("mongoose");
jest.mock("../../models/user.model", () => ({
  UserModel: {
    findByIdAndUpdate: jest.fn(),
  },
}));
jest.mock("../../models/followers.model", () => ({
  FollowerModel: {
    create: jest.fn(),
    exists: jest.fn(),
  },
}));
jest.mock("../../../post/models/post-stats.model", () => ({
  PostStatsModel: {
    findOneAndUpdate: jest.fn(),
  },
}));
jest.mock("../../../post/post.service");
jest.mock("../../../../services/util/util.service", () => ({
  isValidId: jest.fn().mockReturnValue(true),
}));

describe("Followers Service", () => {
  function getMockUser(id: string) {
    return {
      id,
      isFollowing: false,
      toObject: jest.fn().mockReturnThis(),
    };
  }
  describe("populateIsFollowing", () => {
    const mockUser = getMockUser("1");

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("should set isFollowing to false if loggedInUserId is not valid", async () => {
      (asyncLocalStorage.getStore as jest.Mock).mockReturnValueOnce({ loggedInUserId: null });
      (isValidId as jest.Mock).mockReturnValueOnce(false);
      const result = await followerService.populateIsFollowing(mockUser as any);
      expect(result.isFollowing).toBe(false);
      expect(FollowerModel.exists).not.toHaveBeenCalled();
    });

    it("should set isFollowing based on FollowerModel.exists result", async () => {
      (asyncLocalStorage.getStore as jest.Mock).mockReturnValueOnce({
        loggedInUserId: "id",
      });
      (FollowerModel.exists as jest.Mock).mockResolvedValueOnce(true);
      const result = await followerService.populateIsFollowing(mockUser as any);
      expect(FollowerModel.exists).toHaveBeenCalledWith({
        fromUserId: "id",
        toUserId: "1",
      });
      expect(result.isFollowing).toBe(true);

      (FollowerModel.exists as jest.Mock).mockResolvedValueOnce(false);
      const result2 = await followerService.populateIsFollowing(mockUser as any);
      expect(FollowerModel.exists).toHaveBeenCalledWith({
        fromUserId: "id",
        toUserId: "1",
      });
      expect(result2.isFollowing).toBe(false);
    });
  });

  fdescribe("addFollowings", () => {
    const mockSession = {
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      abortTransaction: jest.fn(),
      endSession: jest.fn(),
    };

    beforeEach(() => {
      jest.clearAllMocks();
      (mongoose.startSession as jest.Mock).mockImplementation(() => Promise.resolve(mockSession));
    });

    it("should add followings and return updated users", async () => {
      const [mockUser, mockUser2] = [getMockUser("1"), getMockUser("2")];

      (UserModel.findByIdAndUpdate as jest.Mock)
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(mockUser2);

      const result = (await followerService.addFollowings("1", "2")) as any;
      expect(mongoose.startSession).toHaveBeenCalled();
      expect(mockSession.startTransaction).toHaveBeenCalled();
      expect(FollowerModel.create).toHaveBeenCalledWith(
        [
          {
            fromUserId: "1",
            toUserId: "2",
          },
        ],
        { session: mockSession }
      );
      expect(UserModel.findByIdAndUpdate).toHaveBeenCalledTimes(2);
      expect(UserModel.findByIdAndUpdate).toHaveBeenNthCalledWith(
        1,
        "1",
        { $inc: { followingCount: 1 } },
        { new: true, session: mockSession }
      );
      expect(UserModel.findByIdAndUpdate).toHaveBeenNthCalledWith(
        2,
        "2",
        { $inc: { followersCount: 1 } },
        { new: true, session: mockSession }
      );
      expect(mockSession.commitTransaction).toHaveBeenCalled();
      expect(result.updatedFollower).toEqual(mockUser);
      expect(result.updatedFollowing).toEqual(mockUser2);
      expect(result.updatedFollowing.isFollowing).toBe(true);
      expect(result.updatedFollower.toObject).toHaveBeenCalled();
      expect(result.updatedFollowing.toObject).toHaveBeenCalled();
      expect(mockSession.endSession).toHaveBeenCalledTimes(1);
    });

    it("should add followings and return updated post if postId is provided", async () => {
      const [mockUser, mockUser2] = [getMockUser("1"), getMockUser("2")];
      const mockPost = { _id: "postId" };

      (UserModel.findByIdAndUpdate as jest.Mock)
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(mockUser2);
      (postService.getById as jest.Mock).mockResolvedValueOnce(mockPost);

      const result = await followerService.addFollowings("1", "2", "postId");

      expect(mongoose.startSession).toHaveBeenCalled();
      expect(mockSession.startTransaction).toHaveBeenCalled();
      expect(FollowerModel.create).toHaveBeenCalledWith(
        [
          {
            fromUserId: "1",
            toUserId: "2",
          },
        ],
        { session: mockSession }
      );
      expect(UserModel.findByIdAndUpdate).toHaveBeenCalledTimes(2);
      expect(UserModel.findByIdAndUpdate).toHaveBeenNthCalledWith(
        1,
        "1",
        { $inc: { followingCount: 1 } },
        { new: true, session: mockSession }
      );
      expect(UserModel.findByIdAndUpdate).toHaveBeenNthCalledWith(
        2,
        "2",
        { $inc: { followersCount: 1 } },
        { new: true, session: mockSession }
      );
      expect(PostStatsModel.findOneAndUpdate).toHaveBeenCalledWith(
        { postId: "postId", userId: mockUser.id },
        { isFollowedFromPost: true },
        { session: mockSession, upsert: true }
      );
      expect(mockSession.commitTransaction).toHaveBeenCalled();
      expect(postService.getById).toHaveBeenCalledWith("postId");
      expect(result).toEqual(mockPost);
      expect(mockSession.endSession).toHaveBeenCalledTimes(1);
    });

    it("should abort transaction and throw error if an error occurs", async () => {
      (FollowerModel.create as jest.Mock).mockRejectedValueOnce(new Error("Test error"));

      await expect(followerService.addFollowings("1", "2")).rejects.toThrow("Test error");
      expect(mockSession.abortTransaction).toHaveBeenCalled();
      expect(mockSession.endSession).toHaveBeenCalledTimes(1);
    });

    it("should throw error if follower is not found", async () => {
      (UserModel.findByIdAndUpdate as jest.Mock).mockResolvedValueOnce(null);

      await expect(followerService.addFollowings("1", "2")).rejects.toThrow(
        new AppError("Follower not found", 404)
      );
      expect(mockSession.abortTransaction).toHaveBeenCalled();
      expect(mockSession.endSession).toHaveBeenCalledTimes(1);
    });

    it("should throw error if following is not found", async () => {
      (UserModel.findByIdAndUpdate as jest.Mock)
        .mockResolvedValueOnce(getMockUser("1"))
        .mockResolvedValueOnce(null);

      await expect(followerService.addFollowings("1", "2")).rejects.toThrow(
        new AppError("Following not found", 404)
      );
      expect(mockSession.abortTransaction).toHaveBeenCalled();
      expect(mockSession.endSession).toHaveBeenCalledTimes(1);
    });

    it("should throw an error if post is not found", async () => {
      const [mockUser, mockUser2] = [getMockUser("1"), getMockUser("2")];

      (UserModel.findByIdAndUpdate as jest.Mock)
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(mockUser2);
      (postService.getById as jest.Mock).mockResolvedValueOnce(null);

      await expect(followerService.addFollowings("1", "2", "postId")).rejects.toThrow(
        new AppError("Post not found", 404)
      );
      expect(mockSession.abortTransaction).toHaveBeenCalled();
      expect(mockSession.endSession).toHaveBeenCalledTimes(1);
    });
  });
});
