import { startSession } from "mongoose";
import { asyncLocalStorage } from "../../../../services/als.service";
import { FollowerModel } from "../../models/followers.model";
import followerService from "./follower.service";
import { UserModel } from "../../models/user.model";
import { mockDeep } from "jest-mock-extended";

const mockFollowerModel = mockDeep<typeof FollowerModel>();
const mockUserModel = mockDeep<typeof UserModel>();

jest.mock("mongoose");
jest.mock("../../../../services/als.service");
jest.doMock("../../models/user.model", () => ({ UserModel: mockUserModel }));
jest.doMock("../../models/followers.model", () => ({ FollowerModel: mockFollowerModel }));

describe("Followers Service", () => {
  const validMongoId = "507f1f77bcf86cd799439011";

  describe("populateIsFollowing", () => {
    const mockUser = {
      id: "1",
      isFollowing: false,
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("should set isFollowing to false if loggedinUserId is not valid", async () => {
      (asyncLocalStorage.getStore as jest.Mock).mockReturnValueOnce({ loggedinUserId: null });
      const result = await followerService.populateIsFollowing(mockUser as any);
      expect(result.isFollowing).toBe(false);
      expect(mockFollowerModel.exists).not.toHaveBeenCalled();
    });

    it("should set isFollowing based on FollowerModel.exists result", async () => {
      (asyncLocalStorage.getStore as jest.Mock).mockReturnValueOnce({
        loggedinUserId: validMongoId,
      });
      (mockFollowerModel.exists as jest.Mock).mockResolvedValueOnce(true);
      const result = await followerService.populateIsFollowing(mockUser as any);
      expect(result.isFollowing).toBe(true);
      expect(mockFollowerModel.exists).toHaveBeenCalledWith({
        fromUserId: validMongoId,
        toUserId: "1",
      });

      (mockFollowerModel.exists as jest.Mock).mockResolvedValueOnce(false);
      const result2 = await followerService.populateIsFollowing(mockUser as any);
      expect(result2.isFollowing).toBe(false);
      expect(mockFollowerModel.exists).toHaveBeenCalledWith({
        fromUserId: validMongoId,
        toUserId: "1",
      });
    });
  });

  xdescribe("addFollowings", () => {
    const mockSession = {
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      abortTransaction: jest.fn(),
      endSession: jest.fn(),
    };

    beforeEach(() => {
      jest.clearAllMocks();
      (startSession as jest.Mock).mockResolvedValue(mockSession);
    });

    it("should add followings and return updated users", async () => {
      const mockUser = { _id: "1", toObject: jest.fn().mockReturnThis() };
      (FollowerModel.exists as jest.Mock).mockResolvedValueOnce(true);

      (FollowerModel as unknown as jest.Mock).mockReturnValueOnce(() => ({ save: jest.fn() }));
      (UserModel.findByIdAndUpdate as jest.Mock).mockResolvedValue(mockUser);

      const result = await followerService.addFollowings(validMongoId, "2");

      expect(result).toEqual({ updatedFollower: mockUser, updatedFollowing: mockUser });
      expect(mockSession.startTransaction).toHaveBeenCalled();
      expect(mockSession.commitTransaction).toHaveBeenCalled();
      expect(mockSession.endSession).toHaveBeenCalled();
    });
  });
});
