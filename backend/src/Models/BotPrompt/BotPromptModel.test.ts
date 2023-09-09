/* eslint-disable @typescript-eslint/no-explicit-any */
import { connectToTestDB, disconnectFromTestDB } from "../../services/test/testDBService";
import { createTestUser, deleteTestUser, getMongoId } from "../../services/test/testUtilService";
import { BotPromptModel } from "./botPromptModel";

describe("BotPromptModel", () => {
  const botId = getMongoId();
  beforeAll(async () => {
    await connectToTestDB();
  });

  afterAll(async () => {
    await disconnectFromTestDB();
  });

  beforeEach(async () => {
    await BotPromptModel.deleteMany({});
  });

  afterEach(async () => {
    await deleteTestUser(botId);
  });

  it("should create a bot prompt successfully", async () => {
    const testBot = await createTestUser({ id: botId, isBot: true });
    const botPrompt = (await BotPromptModel.create({
      botId: testBot.id,
      prompt: "Test Prompt",
      type: "text",
    })) as any;

    expect(botPrompt.botId.toString()).toBe(testBot.id.toString());
    expect(botPrompt.prompt).toBe("Test Prompt");
    expect(botPrompt.type).toBe("text");
  });

  it("should not create a bot prompt without a botId", async () => {
    await expect(BotPromptModel.create({ prompt: "Test Prompt" })).rejects.toThrow(
      expect.objectContaining({
        name: "ValidationError",
        message: expect.stringContaining(
          "BotPrompt validation failed: botId: A bot prompt must have a bot id"
        ),
      })
    );
  });

  it("should not create a bot prompt without a valid botId", async () => {
    await expect(
      BotPromptModel.create({ botId: "invalid-bot-id", prompt: "Test Prompt" })
    ).rejects.toThrow(
      expect.objectContaining({
        name: "ValidationError",
        message: expect.stringContaining("BotPrompt validation failed: botId"),
      })
    );
  });

  it("should not create a bot prompt without a prompt", async () => {
    const testBot = await createTestUser({ isBot: true });

    await expect(BotPromptModel.create({ id: botId, botId: testBot.id })).rejects.toThrow(
      expect.objectContaining({
        name: "ValidationError",
        message: expect.stringContaining(
          "BotPrompt validation failed: prompt: A bot prompt must have a prompt"
        ),
      })
    );

    await deleteTestUser(testBot.id);
  });
});
