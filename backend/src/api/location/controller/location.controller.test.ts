/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from "express";
import { getUserDefaultLocations, getLocationsBySearchTerm } from "./location.controller";
import locationService from "../service/location.service";
import { AppError, asyncErrorCatcher } from "../../../services/error/error.service";

jest.mock("../service/location.service");
const nextMock = jest.fn() as jest.MockedFunction<NextFunction>;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
(asyncErrorCatcher as jest.Mock) = jest.fn().mockImplementation(fn => {
  return async (...args: unknown[]) => {
    try {
      return await fn(...args);
    } catch (error) {
      return nextMock(error);
    }
  };
});

describe("Location Controller", () => {
  describe("getUserDefaultLocations", () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: jest.Mock;

    beforeEach(() => {
      req = { query: {} };
      res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
      next = jest.fn();
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it("should return user default locations", async () => {
      const mockLocations = [
        { name: "New York", placeId: "1", lat: 1, lng: 1 },
        { name: "London", placeId: "2", lat: 2, lng: 2 },
      ];
      jest.spyOn(locationService, "getUserSurroundingLocations").mockResolvedValue(mockLocations);
      req.query = { lat: "1", lng: "1" };

      const sut = getUserDefaultLocations as any;
      await sut(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({
        status: "success",
        requestAt: expect.any(String),
        results: mockLocations.length,
        data: mockLocations,
      });
    });

    it("should return error when no lat and lng provided", async () => {
      const sut = getUserDefaultLocations as any;
      await sut(req as Request, res as Response, next);
      expect(next).toHaveBeenCalledWith(new AppError("No lat and lng provided", 400));
    });

    it("should return error when no lat provided", async () => {
      req.query = { lng: "1" };
      const sut = getUserDefaultLocations as any;
      await sut(req as Request, res as Response, next);
      expect(next).toHaveBeenCalledWith(new AppError("No lat provided", 400));
    });

    it("should return error when no lng provided", async () => {
      req.query = { lat: "1" };
      const sut = getUserDefaultLocations as any;
      await sut(req as Request, res as Response, next);
      expect(next).toHaveBeenCalledWith(new AppError("No lng provided", 400));
    });

    it("should handle errors from locationService.getUserSurroundingLocations", async () => {
      jest
        .spyOn(locationService, "getUserSurroundingLocations")
        .mockRejectedValue(new Error("Test error"));
      req.query = { lat: "1", lng: "1" };

      const sut = getUserDefaultLocations as any;
      await sut(req as Request, res as Response, next);
      expect(res.status).not.toHaveBeenCalled();
      expect(res.send).not.toHaveBeenCalled();
    });
  });

  fdescribe("getLocationsBySearchTerm", () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: jest.Mock;

    beforeEach(() => {
      req = { query: {} };
      res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
      next = jest.fn();
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it("should return locations by search term", async () => {
      const mockLocations = [
        { name: "New York", placeId: "1", lat: 1, lng: 1 },
        { name: "London", placeId: "2", lat: 2, lng: 2 },
      ];
      jest.spyOn(locationService, "getLocationBySearchTerm").mockResolvedValue(mockLocations);
      req.query = { searchTerm: "New York" };

      const sut = getLocationsBySearchTerm as any;
      await sut(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({
        status: "success",
        requestAt: expect.any(String),
        results: mockLocations.length,
        data: mockLocations,
      });
    });

    it("should return error when no search term provided", async () => {
      const sut = getLocationsBySearchTerm as any;
      await sut(req as Request, res as Response, next);
      expect(next).toHaveBeenCalledWith(new AppError("No search term provided", 400));
    });

    it("should handle errors from locationService.getLocationBySearchTerm", async () => {
      jest
        .spyOn(locationService, "getLocationBySearchTerm")
        .mockRejectedValue(new Error("Test error"));
      req.query = { searchTerm: "New York" };

      const sut = getLocationsBySearchTerm as any;
      await sut(req as Request, res as Response, next);
      expect(res.status).not.toHaveBeenCalled();
      expect(res.send).not.toHaveBeenCalled();
    });
  });
});
