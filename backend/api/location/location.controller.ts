import { logger } from "../../services/logger.service";
import { locationService } from "./location.service";
import { Request, Response } from "express";

export async function getUserDefaultLocation(req: Request, res: Response) {
  try {
    const { lat, lng } = req.query;
    const location = await locationService.getUserSurroundingLocations(Number(lat), Number(lng));
    res.send(location);
  } catch (err) {
    logger.error("Failed to get user default location", err);
    res.status(500).send({ err: "Failed to get user default location" });
  }
}

export async function getLocationBySearchTerm(req: Request, res: Response) {
  try {
    const searchTerm = req.query.searchTerm as string;
    if (!searchTerm) res.status(400).send({ err: "No search term" });
    const location = await locationService.getLocationBySearchTerm(searchTerm);
    res.send(location);
  } catch (err) {
    logger.error("Failed to get location", err);
    res.status(500).send({ err: "Failed to get location" });
  }
}
