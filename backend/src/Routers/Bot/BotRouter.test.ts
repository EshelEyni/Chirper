/* eslint-disable @typescript-eslint/no-explicit-any */
import request from "supertest";
import express from "express";
import router from "./botRouter";
import { User } from "../../../../shared/types/user.interface";
import { errorHandler } from "../../services/error/errorService";
import {
  createTestUser,
  deleteTestUser,
  getLoginTokenStrForTest,
  getMockPost,
  getMockPromptText,
  getMongoId,
} from "../../services/test/testUtilService";
import cookieParser from "cookie-parser";
import { BotPromptModel } from "../../models/botPrompt/botPromptModel";
import {
  checkAdminAuthorization,
  checkUserAuthentication,
} from "../../middlewares/authGuards/authGuardsMiddleware";
import setupAsyncLocalStorage from "../../middlewares/setupALS/setupALSMiddleware";
import botPostService from "../../services/botPost/botPostService";
import { assertBotPrompt, assertUser } from "../../services/test/testAssertionService";
import { connectToTestDB, disconnectFromTestDB } from "../../services/test/testDBService";

jest.mock("../../services/botPost/botPostService");

const app = express();
app.use(cookieParser());
app.use(express.json());
app.all("*", setupAsyncLocalStorage);

router.use(checkUserAuthentication);
router.use(checkAdminAuthorization);

app.use(router);
app.use(errorHandler);

describe("Bot Router", () => {
  const mockedUserID = getMongoId();

  let testLoggedInUser: User, token: string;
  const [testBotId1, testBotId2] = [getMongoId(), getMongoId()];

  async function createTestBot(id: string) {
    await deleteTestUser(id);
    await BotPromptModel.deleteMany({ botId: id });

    await createTestUser({ id, isBot: true });
    const prompt = getMockPromptText();

    await BotPromptModel.create({
      botId: id,
      prompt,
    });
  }

  beforeAll(async () => {
    await connectToTestDB();
    testLoggedInUser = await createTestUser({ id: mockedUserID, isAdmin: true });
    token = getLoginTokenStrForTest(testLoggedInUser.id);

    await createTestBot(testBotId1);
    await createTestBot(testBotId2);
  });

  afterAll(async () => {
    [testBotId1, testBotId2].forEach(async id => {
      await deleteTestUser(id);
      await BotPromptModel.deleteMany({ botId: id });
    });
    await deleteTestUser(testLoggedInUser.id);
    await disconnectFromTestDB();
  });

  describe("GET /", () => {
    it("should return 200 and a list of bots", async () => {
      const res = await request(app).get("/").set("Cookie", [token]);
      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual({
        status: "success",
        requestedAt: expect.any(String),
        results: expect.any(Number),
        data: expect.any(Array),
      });

      const bots = res.body.data;

      expect(bots.length).toBeGreaterThanOrEqual(2);
      bots.forEach(assertUser);
      bots.every((bot: User) => expect(bot.isBot).toEqual(true));
    });
  });

  describe("GET /prompts", () => {
    it("should return 200 and a list of bot prompts", async () => {
      const res = await request(app).get("/prompts").set("Cookie", [token]);
      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual({
        status: "success",
        requestedAt: expect.any(String),
        results: expect.any(Number),
        data: expect.any(Array),
      });

      const bots = res.body.data;

      expect(bots.length).toBeGreaterThanOrEqual(2);
      bots.forEach(assertBotPrompt);
    });
  });

  describe("POST /:id([a-fA-F0-9]{24})", () => {
    it("should return 201 and a created bot post", async () => {
      (botPostService.createPost as jest.Mock).mockResolvedValueOnce(getMockPost({}));

      const res = await request(app).post(`/${testBotId1}`).set("Cookie", [token]);

      expect(res.statusCode).toEqual(201);
      expect(res.body).toEqual({
        status: "success",
        data: expect.any(Object),
      });
    });
  });

  describe("POST /botPrompt", () => {
    it("should return 201 and a created bot prompt", async () => {
      const res = await request(app).post(`/botPrompt`).set("Cookie", [token]).send({
        botId: testBotId1,
        prompt: getMockPromptText(),
      });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toEqual({
        status: "success",
        data: expect.any(Object),
      });

      const prompt = res.body.data;
      assertBotPrompt(prompt);
    });
  });

  describe("POST /manyBotPrompts", () => {
    it("should return 201 and a created many bot prompts", async () => {
      const res = await request(app)
        .post(`/manyBotPrompts`)
        .set("Cookie", [token])
        .send({
          botId: testBotId1,
          type: "text",
          prompts: [getMockPromptText(), getMockPromptText()],
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toEqual({
        status: "success",
        requestedAt: expect.any(String),
        results: expect.any(Number),
        data: expect.any(Array),
      });

      const prompts = res.body.data;
      expect(prompts.length).toEqual(2);
      prompts.forEach(assertBotPrompt);
    });
  });
});
