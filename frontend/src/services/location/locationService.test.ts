/* eslint-disable @typescript-eslint/no-explicit-any */
import { vi, describe, it, expect, Mock, beforeAll, afterAll } from "vitest";
import { JsendResponse } from "../../../../shared/types/system";
import httpService from "../http/httpService";
import locationService from "./locationService";
import cacheService from "../cache/cacheService";

vi.mock("../http/httpService");
vi.mock("../cache/cacheService");

global.navigator = { geolocation: { getCurrentPosition: vi.fn() } } as any;

describe("Location Service", () => {
  describe("getLocationsBySearchTerm", () => {
    it("should return locations when the server responds correctly", async () => {
      const mockResponse: JsendResponse = {
        status: "success",
        data: [
          { id: 1, name: "Location1" },
          { id: 2, name: "Location2" },
        ],
      };

      (httpService.get as Mock).mockResolvedValue(mockResponse);

      const result = await locationService.getLocationsBySearchTerm("test");

      expect(result).toEqual(mockResponse.data);
    });

    it("should throw an error when the server responds with an error", async () => {
      const mockError = new Error("Server Error");

      (httpService.get as Mock).mockRejectedValue(mockError);

      await expect(locationService.getLocationsBySearchTerm("test")).rejects.toThrow(mockError);
    });
  });

  describe("getUserDefaultLocations", () => {
    let originalGeolocation: typeof navigator.geolocation;

    function _mockGeoLocation(value?: any) {
      const defaultValue = {
        getCurrentPosition: vi.fn().mockImplementation(success => {
          success({ coords: { latitude: 40.7128, longitude: -74.006 } });
        }),
      };

      Object.defineProperty(navigator, "geolocation", {
        value: value === undefined ? defaultValue : value,
        configurable: true,
      });
    }

    beforeAll(() => {
      originalGeolocation = navigator.geolocation;
    });

    afterAll(() => {
      _mockGeoLocation(originalGeolocation);
    });

    it("should return cached locations if available", async () => {
      const mockCacheData = [
        { id: 1, name: "CachedLocation1" },
        { id: 2, name: "CachedLocation2" },
      ];

      (cacheService.get as Mock).mockReturnValue(mockCacheData);

      const result = await locationService.getUserDefaultLocations();
      expect(cacheService.get).toHaveBeenCalledWith("location", 5);
      expect(result).toEqual(mockCacheData);
    });

    it("should fetch and cache locations if cache is empty and geolocation is available", async () => {
      const mockResponse: JsendResponse = {
        status: "success",
        data: [
          { id: 1, name: "Location1" },
          { id: 2, name: "Location2" },
        ],
      };

      (cacheService.get as Mock).mockReturnValue(null);
      (httpService.get as Mock).mockResolvedValue(mockResponse);

      _mockGeoLocation();

      const result = await locationService.getUserDefaultLocations();
      expect(cacheService.get).toHaveBeenCalledWith("location", 5);
      expect(result).toEqual(mockResponse.data);
      expect(cacheService.set).toHaveBeenCalledWith(
        "location",
        expect.objectContaining({ data: mockResponse.data })
      );
    });

    it("should return null if geolocation is not available", async () => {
      const spy = vi.spyOn(console, "error");

      (cacheService.get as Mock).mockReturnValue(null);
      _mockGeoLocation(null);

      const result = await locationService.getUserDefaultLocations();
      expect(spy).toBeCalledWith("Geolocation is not supported by this browser.");
      expect(result).toBeNull();

      _mockGeoLocation();
    });

    it("should throw an error when the server responds with an error", async () => {
      const mockError = new Error("Server Error");

      (cacheService.get as Mock).mockReturnValue(null);
      (httpService.get as Mock).mockRejectedValue(mockError);

      await expect(locationService.getUserDefaultLocations()).rejects.toThrow(mockError);
    });
  });
});

/*
NOTE: didn't tested the error case inside the navigator.geolocation.getCurrentPosition 
because it is mocked here, so mocking the error and testing it will be redundant.
*/
