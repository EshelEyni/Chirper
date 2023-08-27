import botPostService, { CreatePostOptions, PostType } from "../post.service";
import promptService from "../../prompt/prompt.service";
import postService from "../../../../post/services/post/post.service";
import openAIService from "../../openai/openai.service";
import youtubeService from "../../youtube/youtube.service";
import { AppError } from "../../../../../services/error/error.service";
import testUtil from "./test-util";

jest.mock("../../prompt/prompt.service");
jest.mock("../../../../post/services/post/post.service");
jest.mock("../../openai/openai.service");
jest.mock("../../../../../services/logger/logger.service");
jest.mock("../../youtube/youtube.service");

const {
  TEST_BOT_ID,
  SAMPLE_PROMPT,
  SAMPLE_POST_TEXT,
  SAMPLE_SONG_NAME,
  SAMPLE_SONG_REVIEW,
  SAMPLE_VIDEO_URL,
} = testUtil.constants;

describe("Bot Post Service:  createPost", () => {
  function getPostCreateOptions(options?: Partial<CreatePostOptions>): CreatePostOptions {
    return { postType: PostType.TEXT, ...options };
  }

  beforeEach(() => {
    testUtil.MockSetter.setCoreMocks();
  });

  describe("core", () => {
    it("should throw an error if botId is falsey", async () => {
      await expect(botPostService.createPost("", {} as any)).rejects.toThrow("botId is falsey");
    });

    it("should throw AppError for unknown post type", async () => {
      const options = getPostCreateOptions({ postType: "unknown" } as any);

      await expect(botPostService.createPost(TEST_BOT_ID, options)).rejects.toThrow(AppError);
    });

    it("should handle multiple posts", async () => {
      const numOfPosts = 3;
      const options = getPostCreateOptions({ numOfPosts });
      const result = await botPostService.createPost(TEST_BOT_ID, options);

      expect(promptService.getBotPrompt).toHaveBeenCalledWith(TEST_BOT_ID, PostType.TEXT);
      expect(openAIService.getTextFromOpenAI).toHaveBeenCalledWith(SAMPLE_PROMPT);
      expect(postService.add).toHaveBeenCalledWith(
        expect.objectContaining({
          createdById: TEST_BOT_ID,
          text: SAMPLE_POST_TEXT,
        })
      );
      expect(promptService.getBotPrompt).toHaveBeenCalledTimes(numOfPosts);
      expect(openAIService.getTextFromOpenAI).toHaveBeenCalledTimes(numOfPosts);
      expect(postService.add).toHaveBeenCalledTimes(numOfPosts);

      const posts = result;

      expect(Array.isArray(result)).toBe(true);
      expect(posts.length).toBe(numOfPosts);
    });

    it("should handle scheduling", async () => {
      const options = getPostCreateOptions({ schedule: new Date() });

      const result = await botPostService.createPost(TEST_BOT_ID, options);

      expect(promptService.getBotPrompt).toHaveBeenCalledWith(TEST_BOT_ID, PostType.TEXT);
      expect(openAIService.getTextFromOpenAI).toHaveBeenCalledWith(SAMPLE_PROMPT);
      expect(postService.add).toHaveBeenCalledWith(
        expect.objectContaining({
          createdById: TEST_BOT_ID,
          text: SAMPLE_POST_TEXT,
          schedule: expect.any(Date),
        })
      );

      expect(Array.isArray(result)).toBe(true);
      const [post] = result;
      expect(post.schedule).toBeDefined();
    });
  });

  describe("text post type", () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it("should handle text post type", async () => {
      const options = getPostCreateOptions();
      const result = await botPostService.createPost(TEST_BOT_ID, options);

      expect(promptService.getBotPrompt).toHaveBeenCalledWith(TEST_BOT_ID, PostType.TEXT);
      expect(openAIService.getTextFromOpenAI).toHaveBeenCalledWith(SAMPLE_PROMPT);
      expect(postService.add).toHaveBeenCalledWith(
        expect.objectContaining({
          createdById: TEST_BOT_ID,
          text: SAMPLE_POST_TEXT,
        })
      );

      expect(Array.isArray(result)).toBe(true);
      const [post] = result;

      expect(post.text).toBeDefined();
    });

    it("should handle text post type with prompt", async () => {
      const options = getPostCreateOptions({ prompt: "prompt from request" });

      const result = await botPostService.createPost(TEST_BOT_ID, options);

      expect(promptService.getBotPrompt).not.toHaveBeenCalled();
      expect(openAIService.getTextFromOpenAI).toHaveBeenCalledWith("prompt from request");
      expect(postService.add).toHaveBeenCalledWith(
        expect.objectContaining({
          createdById: TEST_BOT_ID,
          text: SAMPLE_POST_TEXT,
        })
      );
      expect(Array.isArray(result)).toBe(true);
      const [post] = result;

      expect(post.text).toBeDefined();
    });

    it("should throw an error if prompt is not defined or found", async () => {
      const options = getPostCreateOptions({ prompt: undefined });
      testUtil.MockSetter.getBotPrompt(null);
      await expect(botPostService.createPost(TEST_BOT_ID, options)).rejects.toThrow(
        "prompt is falsey"
      );
      testUtil.MockSetter.getBotPrompt(SAMPLE_PROMPT);
    });

    it("should throw an error if text is falsey", async () => {
      const options = getPostCreateOptions({ prompt: "prompt from request" });
      openAIService.getTextFromOpenAI = jest.fn().mockResolvedValueOnce(undefined);
      await expect(botPostService.createPost(TEST_BOT_ID, options)).rejects.toThrow(
        "text is undefined"
      );
    });
  });

  describe("poll post type", () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it("should handle poll post type", async () => {
      const options = getPostCreateOptions({ postType: PostType.POLL });

      const result = await botPostService.createPost(TEST_BOT_ID, options);

      expect(promptService.getBotPrompt).toHaveBeenCalledWith(TEST_BOT_ID, PostType.POLL);
      expect(openAIService.getAndSetPostPollFromOpenAI).toHaveBeenCalledWith(SAMPLE_PROMPT);
      expect(postService.add).toHaveBeenCalledWith(
        expect.objectContaining({
          createdById: TEST_BOT_ID,
          text: "Sample poll text",
          poll: expect.objectContaining({
            options: expect.arrayContaining([expect.any(String)]),
          }),
        })
      );

      expect(Array.isArray(result)).toBe(true);
      const [post] = result;

      expect(post.text).toBeDefined();
      expect(post.poll).toBeDefined();
    });

    it("should handle poll post type with prompt", async () => {
      const prompt = "prompt from request";
      const options = getPostCreateOptions({ postType: PostType.POLL, prompt });

      const result = await botPostService.createPost(TEST_BOT_ID, options);

      expect(openAIService.getAndSetPostPollFromOpenAI).toHaveBeenCalledWith(prompt);
      expect(promptService.getBotPrompt).not.toHaveBeenCalled();
      expect(postService.add).toHaveBeenCalledWith(
        expect.objectContaining({
          createdById: TEST_BOT_ID,
          text: "Sample poll text",
          poll: expect.objectContaining({
            options: expect.arrayContaining([expect.any(String)]),
          }),
        })
      );

      expect(Array.isArray(result)).toBe(true);
      const [post] = result;

      expect(post.text).toBeDefined();
      expect(post.poll).toBeDefined();
    });
  });

  describe("image post type", () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it("should handle image post type", async () => {
      const options = getPostCreateOptions({
        postType: PostType.IMAGE,
      });

      const result = await botPostService.createPost(TEST_BOT_ID, options);

      expect(promptService.getBotPrompt).toHaveBeenCalledWith(TEST_BOT_ID, PostType.IMAGE);
      expect(openAIService.getImgsFromOpenOpenAI).toHaveBeenCalledWith(SAMPLE_PROMPT, 1);

      expect(postService.add).toHaveBeenCalledWith(
        expect.objectContaining({
          createdById: TEST_BOT_ID,
          imgs: expect.any(Array),
        })
      );

      expect(Array.isArray(result)).toBe(true);
      const [post] = result;
      expect(post.imgs).toBeDefined();
      expect(Array.isArray(post.imgs)).toBe(true);
    });

    it("should handle image post type with prompt", async () => {
      const options = getPostCreateOptions({
        postType: PostType.IMAGE,
        prompt: "prompt from request",
      });

      const result = await botPostService.createPost(TEST_BOT_ID, options);

      expect(promptService.getBotPrompt).not.toHaveBeenCalled();
      expect(openAIService.getImgsFromOpenOpenAI).toHaveBeenCalledWith("prompt from request", 1);

      expect(postService.add).toHaveBeenCalledWith(
        expect.objectContaining({
          createdById: TEST_BOT_ID,
          imgs: expect.any(Array),
        })
      );

      expect(Array.isArray(result)).toBe(true);
      const [post] = result;
      expect(post.imgs).toBeDefined();
      expect(Array.isArray(post.imgs)).toBe(true);
    });

    it("should handle multiple images", async () => {
      const options = getPostCreateOptions({
        postType: PostType.IMAGE,
        numberOfImages: 3,
      });

      const result = await botPostService.createPost(TEST_BOT_ID, options);

      expect(openAIService.getImgsFromOpenOpenAI).toHaveBeenCalledWith(SAMPLE_PROMPT, 3);

      expect(postService.add).toHaveBeenCalledWith(
        expect.objectContaining({
          createdById: TEST_BOT_ID,
          imgs: expect.any(Array),
        })
      );

      expect(Array.isArray(result)).toBe(true);
      const [post] = result;
      expect(post.imgs).toBeDefined();
      expect(Array.isArray(post.imgs)).toBe(true);
      expect(post.imgs.length).toBe(3);
    });

    it("should handle image post type with text", async () => {
      const options = getPostCreateOptions({
        postType: PostType.IMAGE,
        addTextToContent: true,
      });

      const result = await botPostService.createPost(TEST_BOT_ID, options);

      expect(promptService.getBotPrompt).toHaveBeenCalledWith(TEST_BOT_ID, PostType.IMAGE);
      expect(openAIService.getImgsFromOpenOpenAI).toHaveBeenCalledWith(SAMPLE_PROMPT, 1);
      expect(openAIService.getTextFromOpenAI).toHaveBeenCalledWith(SAMPLE_PROMPT);

      expect(postService.add).toHaveBeenCalledWith(
        expect.objectContaining({
          createdById: TEST_BOT_ID,
          imgs: expect.any(Array),
          text: expect.any(String),
        })
      );

      expect(Array.isArray(result)).toBe(true);
      const [post] = result;
      expect(post.imgs).toBeDefined();
      expect(Array.isArray(post.imgs)).toBe(true);
      expect(post.text).toBeDefined();
      expect(typeof post.text).toBe("string");
    });

    it("should throw an error if prompt is not defined or found", async () => {
      const options = getPostCreateOptions({
        postType: PostType.IMAGE,
        prompt: undefined,
      });

      testUtil.MockSetter.getBotPrompt(null);
      await expect(botPostService.createPost(TEST_BOT_ID, options)).rejects.toThrow(
        "prompt is falsey"
      );
      testUtil.MockSetter.getBotPrompt(SAMPLE_PROMPT);
    });

    it("should throw an error if imgs is falsey", async () => {
      const options = getPostCreateOptions({ postType: PostType.IMAGE });

      openAIService.getImgsFromOpenOpenAI = jest.fn().mockResolvedValueOnce(undefined);
      await expect(botPostService.createPost(TEST_BOT_ID, options)).rejects.toThrow(
        "imgs is undefined"
      );
    });

    it("should throw an error if imgs is empty", async () => {
      const options = getPostCreateOptions({ postType: PostType.IMAGE });

      openAIService.getImgsFromOpenOpenAI = jest.fn().mockResolvedValueOnce([]);
      await expect(botPostService.createPost(TEST_BOT_ID, options)).rejects.toThrow(
        "imgs is empty"
      );
    });

    it("should throw an error if text is falsey", async () => {
      const options = getPostCreateOptions({
        postType: PostType.IMAGE,
        addTextToContent: true,
      });

      openAIService.getTextFromOpenAI = jest.fn().mockResolvedValueOnce(undefined);
      await expect(botPostService.createPost(TEST_BOT_ID, options)).rejects.toThrow(
        "text is undefined"
      );
    });
  });

  describe("video post type", () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it("should handle video post type", async () => {
      const options = getPostCreateOptions({ postType: PostType.VIDEO });

      const result = await botPostService.createPost(TEST_BOT_ID, options);

      expect(youtubeService.getYoutubeVideo).toHaveBeenCalledWith(SAMPLE_PROMPT);
      expect(postService.add).toHaveBeenCalledWith(
        expect.objectContaining({
          createdById: TEST_BOT_ID,
          videoUrl: SAMPLE_VIDEO_URL,
        })
      );

      expect(Array.isArray(result)).toBe(true);
      const [post] = result;

      expect(post.videoUrl).toBeDefined();
    });

    it("should handle video post type with prompt", async () => {
      const options = getPostCreateOptions({
        postType: PostType.VIDEO,
        prompt: "prompt from request",
      });

      const result = await botPostService.createPost(TEST_BOT_ID, options);

      expect(promptService.getBotPrompt).not.toHaveBeenCalled();
      expect(youtubeService.getYoutubeVideo).toHaveBeenCalledWith("prompt from request");
      expect(postService.add).toHaveBeenCalledWith(
        expect.objectContaining({
          createdById: TEST_BOT_ID,
          videoUrl: SAMPLE_VIDEO_URL,
        })
      );

      expect(Array.isArray(result)).toBe(true);
      const [post] = result;

      expect(post.videoUrl).toBeDefined();
    });

    it("should handle video post type with text", async () => {
      const options = getPostCreateOptions({ postType: PostType.VIDEO, addTextToContent: true });

      const result = await botPostService.createPost(TEST_BOT_ID, options);

      expect(youtubeService.getYoutubeVideo).toHaveBeenCalledWith(SAMPLE_PROMPT);
      expect(openAIService.getTextFromOpenAI).toHaveBeenCalledWith(SAMPLE_PROMPT);
      expect(postService.add).toHaveBeenCalledWith(
        expect.objectContaining({
          createdById: TEST_BOT_ID,
          videoUrl: SAMPLE_VIDEO_URL,
          text: expect.any(String),
        })
      );

      expect(Array.isArray(result)).toBe(true);
      const [post] = result;

      expect(post.videoUrl).toBeDefined();
      expect(post.text).toBeDefined();
    });

    it("should throw an error if prompt is not defined or found", async () => {
      const options = getPostCreateOptions({ postType: PostType.VIDEO, prompt: undefined });
      testUtil.MockSetter.getBotPrompt(null);
      await expect(botPostService.createPost(TEST_BOT_ID, options)).rejects.toThrow(
        "prompt is falsey"
      );
      testUtil.MockSetter.getBotPrompt(SAMPLE_PROMPT);
    });

    it("should throw an error if videoUrl is falsey", async () => {
      const options = getPostCreateOptions({ postType: PostType.VIDEO });

      testUtil.MockSetter.getYoutubeVideo(null);
      await expect(botPostService.createPost(TEST_BOT_ID, options)).rejects.toThrow(
        "videoUrl is undefined"
      );
    });

    it("should throw an error if text is falsey", async () => {
      const options = getPostCreateOptions({ postType: PostType.VIDEO, addTextToContent: true });

      openAIService.getTextFromOpenAI = jest.fn().mockResolvedValueOnce(undefined);
      await expect(botPostService.createPost(TEST_BOT_ID, options)).rejects.toThrow(
        "text is undefined"
      );
    });
  });

  describe("song-review post type", () => {
    beforeEach(() => {
      testUtil.MockSetter.getSongReviewFromOpenAI();
    });

    afterAll(() => {
      testUtil.MockSetter.getTextFromOpenAI();
    });

    it("should handle song-review post type", async () => {
      const options = getPostCreateOptions({ postType: PostType.SONG_REVIEW });

      const result = await botPostService.createPost(TEST_BOT_ID, options);

      expect(promptService.getBotPrompt).toHaveBeenCalledWith(TEST_BOT_ID, PostType.SONG_REVIEW);
      expect(youtubeService.getYoutubeVideo).toHaveBeenCalledWith(SAMPLE_SONG_NAME);
      expect(openAIService.getTextFromOpenAI).toHaveBeenCalledWith(SAMPLE_PROMPT, "gpt-4");

      expect(postService.add).toHaveBeenCalledWith(
        expect.objectContaining({
          createdById: TEST_BOT_ID,
          videoUrl: SAMPLE_VIDEO_URL,
          text: SAMPLE_SONG_REVIEW,
        })
      );

      const [post] = result;

      expect(post.videoUrl).toBeDefined();
      expect(typeof post.videoUrl).toBe("string");
      expect(post.text).toBeDefined();
      expect(typeof post.text).toBe("string");
    });

    it("should handle song-review post type with prompt", async () => {
      const options = getPostCreateOptions({
        postType: PostType.SONG_REVIEW,
        prompt: "prompt from request",
      });

      const result = await botPostService.createPost(TEST_BOT_ID, options);

      expect(promptService.getBotPrompt).not.toHaveBeenCalled();
      expect(youtubeService.getYoutubeVideo).toHaveBeenCalledWith(SAMPLE_SONG_NAME);
      expect(openAIService.getTextFromOpenAI).toHaveBeenCalledWith("prompt from request", "gpt-4");

      expect(postService.add).toHaveBeenCalledWith(
        expect.objectContaining({
          createdById: TEST_BOT_ID,
          videoUrl: SAMPLE_VIDEO_URL,
          text: SAMPLE_SONG_REVIEW,
        })
      );

      const [post] = result;

      expect(post.videoUrl).toBeDefined();
      expect(typeof post.videoUrl).toBe("string");
      expect(post.text).toBeDefined();
      expect(typeof post.text).toBe("string");
    });

    it("should throw an error if prompt is not defined or found", async () => {
      const options = getPostCreateOptions({
        postType: PostType.SONG_REVIEW,
        prompt: undefined,
      });
      testUtil.MockSetter.getBotPrompt(null);
      await expect(botPostService.createPost(TEST_BOT_ID, options)).rejects.toThrow(
        "prompt is falsey"
      );
      testUtil.MockSetter.getBotPrompt(SAMPLE_PROMPT);
    });

    it("should throw an error if result from openAIService is not proper JSON", async () => {
      const options = getPostCreateOptions({ postType: PostType.SONG_REVIEW });

      /*
       * We are using getTextFromOpenAI() here instead of getSongReviewFromOpenAI()
       * because we want to mock the response from getTextFromOpenAI() to be a string
       * instead of a JSON object.
       * and both functions use the same openAIService.getTextFromOpenAI() function.
       */

      testUtil.MockSetter.getTextFromOpenAI();
      await expect(botPostService.createPost(TEST_BOT_ID, options)).rejects.toThrow(
        "Unexpected token"
      );
    });

    it("should throw an error if songName is falsey", async () => {
      const options = getPostCreateOptions({ postType: PostType.SONG_REVIEW });

      testUtil.MockSetter.getSongReviewFromOpenAI(null, SAMPLE_SONG_REVIEW);
      await expect(botPostService.createPost(TEST_BOT_ID, options)).rejects.toThrow(
        "songName is undefined"
      );
    });

    it("should throw an error if review is falsey", async () => {
      const options = getPostCreateOptions({ postType: PostType.SONG_REVIEW });

      testUtil.MockSetter.getSongReviewFromOpenAI(SAMPLE_SONG_NAME, null);
      await expect(botPostService.createPost(TEST_BOT_ID, options)).rejects.toThrow(
        "review is undefined"
      );
    });

    it("should throw an error if videoUrl is falsey", async () => {
      const options = getPostCreateOptions({ postType: PostType.SONG_REVIEW });

      testUtil.MockSetter.getYoutubeVideo(null);
      await expect(botPostService.createPost(TEST_BOT_ID, options)).rejects.toThrow(
        "videoUrl is undefined"
      );
    });
  });
});
