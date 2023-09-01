import { Post } from "../../../../../../shared/interfaces/post.interface";
import { User } from "../../../../../../shared/interfaces/user.interface";
import {
  connectToTestDB,
  createTestPoll,
  createTestPost,
  createTestUser,
  deleteTestPost,
  deleteTestUser,
  disconnectFromTestDB,
  getMongoId,
} from "../../../../services/test-util.service";
import { PostModel } from "../post/post.model";
import { PollVoteModel } from "./poll-vote.model";

jest.mock("../../../../services/als.service", () => ({
  getLoggedInUserIdFromReq: jest.fn(),
}));

/*
 * poll schema is tested in post.model.test.ts
 * this test suite only tests the poll result schema
 */

describe("Poll Result Model", () => {
  let post: Post, user: User, postId: string, userId: string;

  async function createMocks() {
    await deleteAndCreateMockUser();
    await deleteAndCreateTestPostWithPoll();
  }

  async function deleteAndCreateMockUser() {
    await deleteTestUser(user?.id);
    user = await createTestUser({});
    userId = user.id;
  }

  async function deleteAndCreateTestPostWithPoll(poll?: any) {
    await deleteTestPost(post?.id);
    const body = { poll: poll || createTestPoll({}) };
    post = await createTestPost({ body });
    postId = post.id;
  }

  async function deleteAndCreateTestPostWithoutPoll() {
    await deleteTestPost(post?.id);
    post = await createTestPost({});
    postId = post.id;
  }

  async function deleteMocks() {
    await PostModel.deleteMany({});
    await deleteTestUser(user?.id);
  }

  beforeAll(async () => {
    await connectToTestDB();
    await createMocks();
  });

  afterAll(async () => {
    await deleteMocks();
    await disconnectFromTestDB();
  });

  describe("Basic Validations", () => {
    afterEach(async () => {
      await PollVoteModel.deleteMany({});
    });

    it("should save a valid poll vote", async () => {
      const optionIdx = 0;
      const pollVote = await PollVoteModel.create({ postId, optionIdx, userId });
      expect(pollVote).toBeTruthy();
      expect(pollVote.postId.toString()).toEqual(postId);
      expect(pollVote.optionIdx).toEqual(optionIdx);
      expect(pollVote.userId.toString()).toEqual(userId);
    });

    it("should not save a poll vote without a postId", () => {
      const optionIdx = 0;
      const pollVote = PollVoteModel.create({ optionIdx, userId });
      expect(pollVote).rejects.toThrow(
        "PollVote validation failed: postId: Path `postId` is required."
      );
    });

    it("should not save a poll vote without optionIdx", () => {
      const pollVote = PollVoteModel.create({ postId, userId });
      expect(pollVote).rejects.toThrow(
        "PollVote validation failed: optionIdx: Path `optionIdx` is required."
      );
    });

    it("should not save a poll vote without a userId", () => {
      const optionIdx = 0;
      const pollVote = PollVoteModel.create({ postId, optionIdx });
      expect(pollVote).rejects.toThrow(
        "PollVote validation failed: userId: Path `userId` is required."
      );
    });
  });

  describe("Unique Index", () => {
    afterEach(async () => {
      await PollVoteModel.deleteMany({});
    });

    it("should not save a poll vote with the same postId and userId", async () => {
      await createMocks();
      const optionIdx = 0;
      await PollVoteModel.create({ postId, optionIdx, userId });
      const pollVote = PollVoteModel.create({ postId, optionIdx, userId });
      await expect(pollVote).rejects.toThrow("E11000 duplicate key error collection");
    });
  });

  describe("Model Level Validation - (Pre Save Hook)", () => {
    beforeEach(async () => {
      await PollVoteModel.deleteMany({});
      await deleteMocks();
    });

    afterAll(async () => {
      await PollVoteModel.deleteMany({});
      await deleteMocks();
    });

    it("should fail if referenced postId does not exist in PostModel", async () => {
      await deleteAndCreateMockUser();
      const optionIdx = 0;
      const pollVote = PollVoteModel.create({ postId: getMongoId(), optionIdx, userId });
      await expect(pollVote).rejects.toThrow("Referenced post does not exist");
    });

    it("should fail if referenced userId does not exist in UserModel", async () => {
      await deleteAndCreateTestPostWithPoll();

      const optionIdx = 0;
      const pollVote = PollVoteModel.create({ postId, optionIdx, userId: getMongoId() });
      await expect(pollVote).rejects.toThrow("Referenced user does not exist");
    });

    it("should fail if optionIdx is negative", async () => {
      await createMocks();
      const optionIdx = -1;
      const pollVote = PollVoteModel.create({ postId, optionIdx, userId });
      await expect(pollVote).rejects.toThrow("Invalid option index");
    });

    it("should fail if optionIdx is greater than or equal to the total number of options in the poll", async () => {
      await createMocks();
      const optionIdx = post.poll!.options.length;
      const pollVote = PollVoteModel.create({ postId, optionIdx, userId });
      await expect(pollVote).rejects.toThrow("Invalid option index");
    });

    it("should fail if the referenced postId does not have a poll", async () => {
      await deleteAndCreateMockUser();
      await deleteAndCreateTestPostWithoutPoll();

      const optionIdx = 0;
      const pollVote = PollVoteModel.create({ postId, optionIdx, userId });
      await expect(pollVote).rejects.toThrow("Referenced post has no poll");
    });

    it("should not save the poll vote if the poll has expired", async () => {
      const ONE_MINUTE = 60 * 1000;
      await deleteAndCreateMockUser();
      const poll = createTestPoll({ length: { days: 0, hours: 0, minutes: 1 } });
      const postId = getMongoId();
      await PostModel.create({
        _id: postId,
        createdById: userId,
        text: "test post",
        poll,
        createdAt: new Date(Date.now() - ONE_MINUTE * 2),
      });

      const optionIdx = 0;
      const pollVote = PollVoteModel.create({ postId, optionIdx, userId });
      await expect(pollVote).rejects.toThrow("Poll has expired");
    });
  });
});
