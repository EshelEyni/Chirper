import { connectToTestDB, disconnectFromTestDB } from "../../Services/Test/TestDBService";
import { getMockedUser } from "../../Services/Test/TestUtilService";
import botService from "./BotService";
import { UserModel } from "../../Models/User/UserModel";

jest.mock("../../Models/User/UserModel", () => ({
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
