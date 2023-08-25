import { Request, Response } from "express";
import { AppError, asyncErrorCatcher } from "../../../../services/error/error.service";
import botPostService from "../../services/post/post.service";

const addPost = asyncErrorCatcher(async (req: Request, res: Response) => {
  const botId = req.params.id;
  if (!botId) throw new AppError("Bot Id is required", 400);

  const { prompt, schedule, numOfPosts, postType, numberOfImages, addTextToContent } = req.body;
  const post = await botPostService.createPost({
    botId,
    prompt,
    schedule,
    numOfPosts: Number(numOfPosts),
    postType,
    numberOfImages: Number(numberOfImages),
    addTextToContent,
  });
  res.send({
    status: "success",
    data: post,
  });
});

export { addPost };
