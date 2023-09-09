/* eslint-disable @typescript-eslint/no-explicit-any */
import * as mongoose from "mongoose";
import { UserRelationKind } from "../../types/Enums";
import { UserRelationModel } from "../../models/userRelation/userRelationModel";
import { UserModel } from "../../models/user/userModel";
import { PostModel } from "../../models/post/postModel";
import userRelationService from "../userRelation/userRelationService";
import { AppError } from "../error/errorService";

jest.mock("mongoose");
jest.mock("../ALSService", () => ({
  getLoggedInUserIdFromReq: jest.fn(),
}));

jest.mock("../../models/user/userModel", () => ({
  UserModel: {
    findById: jest.fn(),
  },
}));

jest.mock("../../models/userRelation/userRelationModel", () => ({
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

jest.mock("../../models/postStats/postStatsModel", () => ({
  PostStatsModel: {
    findOneAndUpdate: jest.fn(),
  },
}));

jest.mock("../../models/post/postModel", () => ({
  PostModel: {
    findById: jest.fn(),
  },
}));

jest.mock("../util/utilService", () => ({
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

  describe("remove", () => {
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

    function mockPostModelGetById(value: any) {
      PostModel.findById = jest.fn().mockImplementation(() => ({
        setOptions: jest.fn().mockResolvedValue(value),
      }));
    }

    beforeEach(() => {
      jest.resetAllMocks();
      jest.clearAllMocks();
      (mongoose.startSession as jest.Mock).mockImplementation(() => Promise.resolve(mockSession));
      (UserRelationModel.findOneAndDelete as jest.Mock).mockReturnValueOnce(mockQuery);
      mockQuery.setOptions.mockResolvedValueOnce({} as any);
    });

    describe("core", () => {
      it("should abort transaction and throw error if an error occurs", async () => {
        mockQuery.setOptions.mockReset();
        (UserRelationModel.findOneAndDelete as jest.Mock).mockReturnValueOnce(mockQuery);
        mockQuery.setOptions.mockRejectedValueOnce(new Error("Test error"));

        await expect(
          userRelationService.remove({
            fromUserId: "1",
            toUserId: "2",
            kind: UserRelationKind.Follow,
          })
        ).rejects.toThrow("Test error");
        expect(mockSession.abortTransaction).toHaveBeenCalled();
        expect(mockSession.endSession).toHaveBeenCalledTimes(1);
      });

      it("should throw error if follow Linkage is not found", async () => {
        mockQuery.setOptions.mockReset();
        (UserRelationModel.findOneAndDelete as jest.Mock).mockReturnValueOnce(mockQuery);
        mockQuery.setOptions.mockResolvedValueOnce(null);

        await expect(
          userRelationService.remove({
            fromUserId: "1",
            toUserId: "2",
            kind: UserRelationKind.Follow,
          })
        ).rejects.toThrow(new AppError("You are not following this User", 404));
        expect(mockSession.abortTransaction).toHaveBeenCalled();
        expect(mockSession.endSession).toHaveBeenCalledTimes(1);
      });

      it("should throw error if follower is not found", async () => {
        (UserModel.findById as jest.Mock).mockResolvedValueOnce(null);

        await expect(
          userRelationService.remove({
            fromUserId: "1",
            toUserId: "2",
            kind: UserRelationKind.Follow,
          })
        ).rejects.toThrow(new AppError("User not found", 404));
        expect(mockSession.abortTransaction).toHaveBeenCalled();
        expect(mockSession.endSession).toHaveBeenCalledTimes(1);
      });

      it("should throw error if following is not found", async () => {
        (UserModel.findById as jest.Mock)
          .mockResolvedValueOnce(getMockUser("1"))
          .mockResolvedValueOnce(null);

        await expect(
          userRelationService.remove({
            fromUserId: "1",
            toUserId: "2",
            kind: UserRelationKind.Follow,
          })
        ).rejects.toThrow(new AppError("Target User not found", 404));
        expect(mockSession.abortTransaction).toHaveBeenCalled();
        expect(mockSession.endSession).toHaveBeenCalledTimes(1);
      });

      it("should throw an error if post is not found", async () => {
        (UserModel.findById as jest.Mock)
          .mockResolvedValueOnce(getMockUser("1"))
          .mockResolvedValueOnce(getMockUser("2"));

        mockPostModelGetById(null);

        await expect(
          userRelationService.remove({
            fromUserId: "1",
            toUserId: "2",
            kind: UserRelationKind.Follow,
            postId: "postId",
          })
        ).rejects.toThrow(new AppError("Post not found", 404));
        expect(mockSession.abortTransaction).toHaveBeenCalled();
        expect(mockSession.endSession).toHaveBeenCalledTimes(1);
      });
    });

    describe("Follow", () => {
      it("should remove follow and return updated users", async () => {
        const [mockUser, mockUser2] = [getMockUser("1"), getMockUser("2")];

        (UserModel.findById as jest.Mock)
          .mockResolvedValueOnce(mockUser)
          .mockResolvedValueOnce(mockUser2);

        const result = (await userRelationService.remove({
          fromUserId: "1",
          toUserId: "2",
          kind: UserRelationKind.Follow,
        })) as any;
        expect(mongoose.startSession).toHaveBeenCalled();
        expect(mockSession.startTransaction).toHaveBeenCalled();
        expect(UserRelationModel.findOneAndDelete).toHaveBeenCalledWith(
          {
            fromUserId: "1",
            toUserId: "2",
            kind: UserRelationKind.Follow,
          },
          { session: mockSession }
        );
        expect(UserModel.findById).toHaveBeenCalledTimes(2);
        expect(UserModel.findById).toHaveBeenNthCalledWith(1, "1");
        expect(UserModel.findById).toHaveBeenNthCalledWith(2, "2");
        expect(mockSession.commitTransaction).toHaveBeenCalled();
        expect(result.loggedInUser.id).toEqual(mockUser.id);
        expect(result.targetUser.id).toEqual(mockUser2.id);
        expect(result.targetUser.isFollowing).toBe(false);
        expect(mockSession.endSession).toHaveBeenCalledTimes(1);
      });

      it("should remove follow and updated post stats if posId is provided", async () => {
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

        mockPostModelGetById(mockPost);

        await userRelationService.remove({
          fromUserId: "1",
          toUserId: "2",
          kind: UserRelationKind.Follow,
          postId: "postId",
        });

        expect(mongoose.startSession).toHaveBeenCalled();
        expect(mockSession.startTransaction).toHaveBeenCalled();
        expect(UserRelationModel.findOneAndDelete).toHaveBeenCalledWith(
          {
            fromUserId: "1",
            toUserId: "2",
            kind: UserRelationKind.Follow,
          },
          { session: mockSession }
        );
        expect(mockSession.commitTransaction).toHaveBeenCalled();
        expect(PostModel.findById).toHaveBeenCalledWith("postId");
        expect(mockSession.endSession).toHaveBeenCalledTimes(1);
      });

      it("should return updated post if posId is provided", async () => {
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

        mockPostModelGetById(mockPost);

        const result = (await userRelationService.remove({
          fromUserId: "1",
          toUserId: "2",
          kind: UserRelationKind.Follow,
          postId: "postId",
        })) as any;

        expect(result).toEqual(mockPost);
        expect(result.createdBy.isFollowing).toEqual(false);
      });
    });

    describe("Mute", () => {
      it("should remove Mute and return updated users", async () => {
        const [mockUser, mockUser2] = [getMockUser("1"), getMockUser("2")];

        (UserModel.findById as jest.Mock)
          .mockResolvedValueOnce(mockUser)
          .mockResolvedValueOnce(mockUser2);

        const result = (await userRelationService.remove({
          fromUserId: "1",
          toUserId: "2",
          kind: UserRelationKind.Mute,
        })) as any;
        expect(mongoose.startSession).toHaveBeenCalled();
        expect(mockSession.startTransaction).toHaveBeenCalled();
        expect(UserRelationModel.findOneAndDelete).toHaveBeenCalledWith(
          {
            fromUserId: "1",
            toUserId: "2",
            kind: UserRelationKind.Mute,
          },
          { session: mockSession }
        );
        expect(UserModel.findById).toHaveBeenCalledTimes(2);
        expect(UserModel.findById).toHaveBeenNthCalledWith(1, "1");
        expect(UserModel.findById).toHaveBeenNthCalledWith(2, "2");
        expect(mockSession.commitTransaction).toHaveBeenCalled();
        expect(result.loggedInUser.id).toEqual(mockUser.id);
        expect(result.targetUser.id).toEqual(mockUser2.id);
        expect(result.targetUser.isFollowing).toBe(false);
        expect(mockSession.endSession).toHaveBeenCalledTimes(1);
      });

      it("should remove Block and updated post stats if posId is provided", async () => {
        const [mockUser, mockUser2] = [getMockUser("1"), getMockUser("2")];
        const mockPost = {
          _id: "postId",
          createdBy: { ...mockUser2 },
        };

        (UserModel.findById as jest.Mock)
          .mockResolvedValueOnce(mockUser)
          .mockResolvedValueOnce(mockUser2);

        mockPostModelGetById(mockPost);

        await userRelationService.remove({
          fromUserId: "1",
          toUserId: "2",
          kind: UserRelationKind.Mute,
          postId: "postId",
        });

        expect(mongoose.startSession).toHaveBeenCalled();
        expect(mockSession.startTransaction).toHaveBeenCalled();
        expect(UserRelationModel.findOneAndDelete).toHaveBeenCalledWith(
          {
            fromUserId: "1",
            toUserId: "2",
            kind: UserRelationKind.Mute,
          },
          { session: mockSession }
        );
        expect(mockSession.commitTransaction).toHaveBeenCalled();
        expect(PostModel.findById).toHaveBeenCalledWith("postId");
        expect(mockSession.endSession).toHaveBeenCalledTimes(1);
      });

      it("should return updated post if posId is provided", async () => {
        const [mockUser, mockUser2] = [getMockUser("1"), getMockUser("2")];
        const mockPost = {
          _id: "postId",
          createdBy: {
            ...mockUser2,
            isBlocked: false,
          },
        };

        (UserModel.findById as jest.Mock)
          .mockResolvedValueOnce(mockUser)
          .mockResolvedValueOnce(mockUser2);

        mockPostModelGetById(mockPost);

        const result = (await userRelationService.remove({
          fromUserId: "1",
          toUserId: "2",
          kind: UserRelationKind.Mute,
          postId: "postId",
        })) as any;

        expect(result).toEqual(mockPost);
        expect(result.createdBy.isBlocked).toEqual(false);
      });
    });

    describe("Block", () => {
      it("should remove Block and return updated users", async () => {
        const [mockUser, mockUser2] = [getMockUser("1"), getMockUser("2")];

        (UserModel.findById as jest.Mock)
          .mockResolvedValueOnce(mockUser)
          .mockResolvedValueOnce(mockUser2);

        const result = (await userRelationService.remove({
          fromUserId: "1",
          toUserId: "2",
          kind: UserRelationKind.Block,
        })) as any;
        expect(mongoose.startSession).toHaveBeenCalled();
        expect(mockSession.startTransaction).toHaveBeenCalled();
        expect(UserRelationModel.findOneAndDelete).toHaveBeenCalledWith(
          {
            fromUserId: "1",
            toUserId: "2",
            kind: UserRelationKind.Block,
          },
          { session: mockSession }
        );
        expect(UserModel.findById).toHaveBeenCalledTimes(2);
        expect(UserModel.findById).toHaveBeenNthCalledWith(1, "1");
        expect(UserModel.findById).toHaveBeenNthCalledWith(2, "2");
        expect(mockSession.commitTransaction).toHaveBeenCalled();
        expect(result.loggedInUser.id).toEqual(mockUser.id);
        expect(result.targetUser.id).toEqual(mockUser2.id);
        expect(result.targetUser.isFollowing).toBe(false);
        expect(mockSession.endSession).toHaveBeenCalledTimes(1);
      });

      it("should remove Block and updated post stats if posId is provided", async () => {
        const [mockUser, mockUser2] = [getMockUser("1"), getMockUser("2")];
        const mockPost = {
          _id: "postId",
          createdBy: { ...mockUser2 },
        };

        (UserModel.findById as jest.Mock)
          .mockResolvedValueOnce(mockUser)
          .mockResolvedValueOnce(mockUser2);

        mockPostModelGetById(mockPost);

        await userRelationService.remove({
          fromUserId: "1",
          toUserId: "2",
          kind: UserRelationKind.Block,
          postId: "postId",
        });

        expect(mongoose.startSession).toHaveBeenCalled();
        expect(mockSession.startTransaction).toHaveBeenCalled();
        expect(UserRelationModel.findOneAndDelete).toHaveBeenCalledWith(
          {
            fromUserId: "1",
            toUserId: "2",
            kind: UserRelationKind.Block,
          },
          { session: mockSession }
        );
        expect(mockSession.commitTransaction).toHaveBeenCalled();
        expect(PostModel.findById).toHaveBeenCalledWith("postId");
        expect(mockSession.endSession).toHaveBeenCalledTimes(1);
      });

      it("should return updated post if posId is provided", async () => {
        const [mockUser, mockUser2] = [getMockUser("1"), getMockUser("2")];
        const mockPost = {
          _id: "postId",
          createdBy: {
            ...mockUser2,
            isBlocked: false,
          },
        };

        (UserModel.findById as jest.Mock)
          .mockResolvedValueOnce(mockUser)
          .mockResolvedValueOnce(mockUser2);

        mockPostModelGetById(mockPost);

        const result = (await userRelationService.remove({
          fromUserId: "1",
          toUserId: "2",
          kind: UserRelationKind.Block,
          postId: "postId",
        })) as any;

        expect(result).toEqual(mockPost);
        expect(result.createdBy.isBlocked).toEqual(false);
      });
    });
  });
});
