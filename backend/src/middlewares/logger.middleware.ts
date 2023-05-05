import { logger } from "../services/logger.service.js";
import { Request, Response, NextFunction } from "express";

export async function log(req: Request, res: Response, next: NextFunction) {
  logger.info("Req was made");
  next();
}
