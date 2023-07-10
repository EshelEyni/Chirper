// src/__tests__/appError.test.ts
import { AppError, errorHandler } from "./error.service";
import { Request, Response, NextFunction } from "express";
import { logger } from "../logger.service";
jest.mock("../logger.service");

describe("Error Service", () => {
  describe("AppError", () => {
    it("should correctly set properties", () => {
      const errorMessage = "An error occurred";
      const statusCode = 400;
      const errorCode = 123;

      const error = new AppError(errorMessage, statusCode, errorCode);

      expect(error.message).toEqual(errorMessage);
      expect(error.statusCode).toEqual(statusCode);
      expect(error.code).toEqual(errorCode);
      expect(error.isOperational).toBeTruthy();
    });

    it("should set status to fail if statusCode starts with 4", () => {
      const errorMessage = "Another error occurred";
      const statusCode = 404;

      const error = new AppError(errorMessage, statusCode);

      expect(error.status).toEqual("fail");
    });

    it("should set status to error if statusCode does not start with 4", () => {
      const errorMessage = "Yet another error occurred";
      const statusCode = 500;

      const error = new AppError(errorMessage, statusCode);

      expect(error.status).toEqual("error");
    });
  });

  describe("errorHandler", () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    const nextFunction: NextFunction = jest.fn();

    beforeEach(() => {
      mockRequest = {};
      mockResponse = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn().mockReturnThis(),
      };
    });

    it("should respond with 500 status and error message in development environment", () => {
      process.env.NODE_ENV = "development";

      const error = new Error("Some error");
      errorHandler(error, mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.send).toHaveBeenCalledWith({
        status: "error",
        error: error,
        message: error.message,
        stack: error.stack,
      });
      expect(logger.error).toHaveBeenCalledWith(error.message);
    });

    it("should CastError correctly", () => {
      process.env.NODE_ENV = "development";

      const error = {
        message: "Invalid id: 123123.",
        name: "CastError",
        path: "_id",
        value: "id123123",
        status: "error",
        statusCode: 500,
      } as any;
      errorHandler(error, mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.send).toHaveBeenCalledWith({
        status: "error",
        error: error,
        message: "Invalid id: 123123.",
        stack: error.stack,
      });
      expect(logger.error).toHaveBeenCalledWith(error.message);
    });
  });
});
