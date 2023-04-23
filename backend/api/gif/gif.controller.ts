import { logger } from "../../services/logger.service";
import { gifService } from "./gif.service";
import { Request, Response } from "express";



export async function getGiffsBySearchTerm(req: Request, res: Response): Promise<void> {
  try {
    // const { searchTerm } = req.params;
    const searchTerm = req.query.searchTerm as string;
    const giff = await gifService.getGiffsBySearchTerm(searchTerm);
    res.send(giff);
  } catch (err) {
    logger.error("Failed to get giff", err as Error);
    res.status(500).send({ err: "Failed to get giff" });
  }
}
