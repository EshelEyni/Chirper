import botPostService from "../post.service";
import promptService from "../../prompt/prompt.service";
import postService from "../../../../post/services/post/post.service";
import openAIService from "../../openai/openai.service";
import { botServiceLogger } from "../../logger/logger";
import testUtil from "./test-util";

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

describe("Bot Post Service: autoSaveBotPosts", () => {
  const ONE_MINUTE = 60000;

  beforeAll(() => {
    jest.useFakeTimers();
    testUtil.MockSetter.setCoreMocks();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.clearAllMocks();
  });

  it("should correctly save bot posts", async () => {
    botPostService.autoSaveBotPosts();

    await jest.advanceTimersByTimeAsync(ONE_MINUTE);

    expect(promptService.getAllPrompts).toHaveBeenCalled();
    expect(openAIService.getTextFromOpenAI).toHaveBeenCalledTimes(3);
    expect(postService.add).toHaveBeenCalledTimes(3);
  });

  it("should create posts at the rate of 3 per minute", async () => {
    botPostService.autoSaveBotPosts();
    await jest.advanceTimersByTimeAsync(ONE_MINUTE / 2); // 30 seconds
    expect(openAIService.getTextFromOpenAI).toHaveBeenCalledTimes(0);
    expect(postService.add).toHaveBeenCalledTimes(0);

    await jest.advanceTimersByTimeAsync(ONE_MINUTE / 2 + 1111); // another 30 seconds
    expect(openAIService.getTextFromOpenAI).toHaveBeenCalledTimes(3);
    expect(postService.add).toHaveBeenCalledTimes(3);
  });

  it("should save post infinitely (even when the length of the array is reached) while function is running", async () => {
    botPostService.autoSaveBotPosts();
    await jest.advanceTimersByTimeAsync(ONE_MINUTE);
    expect(promptService.getAllPrompts).toHaveBeenCalled();
    expect(openAIService.getTextFromOpenAI).toHaveBeenCalledTimes(3);
    expect(postService.add).toHaveBeenCalledTimes(3);

    await jest.advanceTimersByTimeAsync(ONE_MINUTE);
    expect(openAIService.getTextFromOpenAI).toHaveBeenCalledTimes(6);
    expect(postService.add).toHaveBeenCalledTimes(6);

    await jest.advanceTimersByTimeAsync(ONE_MINUTE);
    expect(openAIService.getTextFromOpenAI).toHaveBeenCalledTimes(9);
    expect(postService.add).toHaveBeenCalledTimes(9);
  });

  it("should handle no prompts gracefully", async () => {
    testUtil.MockSetter.getAllPrompts(null);
    await expect(botPostService.autoSaveBotPosts()).rejects.toThrow("prompts is falsey");
    expect(promptService.getAllPrompts).toHaveBeenCalled();
    expect(openAIService.getTextFromOpenAI).toHaveBeenCalledTimes(0);
    expect(postService.add).toHaveBeenCalledTimes(0);
    testUtil.MockSetter.getAllPrompts();
  });

  it("should log an error when createPost fails", async () => {
    // we are using the post Text type here because that what we used post with type Text in our mocks
    (openAIService.getTextFromOpenAI as jest.Mock).mockImplementationOnce(() => {
      throw new Error("Some error");
    });
    botPostService.autoSaveBotPosts();
    await jest.advanceTimersByTimeAsync(ONE_MINUTE);
    expect(botServiceLogger.error).toHaveBeenCalledWith("Some error");
  });
});
