/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Reply } from "../../../../shared/types/post.interface";
import { assertPost, assertQuotedPost } from "../../Services/Test/TestAssertionService";
import { connectToTestDB, disconnectFromTestDB } from "../../Services/Test/TestDBService";
import {
  createTestPoll,
  createTestPost,
  deleteTestUser,
  getMongoId,
} from "../../Services/Test/TestUtilService";
import { PostModel } from "./PostModel";

xdescribe("PostModel: Schema", () => {
  beforeAll(async () => {
    await connectToTestDB();
  });

  afterAll(async () => {
    await PostModel.deleteMany({});
    await disconnectFromTestDB();
  });

  describe("Text", () => {
    beforeEach(async () => {
      await PostModel.deleteMany({});
    });

    it("Should trim the text field.", async () => {
      const body = { text: "  This is a test post.  " };
      const post = await createTestPost({ body });

      expect(post.text).toBe("This is a test post.");
    });
  });

  describe("Images", () => {
    beforeEach(async () => {
      await PostModel.deleteMany({});
    });

    it("Should limit image array to 4 elements.", async () => {
      const body = {
        imgs: Array.from({ length: 5 }, (_, i) => ({
          url: "https://www.google.com",
          sortOrder: i,
        })),
      };

      await expect(createTestPost({ body })).rejects.toThrow(
        "Post must have no more than 4 images."
      );
    });

    it("Should throw an error if url is falsey", async () => {
      const body = {
        imgs: [{ url: "", sortOrder: 1 }],
      };

      await expect(createTestPost({ body })).rejects.toThrow("Image url is required");
    });
  });

  describe("Video", () => {
    beforeEach(async () => {
      await PostModel.deleteMany({});
    });

    it("Should validate a correct YouTube URL.", async () => {
      const body = {
        videoUrl: "https://www.youtube.com/watch?v=mqIpfAsSyv0",
      };

      await expect(createTestPost({ body })).resolves.toBeDefined();
    });

    it("Should validate a correct Cloudinary URL.", async () => {
      const body = {
        videoUrl:
          "https://res.cloudinary.com/dng9sfzqt/video/upload/v1688941685/k7saf45vm2hwj25k24xh.mp4",
      };

      await expect(createTestPost({ body })).resolves.toBeDefined();
    });

    it("Should invalidate an incorrect YouTube URL.", async () => {
      const body = {
        videoUrl: "https://www.youtubee.com/watch?v=wrong",
      };

      await expect(createTestPost({ body })).rejects.toThrow();
    });

    it("Should invalidate an incorrect Cloudinary URL.", async () => {
      const body = {
        videoUrl: "https://res.cloudinary.com/dng9sfzqt/v1688941685/k7saf45vm2hwj25k24xh.mp4",
      };

      await expect(createTestPost({ body })).rejects.toThrow();
    });

    it("Should validate when URL is empty.", async () => {
      const body = {
        videoUrl: "",
      };

      await expect(createTestPost({ body })).resolves.toBeDefined();
    });

    it("Should validate when URL is null.", async () => {
      const body = {
        videoUrl: null,
      };

      await expect(createTestPost({ body })).resolves.toBeDefined();
    });

    it("Should invalidate a non-URL string.", async () => {
      const body = { videoUrl: "randomString" };

      await expect(createTestPost({ body })).rejects.toThrow();
    });

    it("Should invalidate a non-video URL.", async () => {
      const body = { videoUrl: "https://www.google.com" };

      await expect(createTestPost({ body })).rejects.toThrow();
    });

    it("should trim the videoUrl field.", async () => {
      const body = { videoUrl: "  https://www.youtube.com/watch?v=mqIpfAsSyv0  " };
      const post = await createTestPost({ body });

      expect(post.videoUrl).toBe("https://www.youtube.com/watch?v=mqIpfAsSyv0");
    });

    it("should validate a correct YouTube URL.", async () => {
      const body = { videoUrl: "https://www.youtube.com/watch?v=mqIpfAsSyv0" };
      const post = await createTestPost({ body });

      expect(post.videoUrl).toBe("https://www.youtube.com/watch?v=mqIpfAsSyv0");
    });

    it("should validate a correct Cloudinary URL.", async () => {
      const body = {
        videoUrl:
          "https://res.cloudinary.com/dng9sfzqt/video/upload/v1688941685/k7saf45vm2hwj25k24xh.mp4",
      };
      const post = await createTestPost({ body });

      expect(post.videoUrl).toBe(
        "https://res.cloudinary.com/dng9sfzqt/video/upload/v1688941685/k7saf45vm2hwj25k24xh.mp4"
      );
    });
  });

  describe("Poll", () => {
    beforeEach(async () => {
      await PostModel.deleteMany({});
    });

    it("Should validate when two poll options are provided.", async () => {
      const body = { poll: createTestPoll({}) };
      await expect(createTestPost({ body })).resolves.toBeDefined();
    });

    it("Should invalidate when less than two poll options are provided.", async () => {
      const body = { poll: createTestPoll({ options: [{ text: "Option 1" }] }) };
      await expect(createTestPost({ body })).rejects.toThrow("Poll must have at least 2 options");
    });

    it("Should invalidate when more than five poll options are provided.", async () => {
      const body = {
        poll: createTestPoll({
          options: Array.from({ length: 6 }, (_, i) => ({ text: `Option ${i + 1}` })),
        }),
      };
      await expect(createTestPost({ body })).rejects.toThrow(
        "Poll cannot have more than 5 options"
      );
    });

    it("Should validate poll length with default values.", async () => {
      const body = { poll: createTestPoll({ length: {} }) };
      const post = await createTestPost({ body });
      // needs to be stringified and parsed to get rid of mongoose getters
      const length = JSON.parse(JSON.stringify(post.poll!.length));
      expect(length).toEqual({ days: 1, hours: 0, minutes: 0 });
    });

    it("Should invalidate negative days in poll length.", async () => {
      const body = { poll: createTestPoll({ length: { days: -1 } }) };
      await expect(createTestPost({ body })).rejects.toThrow("Poll length cannot be negative");
    });

    it("Should invalidate negative hours in poll length.", async () => {
      const body = { poll: createTestPoll({ length: { hours: -1 } }) };
      await expect(createTestPost({ body })).rejects.toThrow("Poll length cannot be negative");
    });

    it("Should invalidate negative minutes in poll length.", async () => {
      const body = { poll: createTestPoll({ length: { minutes: -1 } }) };
      await expect(createTestPost({ body })).rejects.toThrow("Poll length cannot be negative");
    });

    it("Should invalidate zero length for poll.", async () => {
      const body = { poll: createTestPoll({ length: { days: 0, hours: 0, minutes: 0 } }) };
      await expect(createTestPost({ body })).rejects.toThrow("Poll length cannot be 0");
    });

    it("Should invalidate poll length greater than 7 days.", async () => {
      const body = { poll: createTestPoll({ length: { days: 8 } }) };
      await expect(createTestPost({ body })).rejects.toThrow(
        "Poll length cannot be greater than 7 days"
      );
    });
  });

  describe("Schedule", () => {
    it("Should have a valid schedule date.", async () => {
      const body = { schedule: new Date(Date.now() + 100000) };
      await expect(createTestPost({ body })).resolves.toBeDefined();
    });
  });

  describe("Location", () => {
    it("Should validate when all required location fields are provided.", async () => {
      const body = { location: { placeId: "123", name: "Test", lat: 0, lng: 0 } };
      await expect(createTestPost({ body })).resolves.toBeDefined();
    });

    it("Should invalidate when placeId is missing.", async () => {
      const body = { location: { name: "Test", lat: 0, lng: 0 } };
      await expect(createTestPost({ body })).rejects.toThrow("Place id is required");
    });
    it("Should invalidate when name is missing.", async () => {
      const body = { location: { placeId: "123", lat: 0, lng: 0 } };
      await expect(createTestPost({ body })).rejects.toThrow("Place name is required");
    });
    it("Should invalidate when lat is missing.", async () => {
      const body = { location: { placeId: "123", name: "Test", lng: 0 } };
      await expect(createTestPost({ body })).rejects.toThrow("Latitude is required");
    });
    it("Should invalidate when lng is missing.", async () => {
      const body = { location: { placeId: "123", name: "Test", lat: 0 } };
      await expect(createTestPost({ body })).rejects.toThrow("Longitude is required");
    });
  });

  describe("Created By", () => {
    it("Should require createdById.", async () => {
      const body = { createdById: null };
      await expect(createTestPost({ body })).rejects.toThrow("Post must have a createdById");
    });

    it("Should validate createdById exists in the database.", async () => {
      const id = getMongoId();
      await deleteTestUser(id);
      const body = { createdById: id };
      await expect(createTestPost({ body })).rejects.toThrow("Referenced user does not exist");
    });
  });

  describe("Quoted Post", () => {
    it("Should validate that quotedPostId exists in the database.", async () => {
      const post = await createTestPost({});
      const body = { quotedPostId: post.id };
      const quotedPost = await createTestPost({ body });
      assertPost(quotedPost);
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      assertQuotedPost(quotedPost.quotedPost!);
    });

    it("Should invalidate when quotedPostId does not exist in the database.", async () => {
      const id = getMongoId();
      await PostModel.deleteMany({});
      const body = { quotedPostId: id };
      await expect(createTestPost({ body })).rejects.toThrow("Referenced post does not exist");
    });

    it("Should pass validation when quotedPostId is not provided.", async () => {
      const body = { quotedPostId: undefined };
      await expect(createTestPost({ body })).resolves.toBeDefined();
    });
  });

  describe("Audience", () => {
    it("Should have a default audience value of 'everyone'.", async () => {
      const post = await createTestPost({});
      expect(post.audience).toBe("everyone");
    });

    it("Should validate enum values for audience.", async () => {
      const body = { audience: "wrong" };
      await expect(createTestPost({ body })).rejects.toThrow(
        "Audience must be either everyone or chirper-circle"
      );
    });
  });

  describe("Repliers Type", () => {
    it("Should have a default repliersType value of 'everyone'.", async () => {
      const post = await createTestPost({});
      expect(post.repliersType).toBe("everyone");
    });

    it("Should validate enum values for repliersType.", async () => {
      const body = { repliersType: "wrong" };
      await expect(createTestPost({ body })).rejects.toThrow(
        "Repliers type must be either everyone, followed, or mentioned"
      );
    });
  });

  describe("Previous Thread Post", () => {
    it("Should validate parentPostId exists in the database.", async () => {
      const existingPost = await createTestPost({});
      const body = { parentPostId: existingPost.id };
      const post = (await createTestPost({ body })) as Reply;
      expect(post.parentPostId?.toString()).toBe(existingPost.id);
    });

    it("Should invalidate when parentPostId does not exist.", async () => {
      const id = getMongoId();
      const body = { parentPostId: id };
      await expect(createTestPost({ body })).rejects.toThrow("Referenced post does not exist");
    });

    it("Should allow omitting parentPostId.", async () => {
      await expect(createTestPost({})).resolves.toBeDefined();
    });
  });

  describe("Default Values", () => {
    afterEach(async () => {
      await PostModel.deleteMany({});
    });

    it("Should have a default isPublic value of true.", async () => {
      const post = await createTestPost({});
      expect(post.isPublic).toBe(true);
    });

    it("Should validate the isDraft field.", async () => {
      const body = { isDraft: true };
      await expect(createTestPost({ body })).resolves.toBeDefined();
    });

    it("Should have a default isPinned value of false.", async () => {
      const post = await createTestPost({});
      expect(post.isPinned).toBe(false);
    });
  });
});
