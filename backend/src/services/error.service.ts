import { Response, Request, NextFunction } from "express";
const { logger } = require("./logger.service");

class AppError extends Error {
  statusCode: number;
  status: string;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  logger.error(err.message, err as Error);

  res.status(err.statusCode).send({
    status: err.status,
    message: err.message,
  });
};

const asyncErrorCatcher = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch((err: Error) => next(err));
  };
};

module.exports = {
  AppError,
  errorHandler,
  asyncErrorCatcher,
};
