import testUtil from "./bot-post-test-util";
import { botServiceLogger } from "../../logger/logger";
import botPostService, { PostType } from "../post.service";

jest.mock("../../prompt/prompt.service");
jest.mock("../../../../post/services/post/post.service");
jest.mock("../../openai/openai.service");
jest.mock("../../../../../services/logger/logger.service");
jest.mock("../../youtube/youtube.service");
jest.mock("../../logger/logger", () => {
  const logger = {
    create: jest.fn(),
    created: jest.fn(),
    get: jest.fn(),
    retrieve: jest.fn(),
    upload: jest.fn(),
    uploaded: jest.fn(),
    uploadError: jest.fn(),
    error: jest.fn(),
  };

  return { botServiceLogger: logger };
});

const { TEST_BOT_ID, SAMPLE_POST_TEXT } = testUtil.constants;

describe("logger", () => {
  beforeAll(() => {
    process.env.NODE_ENV = "development";
  });

  afterAll(() => {
    process.env.NODE_ENV = "test";
  });

  beforeEach(() => {
    testUtil.MockSetter.setCoreMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should handle logger for single post", async () => {
    const options = testUtil.getPostCreateOptions();
    await botPostService.createPost(TEST_BOT_ID, options);

    expect(botServiceLogger.create).toHaveBeenCalledWith({ entity: "posts" });
    expect(botServiceLogger.create).toHaveBeenNthCalledWith(2, {
      entity: "post",
      iterationNum: 0,
    });

    expect(botServiceLogger.get).toBeCalledWith("prompt");
    expect(botServiceLogger.retrieve).toBeCalledWith("prompt");

    expect(botServiceLogger.created).toHaveBeenCalledWith({
      entity: "post",
      iterationNum: 0,
      post: expect.objectContaining({
        createdById: TEST_BOT_ID,
        text: SAMPLE_POST_TEXT,
      }),
    });

    expect(botServiceLogger.created).toHaveBeenCalledWith({ entity: "posts" });
  });

  it("should handle logger for multiple posts", async () => {
    const numOfPosts = 3;
    const options = testUtil.getPostCreateOptions({ numOfPosts });
    await botPostService.createPost(TEST_BOT_ID, options);

    expect(botServiceLogger.create).toHaveBeenCalledWith({ entity: "posts" });

    for (let i = 0; i < numOfPosts; i++) {
      expect(botServiceLogger.get).toBeCalledWith("prompt");
      expect(botServiceLogger.retrieve).toBeCalledWith("prompt");

      expect(botServiceLogger.create).toHaveBeenNthCalledWith(i + 2, {
        entity: "post",
        iterationNum: i,
      });

      expect(botServiceLogger.created).toHaveBeenNthCalledWith(i + 1, {
        entity: "post",
        iterationNum: i,
        post: expect.objectContaining({
          createdById: TEST_BOT_ID,
          text: SAMPLE_POST_TEXT,
        }),
      });
    }
    expect(botServiceLogger.created).toHaveBeenCalledWith({ entity: "posts" });
  });

  it("should handle logger for text post type", async () => {
    const options = testUtil.getPostCreateOptions();
    await botPostService.createPost(TEST_BOT_ID, options);

    expect(botServiceLogger.get).toBeCalledWith("text");
    expect(botServiceLogger.retrieve).toBeCalledWith("text");
  });

  it("should handle logger for image post type", async () => {
    const options = testUtil.getPostCreateOptions({ postType: PostType.IMAGE });
    await botPostService.createPost(TEST_BOT_ID, options);

    expect(botServiceLogger.get).toBeCalledWith("imgs");
    expect(botServiceLogger.retrieve).toBeCalledWith("imgs");
  });

  it("should handle logger for poll post type", async () => {
    const options = testUtil.getPostCreateOptions({ postType: PostType.POLL });
    await botPostService.createPost(TEST_BOT_ID, options);

    expect(botServiceLogger.get).toBeCalledWith("poll");
    expect(botServiceLogger.retrieve).toBeCalledWith("poll");
  });

  it("should handle logger for video post type", async () => {
    const options = testUtil.getPostCreateOptions({ postType: PostType.VIDEO });
    await botPostService.createPost(TEST_BOT_ID, options);

    expect(botServiceLogger.get).toBeCalledWith("videoUrl");
    expect(botServiceLogger.retrieve).toBeCalledWith("videoUrl");
  });

  it("should handle logger for song review post type", async () => {
    testUtil.MockSetter.getSongReviewFromOpenAI();
    const options = testUtil.getPostCreateOptions({ postType: PostType.SONG_REVIEW });
    await botPostService.createPost(TEST_BOT_ID, options);

    expect(botServiceLogger.get).toBeCalledWith("songReview");
    expect(botServiceLogger.retrieve).toBeCalledWith("songReview");

    testUtil.MockSetter.getTextFromOpenAI();
  });
});
