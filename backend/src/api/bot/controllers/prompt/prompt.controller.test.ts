import { Request, Response } from "express";

jest.mock("../../model/bot-options.model", () => ({
  BotPromptModel: {
    create: jest.fn(),
  },
}));

import { BotPromptModel } from "../../model/bot-options.model";
import { addBotManyPrompts } from "./prompt.controller";
import { AppError } from "../../../../services/error/error.service";

describe("addBotManyPrompts function", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: jest.Mock;
  const mockBotPrompt = { botId: "123", prompt: "Test", type: "Type" };

  beforeEach(() => {
    req = {
      body: {
        botId: "123",
        prompts: ["Test prompt"],
        type: "Type",
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
    next = jest.fn();
    (BotPromptModel.create as jest.Mock).mockResolvedValue(mockBotPrompt);
  });

  it("should create bot prompts and respond with success", async () => {
    const sut = addBotManyPrompts as any;
    await sut(req as Request, res as Response, next);

    expect(BotPromptModel.create).toHaveBeenCalledWith({
      botId: req.body.botId,
      prompt: req.body.prompts[0],
      type: req.body.type,
    });

    expect(res.send).toHaveBeenCalledWith({
      status: "success",
      requestedAt: expect.any(String),
      results: 1,
      data: [mockBotPrompt],
    });
  });

  it("should throw an error if botId is missing or invalid", async () => {
    req.body.botId = null;
    const sut = addBotManyPrompts as any;
    await sut(req as Request, res as Response, next);
    expect(next).toHaveBeenCalledWith(new AppError("Invalid botId", 400));
  });

  it("should throw an error if type is missing or invalid", async () => {
    req.body.type = null;

    const sut = addBotManyPrompts as any;
    await sut(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledWith(new AppError("Invalid type", 400));
  });

  it("should throw an error if prompts are missing or invalid", async () => {
    req.body.prompts = null;

    const sut = addBotManyPrompts as any;
    await sut(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledWith(new AppError("Invalid prompts", 400));
  });
});
