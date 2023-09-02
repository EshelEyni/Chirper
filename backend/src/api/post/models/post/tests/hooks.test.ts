import { beforeEach } from "node:test";
import {
  connectToTestDB,
  createRepliedPostDetails,
  createRepliedPostDetailsFromPost,
  createTestGif,
  createTestPoll,
  createTestPost,
  createTestUser,
  deleteTestUser,
  disconnectFromTestDB,
  getMongoId,
} from "../../../../../services/test-util.service";
import { PostModel } from "../post.model";

describe("PostModel: Hooks", () => {
  beforeAll(async () => {
    await connectToTestDB();
  });

  afterAll(async () => {
    await PostModel.deleteMany({});
    await disconnectFromTestDB();
  });

  describe("(1) Pre save hook - content validation", () => {
    it("Should throw an error when no content (text, gif, imgs, poll, videoUrl) is provided.", async () => {
      // Text is a default in createTestPost, therefore we delete it
      await expect(createTestPost({ body: { text: undefined } })).rejects.toThrow(
        "At least one of text, gif, imgs, or poll is required"
      );
    });

    it("Should save when only text is provided.", async () => {
      const post = await createTestPost({ body: { text: "Hello world" } });
      expect(post).toBeDefined();
    });

    it("Should save when only gif is provided.", async () => {
      const post = await createTestPost({
        body: { text: undefined, gif: createTestGif() },
      });
      expect(post).toBeDefined();
    });

    it("Should save when only imgs are provided.", async () => {
      const post = await createTestPost({
        body: { text: undefined, imgs: [{ url: "https://example.com/img", sortOrder: 1 }] },
      });
      expect(post).toBeDefined();
    });

    it("Should save when only poll is provided.", async () => {
      const post = await createTestPost({
        body: { text: "Poll Question?", poll: createTestPoll({}) },
      });
      expect(post).toBeDefined();
    });

    it("Should throw an error if a poll is provided with no question in the text field.", async () => {
      await expect(
        createTestPost({ body: { text: undefined, poll: createTestPoll({}) } })
      ).rejects.toThrow("Poll must have a question in the text field");
    });

    it("Should save when only videoUrl is provided.", async () => {
      const validYoutubeUrl = "https://www.youtube.com/watch?v=6n3pFFPSlW4";
      const post = await createTestPost({
        body: { text: undefined, videoUrl: validYoutubeUrl },
      });
      expect(post).toBeDefined();
    });

    it("Should throw an error when schedule is in the past.", async () => {
      const post = createTestPost({
        body: { text: "Hello world", schedule: new Date(Date.now() - 10000) },
      });
      await expect(post).rejects.toThrow("Schedule cannot be in the past");
    });

    it("Should throw an error when both poll and schedule are provided.", async () => {
      const post = createTestPost({
        body: {
          text: "Hello world",
          poll: createTestPoll({}),
          schedule: new Date(Date.now() + 10000),
        },
      });
      await expect(post).rejects.toThrow("Post with poll cannot be scheduled");
    });

    it("Should save when schedule is in the future and no poll is provided.", async () => {
      const post = await createTestPost({
        body: { text: "Hello world", schedule: new Date(Date.now() + 10000) },
      });
      expect(post).toBeDefined();
    });
  });

  describe("(2) Pre save hook - setting isPublic property", () => {
    it("Should set isPublic to true when both schedule and isDraft are undefined.", async () => {
      const post = await createTestPost({
        body: { text: "Hello world", schedule: undefined, isDraft: undefined },
      });
      expect(post.isPublic).toBe(true);
    });

    it("Should set isPublic to false when schedule is defined.", async () => {
      const post = await createTestPost({
        body: { text: "Hello world", schedule: new Date(Date.now() + 10000) },
      });
      expect(post.isPublic).toBe(false);
    });

    it("Should set isPublic to false when isDraft is defined.", async () => {
      const post = await createTestPost({
        body: { text: "Hello world", isDraft: true },
      });
      expect(post.isPublic).toBe(false);
    });

    it("Should set isPublic to false when both schedule and isDraft are defined.", async () => {
      const post = await createTestPost({
        body: {
          text: "Hello world",
          schedule: new Date(Date.now() + 10000),
          isDraft: true,
        },
      });
      expect(post.isPublic).toBe(false);
    });
  });

  describe("(3) Pre save hook - trimming videoUrl from text", () => {
    it("Should not trim text if text is not present.", async () => {
      const post = await createTestPost({
        body: { text: undefined, videoUrl: "https://www.youtube.com/watch?v=6n3pFFPSlW4" },
      });
      expect(post.text).toBeUndefined();
    });

    it("Should trim the last occurrence of videoUrl from the text if both are present.", async () => {
      const videoUrl = "https://www.youtube.com/watch?v=6n3pFFPSlW4";
      const post = await createTestPost({
        body: { text: `Hello world ${videoUrl} ${videoUrl}`, videoUrl },
      });
      expect(post.text).toBe(`Hello world ${videoUrl}`);
    });

    it("Should not trim text if videoUrl does not occur in the text.", async () => {
      const post = await createTestPost({
        body: { text: "Hello world", videoUrl: "https://www.youtube.com/watch?v=6n3pFFPSlW4" },
      });
      expect(post.text).toBe("Hello world");
    });
  });
});
