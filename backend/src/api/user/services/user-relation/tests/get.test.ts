/* eslint-disable @typescript-eslint/no-explicit-any */
import { getLoggedInUserIdFromReq } from "../../../../../services/als.service";
import { UserRelationModel } from "../../../models/user-relation/user-relation.model";
import userRelationService from "../user-relation.service";
import { isValidMongoId } from "../../../../../services/util/util.service";

jest.mock("../../../../../services/als.service", () => ({
  getLoggedInUserIdFromReq: jest.fn(),
}));

jest.mock("../../../models/user/user.model", () => ({
  UserModel: {
    findById: jest.fn(),
  },
}));

jest.mock("../../../models/user-relation/user-relation.model", () => ({
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
  UserRelationKind: {
    Follow: "Follow",
    Mute: "Mute",
    Block: "Block",
  },
}));

jest.mock("../../../../../services/util/util.service", () => ({
  isValidMongoId: jest.fn().mockReturnValue(true),
}));

describe("User Relation Service", () => {
  function getMockUser(id: string) {
    return {
      id,
      isFollowing: false,
      toObject: jest.fn().mockReturnThis(),
    };
  }

  describe("getIsFollowing", () => {
    const loggedInUserId = "1";
    const mockUser = getMockUser(loggedInUserId);
    (getLoggedInUserIdFromReq as jest.Mock).mockReturnValue(loggedInUserId);
    (isValidMongoId as jest.Mock).mockReturnValue(true);

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("should set isFollowing to false if loggedInUserId is not valid", async () => {
      (getLoggedInUserIdFromReq as jest.Mock).mockReturnValueOnce(null);
      (isValidMongoId as jest.Mock).mockReturnValueOnce(false);
      const result = await userRelationService.getIsFollowing(mockUser.id);
      expect(result).toEqual({ [mockUser.id]: false });
      expect(UserRelationModel.find).not.toHaveBeenCalled();
    });

    it("should return correct isFollowing status when loggedInUserId is valid and followers are found", async () => {
      const mockFollowerData = [{ toUserId: mockUser.id }];

      (getLoggedInUserIdFromReq as jest.Mock).mockReturnValueOnce(loggedInUserId);

      (UserRelationModel.find().exec as jest.Mock).mockResolvedValueOnce(mockFollowerData);

      const result = await userRelationService.getIsFollowing(mockUser.id);
      expect(result).toEqual({ [mockUser.id]: true });
      expect(UserRelationModel.find).toHaveBeenCalledWith({
        fromUserId: loggedInUserId,
        toUserId: { $in: [mockUser.id] },
        kind: "Follow",
      });
    });

    it("should return false for isFollowing status when loggedInUserId is valid but no followers are found", async () => {
      (UserRelationModel.find().exec as jest.Mock).mockResolvedValueOnce([]);

      const result = await userRelationService.getIsFollowing(mockUser.id);
      expect(result).toEqual({ [mockUser.id]: false });
    });

    it("should handle multiple IDs correctly and return corresponding isFollowing status", async () => {
      const anotherUserId = "2";
      const mockFollowerData = [{ toUserId: mockUser.id }];

      (UserRelationModel.find().exec as jest.Mock).mockResolvedValueOnce(mockFollowerData);

      const result = await userRelationService.getIsFollowing(mockUser.id, anotherUserId);
      expect(result).toEqual({ [mockUser.id]: true, [anotherUserId]: false });
    });

    it("should return an empty object when called with an empty array of IDs", async () => {
      const result = await userRelationService.getIsFollowing();
      expect(result).toEqual({});
      expect(UserRelationModel.find).not.toHaveBeenCalled();
    });
  });
});
