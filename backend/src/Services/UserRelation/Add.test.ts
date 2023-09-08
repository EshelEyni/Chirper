/* eslint-disable @typescript-eslint/no-explicit-any */
import * as mongoose from "mongoose";
import { UserRelationKind } from "../../Types/Enums";
import { UserRelationModel } from "../../Models/UserRelation/UserRelationModel";
import userRelationService from "./UserRelationService";
import { UserModel } from "../../Models/User/UserModel";
import { PostStatsModel } from "../../Models/PostStats/PostStatsModel";
import { AppError } from "../Error/ErrorService";
import { PostModel } from "../../Models/Post/PostModel";

jest.mock("mongoose");

jest.mock("../ALSService", () => ({
  getLoggedInUserIdFromReq: jest.fn(),
}));

jest.mock("../../Models/User/UserModel", () => ({
  UserModel: {
    findById: jest.fn(),
  },
}));

jest.mock("../../Models/UserRelation/UserRelationModel", () => ({
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

jest.mock("../../Models/PostStats/PostStatsModel", () => ({
  PostStatsModel: {
    findOneAndUpdate: jest.fn(),
  },
}));

jest.mock("../../Models/Post/PostModel", () => ({
  PostModel: {
    findById: jest.fn(),
  },
}));

jest.mock("../Util/UtilService", () => ({
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

  function mockPostModelGetById(value: any) {
    PostModel.findById = jest.fn().mockImplementation(() => ({
      setOptions: jest.fn().mockResolvedValue(value),
    }));
  }
  describe("add", () => {
    const mockSession = {
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      abortTransaction: jest.fn(),
      inTransaction: jest.fn().mockReturnValue(true),
      endSession: jest.fn(),
    };

    beforeEach(() => {
      (UserModel.findById as jest.Mock).mockReset();
      jest.clearAllMocks();
      (mongoose.startSession as jest.Mock).mockImplementation(() => Promise.resolve(mockSession));
    });

    describe("core", () => {
      it("should abort transaction and throw error if an error occurs", async () => {
        (UserRelationModel.create as jest.Mock).mockRejectedValueOnce(new Error("Test error"));

        await expect(
          userRelationService.add({
            fromUserId: "1",
            toUserId: "2",
            kind: UserRelationKind.Follow,
          })
        ).rejects.toThrow("Test error");
        expect(mockSession.abortTransaction).toHaveBeenCalled();
        expect(mockSession.endSession).toHaveBeenCalledTimes(1);
      });

      it("should throw error if follower is not found", async () => {
        (UserModel.findById as jest.Mock).mockResolvedValueOnce(null);

        await expect(
          userRelationService.add({
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
          userRelationService.add({
            fromUserId: "1",
            toUserId: "2",
            kind: UserRelationKind.Follow,
          })
        ).rejects.toThrow(new AppError("Target User not found", 404));
        expect(mockSession.abortTransaction).toHaveBeenCalled();
        expect(mockSession.endSession).toHaveBeenCalledTimes(1);
      });

      it("should throw an error if post is not found", async () => {
        const [mockUser, mockUser2] = [getMockUser("1"), getMockUser("2")];

        (UserModel.findById as jest.Mock)
          .mockResolvedValueOnce(mockUser)
          .mockResolvedValueOnce(mockUser2);

        mockPostModelGetById(null);

        await expect(
          userRelationService.add({
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
      it("should add follow and return updated users", async () => {
        const [mockUser, mockUser2] = [getMockUser("1"), getMockUser("2")];

        (UserModel.findById as jest.Mock).mockResolvedValueOnce(mockUser).mockResolvedValueOnce({
          ...mockUser2,
          isFollowing: true,
        });

        const result = (await userRelationService.add({
          fromUserId: "1",
          toUserId: "2",
          kind: UserRelationKind.Follow,
        })) as any;
        expect(mongoose.startSession).toHaveBeenCalled();
        expect(mockSession.startTransaction).toHaveBeenCalled();
        expect(UserRelationModel.create).toHaveBeenCalledWith(
          [
            {
              fromUserId: "1",
              toUserId: "2",
              kind: UserRelationKind.Follow,
            },
          ],
          { session: mockSession }
        );
        expect(UserModel.findById).toHaveBeenCalledTimes(2);
        expect(UserModel.findById).toHaveBeenNthCalledWith(1, "1");
        expect(UserModel.findById).toHaveBeenNthCalledWith(2, "2");
        expect(mockSession.commitTransaction).toHaveBeenCalled();
        expect(result.loggedInUser.id).toEqual(mockUser.id);
        expect(result.targetUser.id).toEqual(mockUser2.id);
        expect(result.targetUser.isFollowing).toBe(true);
        expect(mockSession.endSession).toHaveBeenCalledTimes(1);
      });

      it("should add followings and updated post stats if postId is provided", async () => {
        const [mockUser, mockUser2] = [getMockUser("1"), getMockUser("2")];
        const mockPost = {
          _id: "postId",
          createdBy: {
            ...mockUser2,
            isFollowing: true,
          },
        };

        mockPostModelGetById(mockPost);

        await userRelationService.add({
          fromUserId: "1",
          toUserId: "2",
          kind: UserRelationKind.Follow,
          postId: "postId",
        });

        expect(mongoose.startSession).toHaveBeenCalled();
        expect(mockSession.startTransaction).toHaveBeenCalled();
        expect(UserRelationModel.create).toHaveBeenCalledWith(
          [
            {
              fromUserId: "1",
              toUserId: "2",
              kind: UserRelationKind.Follow,
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
        expect(PostModel.findById).toHaveBeenCalledWith("postId");
        expect(mockSession.endSession).toHaveBeenCalledTimes(1);
      });

      it("should add follow and return updated post if postId is provided", async () => {
        const mockPost = {
          _id: "postId",
          createdBy: {
            ...getMockUser("2"),
            isFollowing: true,
          },
        };

        mockPostModelGetById(mockPost);

        const result = (await userRelationService.add({
          fromUserId: "1",
          toUserId: "2",
          kind: UserRelationKind.Follow,
          postId: "postId",
        })) as any;

        expect(result).toEqual(mockPost);
        expect(result.createdBy.isFollowing).toEqual(true);
      });
    });

    describe("Mute", () => {
      it("should add mute and return updated users", async () => {
        const [mockUser, mockUser2] = [getMockUser("1"), getMockUser("2")];

        (UserModel.findById as jest.Mock).mockResolvedValueOnce(mockUser).mockResolvedValueOnce({
          ...mockUser2,
          isMuted: true,
        });

        const result = (await userRelationService.add({
          fromUserId: "1",
          toUserId: "2",
          kind: UserRelationKind.Mute,
        })) as any;

        expect(mongoose.startSession).toHaveBeenCalled();
        expect(mockSession.startTransaction).toHaveBeenCalled();
        expect(UserRelationModel.create).toHaveBeenCalledWith(
          [
            {
              fromUserId: "1",
              toUserId: "2",
              kind: UserRelationKind.Mute,
            },
          ],
          { session: mockSession }
        );
        expect(UserModel.findById).toHaveBeenCalledTimes(2);
        expect(UserModel.findById).toHaveBeenNthCalledWith(1, "1");
        expect(UserModel.findById).toHaveBeenNthCalledWith(2, "2");
        expect(mockSession.commitTransaction).toHaveBeenCalled();
        expect(result.loggedInUser.id).toEqual(mockUser.id);
        expect(result.targetUser.id).toEqual(mockUser2.id);
        expect(result.targetUser.isMuted).toBe(true);
        expect(mockSession.endSession).toHaveBeenCalledTimes(1);
      });

      it("should add mute and updated post stats if postId is provided", async () => {
        const [mockUser, mockUser2] = [getMockUser("1"), getMockUser("2")];
        const mockPost = {
          _id: "postId",
          createdBy: {
            ...mockUser2,
            isFollowing: true,
          },
        };

        mockPostModelGetById(mockPost);

        await userRelationService.add({
          fromUserId: "1",
          toUserId: "2",
          kind: UserRelationKind.Mute,
          postId: "postId",
        });

        expect(mongoose.startSession).toHaveBeenCalled();
        expect(mockSession.startTransaction).toHaveBeenCalled();
        expect(UserRelationModel.create).toHaveBeenCalledWith(
          [
            {
              fromUserId: "1",
              toUserId: "2",
              kind: UserRelationKind.Mute,
            },
          ],
          { session: mockSession }
        );
        expect(PostStatsModel.findOneAndUpdate).toHaveBeenCalledWith(
          { postId: "postId", userId: mockUser.id },
          { isMutedFromPost: true },
          { session: mockSession, upsert: true }
        );
        expect(mockSession.commitTransaction).toHaveBeenCalled();
        expect(PostModel.findById).toHaveBeenCalledWith("postId");
        expect(mockSession.endSession).toHaveBeenCalledTimes(1);
      });

      it("should add mute and return updated user if postId is provided", async () => {
        const mockPost = {
          _id: "postId",
          createdBy: {
            ...getMockUser("2"),
            isFollowing: true,
          },
        };

        mockPostModelGetById(mockPost);

        const result = (await userRelationService.add({
          fromUserId: "1",
          toUserId: "2",
          kind: UserRelationKind.Mute,
          postId: "postId",
        })) as any;

        expect(result).toEqual(mockPost);
        expect(result.createdBy.isFollowing).toEqual(true);
        expect(mockSession.endSession).toHaveBeenCalledTimes(1);
      });
    });

    describe("Block", () => {
      it("should add block and return updated users", async () => {
        const [mockUser, mockUser2] = [getMockUser("1"), getMockUser("2")];

        (UserModel.findById as jest.Mock).mockResolvedValueOnce(mockUser).mockResolvedValueOnce({
          ...mockUser2,
          isBlocked: true,
        });

        const result = (await userRelationService.add({
          fromUserId: "1",
          toUserId: "2",
          kind: UserRelationKind.Block,
        })) as any;

        expect(mongoose.startSession).toHaveBeenCalled();
        expect(mockSession.startTransaction).toHaveBeenCalled();
        expect(UserRelationModel.create).toHaveBeenCalledWith(
          [
            {
              fromUserId: "1",
              toUserId: "2",
              kind: UserRelationKind.Block,
            },
          ],
          { session: mockSession }
        );
        expect(UserModel.findById).toHaveBeenCalledTimes(2);
        expect(UserModel.findById).toHaveBeenNthCalledWith(1, "1");
        expect(UserModel.findById).toHaveBeenNthCalledWith(2, "2");
        expect(mockSession.commitTransaction).toHaveBeenCalled();
        expect(result.loggedInUser.id).toEqual(mockUser.id);
        expect(result.targetUser.id).toEqual(mockUser2.id);
        expect(result.targetUser.isBlocked).toBe(true);
        expect(mockSession.endSession).toHaveBeenCalledTimes(1);
      });

      it("should add block and updated post stats if postId is provided", async () => {
        const [mockUser, mockUser2] = [getMockUser("1"), getMockUser("2")];
        const mockPost = {
          _id: "postId",
          createdBy: {
            ...mockUser2,
            isFollowing: true,
          },
        };

        mockPostModelGetById(mockPost);

        await userRelationService.add({
          fromUserId: "1",
          toUserId: "2",
          kind: UserRelationKind.Block,
          postId: "postId",
        });

        expect(mongoose.startSession).toHaveBeenCalled();
        expect(mockSession.startTransaction).toHaveBeenCalled();
        expect(UserRelationModel.create).toHaveBeenCalledWith(
          [
            {
              fromUserId: "1",
              toUserId: "2",
              kind: UserRelationKind.Block,
            },
          ],
          { session: mockSession }
        );
        expect(PostStatsModel.findOneAndUpdate).toHaveBeenCalledWith(
          { postId: "postId", userId: mockUser.id },
          { isBlockedFromPost: true },
          { session: mockSession, upsert: true }
        );
        expect(mockSession.commitTransaction).toHaveBeenCalled();
        expect(PostModel.findById).toHaveBeenCalledWith("postId");
        expect(mockSession.endSession).toHaveBeenCalledTimes(1);
      });

      it("should add block and return updated post if postId is provided", async () => {
        const mockPost = {
          _id: "postId",
          createdBy: {
            ...getMockUser("2"),
            isFollowing: true,
          },
        };

        mockPostModelGetById(mockPost);

        const result = (await userRelationService.add({
          fromUserId: "1",
          toUserId: "2",
          kind: UserRelationKind.Block,
          postId: "postId",
        })) as any;

        expect(result).toEqual(mockPost);
        expect(result.createdBy.isFollowing).toEqual(true);
        expect(mockSession.endSession).toHaveBeenCalledTimes(1);
      });
    });
  });
});
