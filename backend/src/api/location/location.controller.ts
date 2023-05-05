import { logger } from "../../services/logger.service.js";
import { locationService } from "./location.service.js";
import { Request, Response } from "express";

export async function getUserDefaultLocation(req: Request, res: Response): Promise<void> {
  try {
    const { lat, lng } = req.query;
    if (!lat || !lng) {
      res.status(400).send({
        status: "fail",
        data: {
          ...(lat ? {} : { lat: "No latitude provided" }),
          ...(lng ? {} : { lng: "No longitude provided" }),
        },
      });
      return;
    }
    const locations = await locationService.getUserSurroundingLocations(Number(lat), Number(lng));

    res.status(200).send({
      status: "success",
      requestAt: new Date().toISOString(),
      results: locations.length,
      data: locations,
    });
  } catch (err) {
    logger.error("Failed to get user default location", err);

    res.status(500).send({
      status: "error",
      message: "Failed to get user default location",
    });
  }
}

export async function getLocationBySearchTerm(req: Request, res: Response) {
  try {
    const searchTerm = req.query.searchTerm as string;
    if (!searchTerm) {
      res.status(400).send({
        status: "fail",
        data: {
          searchTerm: "No search term provided",
        },
      });
      return;
    }
    const location = await locationService.getLocationBySearchTerm(searchTerm);
    res.status(200).send({
      status: "success",
      requestAt: new Date().toISOString(),
      results: location.length,
      data: location,
    });
  } catch (err) {
    logger.error("Failed to get location", err);
    res.status(500).send({
      status: "error",
      message: "Failed to get location",
    });
  }
}
