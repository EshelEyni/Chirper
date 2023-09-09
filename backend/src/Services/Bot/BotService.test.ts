import { connectToTestDB, disconnectFromTestDB } from "../../services/test/testDBService";
import { getMockedUser } from "../../services/test/testUtilService";
import botService from "./botService";
import { UserModel } from "../../models/user/userModel";

jest.mock("../../models/user/userModel", () => ({
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
