import { UserRelationKind } from "./../../../models/user-relation/user-relation.model";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { getLoggedInUserIdFromReq } from "../../../../../services/als.service";
import { UserRelationModel } from "../../../models/user-relation/user-relation.model";
import userRelationService from "../user-relation.service";
import { isValidMongoId } from "../../../../../services/util/util.service";
import { getMongoId } from "../../../../../services/test/test-util.service";

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
  getMongoId: jest.requireActual("../../../../../services/test-util.service").getMongoId,
}));

describe("User Relation Service: Get Actions", () => {
  function getMockUser(id: string) {
    return {
      id,
      isFollowing: false,
      toObject: jest.fn().mockReturnThis(),
    };
  }

  describe("getUserRelation", () => {
    const loggedInUserId = getMongoId();
    beforeEach(() => {
      jest.clearAllMocks();
      (getLoggedInUserIdFromReq as jest.Mock).mockReturnValue(loggedInUserId);
      (isValidMongoId as jest.Mock).mockReturnValue(true);
    });

    it("should return an empty object if no IDs are provided", async () => {
      const result = await userRelationService.getUserRelation(
        [UserRelationKind.Follow],
        loggedInUserId
      );
      expect(result).toEqual({});
    });

    it("should return empty relation maps for each ID if loggedInUserId is not valid", async () => {
      (getLoggedInUserIdFromReq as jest.Mock).mockReturnValueOnce(null);
      (isValidMongoId as jest.Mock).mockReturnValueOnce(false);
      const result = await userRelationService.getUserRelation(
        [UserRelationKind.Follow],
        "",
        "1",
        "2"
      );
      expect(result).toEqual({ "1": {}, "2": {} });
    });

    it("should return correct relation statuses when multiple kinds are provided", async () => {
      const mockData = [
        { toUserId: "1", kind: "Follow" },
        { toUserId: "1", kind: "Mute" },
        { toUserId: "2", kind: "Block" },
      ];
      (UserRelationModel.find().exec as jest.Mock).mockResolvedValueOnce(mockData);
      const result = await userRelationService.getUserRelation(
        [UserRelationKind.Follow, UserRelationKind.Mute, UserRelationKind.Block],
        loggedInUserId,
        "1",
        "2"
      );

      expect(result).toEqual({
        "1": { isFollowing: true, isMuted: true, isBlocked: false },
        "2": { isBlocked: true, isFollowing: false, isMuted: false },
      });
    });

    it("should return correct relation statuses for each ID when multiple IDs are provided", async () => {
      const mockData = [
        { toUserId: "1", kind: "Follow" },
        { toUserId: "2", kind: "Block" },
      ];
      (UserRelationModel.find().exec as jest.Mock).mockResolvedValueOnce(mockData);
      const result = await userRelationService.getUserRelation(
        [UserRelationKind.Follow, UserRelationKind.Block],
        loggedInUserId,
        "1",
        "2",
        "3"
      );

      expect(result).toEqual({
        "1": { isFollowing: true, isBlocked: false, isMuted: false },
        "2": { isBlocked: true, isFollowing: false, isMuted: false },
        "3": { isBlocked: false, isFollowing: false, isMuted: false },
      });
    });
  });

  describe("getIsFollowing", () => {
    const loggedInUserId = getMongoId();
    const mockUser = getMockUser("2");
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
      const mockFollowerData = [{ toUserId: mockUser.id, kind: "Follow" }];

      (getLoggedInUserIdFromReq as jest.Mock).mockReturnValueOnce(loggedInUserId);

      (UserRelationModel.find().exec as jest.Mock).mockResolvedValueOnce(mockFollowerData);

      const result = await userRelationService.getIsFollowing(mockUser.id);

      expect(UserRelationModel.find).toHaveBeenCalledWith({
        fromUserId: loggedInUserId,
        toUserId: { $in: [mockUser.id] },
        kind: { $in: ["Follow"] },
      });

      expect(result).toEqual({ [mockUser.id]: true });
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
