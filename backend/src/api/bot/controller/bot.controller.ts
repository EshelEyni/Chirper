import { Request, Response } from "express";
import { asyncErrorCatcher } from "../../../services/error/error.service";
import botService from "../service/bot.service";

const getBots = asyncErrorCatcher(async (req: Request, res: Response) => {
  const bots = await botService.getBots();
  res.send({
    status: "success",
    requestedAt: new Date().toISOString(),
    results: bots.length,
    data: bots,
  });
});

const getBotPrompts = asyncErrorCatcher(async (req: Request, res: Response) => {
  const { botId } = req.query;
  const prompts = await botService.getBotPrompts(botId as string);
  res.send({
    status: "success",
    requestedAt: new Date().toISOString(),
    results: prompts.length,
    data: prompts,
  });
});

const addPost = asyncErrorCatcher(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { prompt, schedule, numOfPosts, numberOfImages, isImg, isImgOnly } = req.body;
  const post = await botService.createPost({
    botId: id,
    prompt,
    schedule,
    numOfPosts: Number(numOfPosts),
    numberOfImages: Number(numberOfImages),
    isImg,
    isImgOnly,
  });
  res.send({
    status: "success",
    data: post,
  });
});

const addBotPrompt = asyncErrorCatcher(async (req: Request, res: Response) => {
  const { botId, prompt, type } = req.body;
  const botPrompt = await botService.addBotPrompt({ botId, prompt, type });
  res.send({
    status: "success",
    data: botPrompt,
  });
});

export { getBots, getBotPrompts, addPost, addBotPrompt };
