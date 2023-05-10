import { Response, Request, NextFunction } from "express";
const { logger } = require("./logger.service");

class AppError extends Error {
  statusCode: number;
  status: string;
  isOperational: boolean;
  code?: number;

  constructor(message: string, statusCode: number, code?: number) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;
    this.code = code;

    Error.captureStackTrace(this, this.constructor);
  }
}

const errorHandler = (err: any, req: Request, res: Response, next: NextFunction): void => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  function handleCastErrorDB(err: any): AppError {
    const dbProperty = err.path === "_id" ? "id" : (err.path as string);
    const message = `Invalid ${dbProperty}: ${err.value}.`;
    return new AppError(message, 400);
  }

  function handleDuplicateFieldsDB(err: any): AppError {
    const { keyValue } = err;
    const [key, value] = Object.entries(keyValue)[0];
    const message = `Duplicate ${key} value: ${value}. Please use another value!`;
    return new AppError(message, 400);
  }

  function handleValidationErrorDB(err: any): AppError {
    // const errors = Object.values(err.errors).map((el: any) => el.message);
    // const message = `Invalid input data. ${errors.join(". ")}`;
    const message = err.message;
    return new AppError(message, 400);
  }

  function sendErrorDev(err: AppError, res: Response): void {
    res.status(err.statusCode).send({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }

  function sendErrorProd(err: AppError, res: Response): void {
    if (err.isOperational) {
      res.status(err.statusCode).send({
        status: err.status,
        message: err.message,
      });
    } else {
      res.status(500).send({
        status: "error",
        message: "Something went very wrong!",
      });
    }
  }

  const isDev = process.env.NODE_ENV !== "production";

  if (isDev) {
    sendErrorDev(err, res);
  } else {
    let error = { ...err, message: err.message, name: err.name };
    if (error.name === "CastError") error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === "ValidationError") error = handleValidationErrorDB(error);
    sendErrorProd(error, res);
  }

  logger.error(err.message, err as Error);
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
