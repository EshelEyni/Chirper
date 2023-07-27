import jwt from "jsonwebtoken";
import { Request } from "express";
import tokenService from "./token.service";
import config from "../../config/index";
import { AppError } from "../error/error.service";

jest.mock("jsonwebtoken");

const mockRequest = (headers = {}, cookies = {}) =>
  ({
    headers,
    cookies,
  } as Request);

describe("Token Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getTokenFromRequest", () => {
    it("should return token from cookies if present", () => {
      const req = mockRequest({}, { loginToken: "test_token" });
      const token = tokenService.getTokenFromRequest(req);
      expect(token).toBe("test_token");
    });

    it("should return token from headers if present", () => {
      const req = mockRequest({ authorization: "Bearer test_token" });
      const token = tokenService.getTokenFromRequest(req);
      expect(token).toBe("test_token");
    });

    it("should return null if token is not present", () => {
      const req = mockRequest();
      const token = tokenService.getTokenFromRequest(req);
      expect(token).toBeNull();
    });
  });

  describe("signToken", () => {
    it("should sign and return a token", () => {
      (jwt.sign as jest.Mock).mockReturnValue("signed_token");
      const token = tokenService.signToken("test_id");
      expect(jwt.sign).toHaveBeenCalledWith({ id: "test_id" }, config.jwtSecretCode, {
        expiresIn: config.jwtExpirationTime,
      });
      expect(token).toBe("signed_token");
    });

    it("should throw an error if jwtSecretCode is not in config", () => {
      const temp = config.jwtSecretCode;
      delete config.jwtSecretCode;
      expect(() => tokenService.signToken("test_id")).toThrow(AppError);
      config.jwtSecretCode = temp;
    });

    it("should throw an error if jwtExpirationTime is not in config", () => {
      const temp = config.jwtExpirationTime;
      delete config.jwtExpirationTime;
      expect(() => tokenService.signToken("test_id")).toThrow(AppError);
      config.jwtExpirationTime = temp;
    });
  });

  describe("verifyToken", () => {
    it("should verify and return the payload of a token", async () => {
      (jwt.verify as jest.Mock).mockReturnValue({ id: "test_id", iat: 1234567890 });
      const payload = await tokenService.verifyToken("test_token");
      expect(jwt.verify).toHaveBeenCalledWith("test_token", config.jwtSecretCode);
      expect(payload).toEqual({ id: "test_id", timeStamp: 1234567890 });
    });

    it("should return null if verification fails", async () => {
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error("Token verification failed");
      });
      const payload = await tokenService.verifyToken("test_token");
      expect(payload).toBeNull();
    });

    it("should return null if jwtSecretCode is not in config", async () => {
      const temp = config.jwtSecretCode;
      delete config.jwtSecretCode;
      const payload = await tokenService.verifyToken("test_token");
      expect(payload).toBeNull();
      config.jwtSecretCode = temp;
    });
  });
});
