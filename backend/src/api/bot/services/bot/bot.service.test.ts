import {
  connectToTestDB,
  disconnectFromTestDB,
  getMockedUser,
} from "../../../../services/test-util.service";
import botService from "./bot.service";
import { UserModel } from "../../../user/models/user/user.model";

jest.mock("../../../user/models/user/user.model", () => ({
  UserModel: {
    find: jest.fn(),
  },
}));

describe("BotService", () => {
  beforeAll(async () => {
    await connectToTestDB();
  });

  afterAll(async () => {
    await disconnectFromTestDB();
  });

  describe("Bot Service", () => {
    it("getBots", async () => {
      const mockedBots = Array(3).fill(getMockedUser({ isBot: true }));

      UserModel.find = jest.fn().mockResolvedValue(mockedBots);

      const res = await botService.getBots();

      expect(res.length).toBe(mockedBots.length);
      expect(res).toEqual(mockedBots);
    });
  });
});

// Path: src\services\bot\bot.service.test.ts
