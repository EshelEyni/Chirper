import { assertBotPrompt, getMongoId } from "../../../../services/test-util.service";
import promptService from "./prompt.service";
import { BotPromptModel } from "../../model/bot-options.model";
import { PostType } from "../post/post.service";

const SAMPLE_PROMPT = "Some prompt";

jest.mock("../../model/bot-options.model", () => ({
  BotPromptModel: {
    countDocuments: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
  },
}));

describe("Bot Prompt Service", () => {
  beforeAll(() => {
    setAllMocks();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getAllPrompts", () => {
    it("should get all bot prompts", async () => {
      const results = await promptService.getAllPrompts();
      expect(results).toBeDefined();
      expect(results).toBeInstanceOf(Array);
      results.forEach(assertBotPrompt);
    });
  });

  describe("getBotPrompt", () => {
    const botId = getMongoId();

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("should handle failure in BotPromptModel.countDocuments", async () => {
      BotPromptModel.countDocuments = jest.fn().mockRejectedValue(new Error("some error"));

      await expect(promptService.getBotPrompt(botId, PostType.TEXT)).rejects.toThrow("some error");
      mockCountDocuments(1);
    });

    it("should throw an error if no prompt found", async () => {
      mockBotPromptFindOne(null);

      await expect(promptService.getBotPrompt(botId.toString(), PostType.TEXT)).rejects.toThrow(
        "prompt is undefined"
      );
    });

    it("should return text type prompt suffix", async () => {
      mockBotPromptFindOne(getMockPrompt());
      const result = await promptService.getBotPrompt(botId, PostType.TEXT);
      expect(BotPromptModel.countDocuments).toBeCalledTimes(1);
      expect(BotPromptModel.findOne).toBeCalledTimes(1);
      const expectResult = `${SAMPLE_PROMPT}${promptService.promptFragments.TEXT_PROMPT_SUFFIX}`;
      expect(result).toBe(expectResult);
    });

    it("should return poll type prompt with prefix and suffix", async () => {
      mockBotPromptFindOne(getMockPrompt("poll"));

      const result = await promptService.getBotPrompt(botId, PostType.POLL);

      const expectResult = `${promptService.promptFragments.POLL_PROMPT_PREFIX}${SAMPLE_PROMPT}${promptService.promptFragments.POLL_PROMPT_SUFFIX}`;
      expect(result).toBe(expectResult);
    });

    it("should return image type prompt with prefix", async () => {
      mockBotPromptFindOne(getMockPrompt("image"));

      const result = await promptService.getBotPrompt(botId, PostType.IMAGE);

      const expectResult = `${promptService.promptFragments.IMAGE_PROMPT_PREFIX}${SAMPLE_PROMPT}`;
      expect(result).toBe(expectResult);
    });

    it("should return video type prompt with prefix", async () => {
      mockBotPromptFindOne(getMockPrompt("video"));

      const result = await promptService.getBotPrompt(botId, PostType.VIDEO);

      const expectResult = `${promptService.promptFragments.VIDEO_PROMPT_PREFIX}${SAMPLE_PROMPT}`;
      expect(result).toBe(expectResult);
    });

    it("should return song-review type prompt suffix", async () => {
      mockBotPromptFindOne(getMockPrompt("song-review"));

      const result = await promptService.getBotPrompt(botId, PostType.SONG_REVIEW);

      const expectResult = `${SAMPLE_PROMPT}${promptService.promptFragments.SONG_REVIEW_PROMPT_SUFFIX}`;
      expect(result).toBe(expectResult);
    });
  });
});

function setAllMocks() {
  mockBotPromptFindOne(getMockPrompt());
  mockCountDocuments(1);
  mockBotPromptFind([getMockPrompt()]);
}

function mockBotPromptFindOne(value: any) {
  const exec = jest.fn().mockResolvedValue(value);
  const mockSkip = jest.fn().mockReturnValue({ exec });
  BotPromptModel.findOne = jest.fn().mockReturnValue({ skip: mockSkip });
}

function mockCountDocuments(value: any) {
  BotPromptModel.countDocuments = jest.fn().mockResolvedValue(value);
}

function mockBotPromptFind(value: any) {
  const mockExec = jest.fn().mockResolvedValue(value);
  const mockLean = jest.fn().mockReturnThis();
  BotPromptModel.find = jest.fn().mockImplementation(() => ({ lean: mockLean, exec: mockExec }));
}

function getMockPrompt(type = "text") {
  return {
    botId: getMongoId(),
    prompt: SAMPLE_PROMPT,
    type,
  };
}
