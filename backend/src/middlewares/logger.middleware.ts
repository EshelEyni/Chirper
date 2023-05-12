import { Request, Response, NextFunction } from "express";

const { logger } = require("../services/logger.service");
const { asyncErrorCatcher } = require("../services/error.service");

const requestLogger = asyncErrorCatcher(async (req: Request, res: Response, next: NextFunction) => {
  const { method, originalUrl } = req;
  const start = Date.now();
  const str = `${method} ${originalUrl}`;
  logger.info(str);

  res.on("finish", () => {
    if (res.statusCode >= 400) {
      return;
    }

    const duration = Date.now() - start;
    const str = `${method} ${originalUrl} ${res.statusCode} ${duration}ms`;
    logger.success(str);
  });

  next();
});

module.exports = requestLogger;
