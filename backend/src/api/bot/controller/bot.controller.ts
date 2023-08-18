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

const addPost = asyncErrorCatcher(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { schedule } = req.body;
  const post = await botService.createPost({ botId: id, schedule });
  res.send({
    status: "success",
    data: post,
  });
});

export { getBots, addPost };
