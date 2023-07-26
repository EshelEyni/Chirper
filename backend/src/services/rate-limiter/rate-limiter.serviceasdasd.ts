/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from "express";
import rateLimit from "express-rate-limit";
import { authRequestLimiter, requestLimiter } from "./rate-limiter.service";

jest.mock("express-rate-limit");

const mockRateLimit = rateLimit as jest.MockedFunction<typeof rateLimit>;
const mockRequestLimiter = jest.fn();
const reqMock = {} as Request;
const resMock = {} as Response;
const nextMock = jest.fn() as NextFunction;

describe("Rate Limiter", () => {
  beforeEach(() => {
    mockRateLimit.mockReturnValue(mockRequestLimiter as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should call the rate limiter with the right parameters for auth requests", () => {
    authRequestLimiter(reqMock, resMock, nextMock);
    expect(mockRateLimit).toHaveBeenCalledWith({
      windowMs: 60 * 60 * 1000,
      max: 20,
      message: "Too many authentication requests, please try again later",
    });
  });

  //   it("should call the rate limiter with the right parameters for GET requests", () => {
  //     reqMock.method = "GET";
  //     authRequestLimiter(reqMock, resMock, nextMock);
  //     expect(mockRateLimit).toHaveBeenCalledWith({
  //       windowMs: 15 * 60 * 1000,
  //       max: 2000,
  //       message: "Too many GET requests, please try again later",
  //     });
  //     expect(mockRequestLimiter).toHaveBeenCalledWith(reqMock, resMock, nextMock);
  //   });
});
