/* eslint-disable @typescript-eslint/no-explicit-any */
import request from "supertest";
import express from "express";
import router from "./bot.router";
import { errorHandler } from "../../../services/error/error.service";

import mongoose from "mongoose";
import {
  connectToTestDB,
  createTestUser,
  deleteTestUser,
  getLoginTokenStrForTest,
  getMongoId,
} from "../../../services/test-util.service";
import { User } from "../../../../../shared/interfaces/user.interface";
import cookieParser from "cookie-parser";
import { BotPromptModel } from "../model/bot-options.model";

const app = express();
app.use(cookieParser());
app.use(express.json());
app.use(router);
app.use(errorHandler);

describe("Bot Router", () => {
  const mockedUserID = "64dd30f4937431fdad0f6d92";

  let testLoggedInUser: User, token: string;

  async function createTestBot(id: string) {
    await deleteTestUser(id);
    await BotPromptModel.deleteMany({ botId: id });

    await createTestUser({ id, isBot: true });
    const prompt =
      "Act like you are a user on Tweeter, and write a post about Jest. up to 247 charchters";

    await BotPromptModel.create({
      botId: id,
      prompt,
    });
  }

  beforeAll(async () => {
    await connectToTestDB();
    testLoggedInUser = await createTestUser({ id: mockedUserID, isAdmin: true });
    token = getLoginTokenStrForTest(testLoggedInUser.id);
  });

  afterAll(async () => {
    await deleteTestUser(testLoggedInUser.id);
    await mongoose.connection.close();
  });

  xdescribe("GET /", () => {
    it("should return 200 and a list of bots", async () => {
      const res = await request(app).get("/").set("Cookie", [token]);
      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual({
        status: "success",
        requestedAt: expect.any(String),
        results: expect.any(Number),
        data: expect.any(Array),
      });
    });
  });

  xdescribe("POST /:id", () => {
    it("should return 200 and a new post", async () => {
      const botId = getMongoId();
      await createTestBot(botId);

      const res = await request(app).post(`/${botId}`).set("Cookie", [token]);
      // .send({ schedule: new Date() });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual({
        status: "success",
        data: expect.any(Object),
      });
    });
  });
});
