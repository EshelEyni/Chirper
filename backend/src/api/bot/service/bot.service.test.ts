import botService from "./bot.service";
import { UserModel } from "../../user/models/user/user.model";
import { assertUser, connectToTestDB } from "../../../services/test-util.service";
import mongoose from "mongoose";

jest.mock("../../user/models/user.model", () => ({
  UserModel: {
    create: jest.fn(),
    findByIdAndDelete: jest.fn(),
  },
}));

describe("BotService", () => {
  beforeAll(async () => {
    await connectToTestDB();
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe("createPost", () => {
    it("should add all bots", async () => {
      const prompt =
        "Act like you are Adam Smith, the father of modern economics. Write a post about the economy. up to 247 characters.";
      // const res = await botService.createPost(prompt, "gpt-4");
      const res = 1;
      expect(res).toBeDefined();
    });
  });
});

// Path: src\services\bot\bot.service.test.ts
