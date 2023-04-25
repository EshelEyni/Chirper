import { logger } from "../../services/logger.service";
import { gifService } from "./gif.service";
import { Request, Response } from "express";



export async function getGifsBySearchTerm(req: Request, res: Response): Promise<void> {
  try {
    // const { searchTerm } = req.params;
    const searchTerm = req.query.searchTerm as string;
    const gif = await gifService.getGifsBySearchTerm(searchTerm);
    res.send(gif);
  } catch (err) {
    logger.error("Failed to get gif", err as Error);
    res.status(500).send({ err: "Failed to get gif" });
  }
}


export async function getGifCategories(req: Request, res: Response): Promise<void> {
  try {
    const gifHeaders = await gifService.getGifCategories();
    res.send(gifHeaders);
  } catch (err) {
    logger.error("Failed to get gif headers", err as Error);
    res.status(500).send({ err: "Failed to get gif headers" });
  }
}

export async function getGifByCategory(req: Request, res: Response): Promise<void> {
  try {
    const { category } = req.params;
    const gifs = await gifService.getGifByCategory(category);
    res.send(gifs);
  } catch (err) {
    logger.error("Failed to get gif", err as Error);
    res.status(500).send({ err: "Failed to get gif" });
  }
}