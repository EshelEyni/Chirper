import { Request, Response } from "express";
import { AppError, asyncErrorCatcher } from "../../../../services/error/error.service";
import { createOne, getAll } from "../../../../services/factory/factory.service";
import { BotPromptModel } from "../../model/bot-options.model";

const getBotPrompts = getAll(BotPromptModel);

const addBotPrompt = createOne(BotPromptModel);

const addBotManyPrompts = asyncErrorCatcher(async (req: Request, res: Response) => {
  const { botId, prompts, type } = req.body;

  if (!botId || typeof botId !== "string") throw new AppError("Invalid botId", 400);
  if (!type || typeof type !== "string") throw new AppError("Invalid type", 400);
  if (!prompts || !Array.isArray(prompts) || prompts.some(prompt => typeof prompt !== "string"))
    throw new AppError("Invalid prompts", 400);

  const botPrompts = [];
  for (let i = 0; i < prompts.length; i++) {
    const prompt = prompts[i];
    const botPrompt = await BotPromptModel.create({ botId, prompt, type });
    botPrompts.push(botPrompt);
  }

  res.send({
    status: "success",
    requestedAt: new Date().toISOString(),
    results: botPrompts.length,
    data: botPrompts,
  });
});

export { getBotPrompts, addBotPrompt, addBotManyPrompts };
