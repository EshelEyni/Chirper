import locationService from "./location.service";
import { Request, Response } from "express";

import { asyncErrorCatcher, AppError } from "../../services/error/error.service";

const getUserDefaultLocations = asyncErrorCatcher(
  async (req: Request, res: Response): Promise<void> => {
    const { lat, lng } = req.query;
    if (!lat || !lng) {
      const msg =
        !lat && !lng ? "No lat and lng provided" : !lat ? "No lat provided" : "No lng provided";
      throw new AppError(msg, 400);
    }
    const locations = await locationService.getUserSurroundingLocations(Number(lat), Number(lng));

    res.status(200).send({
      status: "success",
      requestAt: new Date().toISOString(),
      results: locations.length,
      data: locations,
    });
  }
);

const getLocationsBySearchTerm = asyncErrorCatcher(async (req: Request, res: Response) => {
  const searchTerm = req.query.searchTerm as string;
  if (!searchTerm) throw new AppError("No search term provided", 400);
  const locations = await locationService.getLocationBySearchTerm(searchTerm);

  res.status(200).send({
    status: "success",
    requestAt: new Date().toISOString(),
    results: locations.length,
    data: locations,
  });
});

export { getUserDefaultLocations, getLocationsBySearchTerm };
