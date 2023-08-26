import { Request, Response } from "express";
import { AppError, asyncErrorCatcher } from "../../../../services/error/error.service";
import botPostService, { CreatePostOptions } from "../../services/post/post.service";

const addPost = asyncErrorCatcher(async (req: Request, res: Response) => {
  const botId = req.params.id;
  if (!botId) throw new AppError("Bot Id is required", 400);

  const options = req.body as CreatePostOptions;
  const post = await botPostService.createPost(botId, options);
  res.send({
    status: "success",
    data: post,
  });
});

export { addPost };
