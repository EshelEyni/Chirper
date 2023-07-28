jest.mock("../../services/logger/logger.service");

import { logger } from "../../services/logger/logger.service";
import { requestLogger } from "./logger.middleware";
import { NextFunction, Request, Response } from "express";

const mockedLogger = logger as jest.Mocked<typeof logger>;

describe("requestLogger Middleware", () => {
  const mockRequest = {
    method: "GET",
    originalUrl: "/test",
  } as Request;

  const mockResponse = {
    on: jest.fn((event, callback) => callback()),
    statusCode: 200,
  } as unknown as Response;

  const mockNext = jest.fn() as NextFunction;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should log the request info and calls next", () => {
    requestLogger(mockRequest, mockResponse, mockNext);
    expect(mockedLogger.info).toHaveBeenCalledWith("GET /test");
    expect(mockNext).toHaveBeenCalled();
  });

  it("should log the request info and response info when the response finishes", () => {
    requestLogger(mockRequest, mockResponse, mockNext);
    expect(mockedLogger.info).toHaveBeenCalledWith("GET /test");
    expect(mockedLogger.success).toHaveBeenCalledWith("GET /test 200 0ms");
    expect(mockNext).toHaveBeenCalled();
  });

  it("should log the request info but not the response info when the response finishes with an error", () => {
    mockResponse.statusCode = 400;
    requestLogger(mockRequest, mockResponse, mockNext);
    expect(mockedLogger.info).toHaveBeenCalledWith("GET /test");
    expect(mockedLogger.success).not.toHaveBeenCalled();
    expect(mockNext).toHaveBeenCalled();
  });
});

/* 
Notes: even though the requestLogger function is an async function, we don't need to use await when calling it in the test.
*/
