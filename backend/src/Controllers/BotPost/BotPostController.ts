import { Request, Response } from "express";
import { AppError, asyncErrorCatcher } from "../../services/error/errorService";
import botPostService from "../../services/botPost/botPostService";
import { CreateBotPostOptions } from "../../types/App";

const addPost = asyncErrorCatcher(async (req: Request, res: Response) => {
  const botId = req.params.id;
  if (!botId) throw new AppError("Bot Id is required", 400);

  const options = req.body as CreateBotPostOptions;
  const post = await botPostService.createPost(botId, options);
  res.status(201).send({
    status: "success",
    data: post,
  });
});

export { addPost };
