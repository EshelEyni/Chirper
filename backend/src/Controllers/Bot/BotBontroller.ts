import { Request, Response } from "express";
import { asyncErrorCatcher } from "../../Services/Error/ErrorService";
import botService from "../../Services/Bot/BotService";

const getBots = asyncErrorCatcher(async (req: Request, res: Response) => {
  const bots = await botService.getBots();
  res.send({
    status: "success",
    requestedAt: new Date().toISOString(),
    results: bots.length,
    data: bots,
  });
});

export { getBots };
