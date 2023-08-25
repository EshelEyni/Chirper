import { Request, Response } from "express";
import { asyncErrorCatcher } from "../../../../services/error/error.service";
import botService from "../../services/bot/bot.service";

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
