/* eslint-disable @typescript-eslint/no-explicit-any */
import request from "supertest";
import express from "express";
import router from "./location.router";
import locationService from "../service/location.service";
import { errorHandler } from "../../../services/error/error.service";

jest.mock("../../../middlewares/authGuards/authGuards.middleware", () => ({
  checkUserAuthentication: jest.fn().mockImplementation((req, res, next) => next()),
}));

const app = express();
app.use(router);
app.use(errorHandler);

describe("Location Router", () => {
  function assertLocation(location: any) {
    expect(location).toEqual(
      expect.objectContaining({
        placeId: expect.any(String),
        name: expect.any(String),
        lat: expect.any(Number),
        lng: expect.any(Number),
      })
    );
  }

  describe("GET /", () => {
    it("should return user default locations", async () => {
      const res = await request(app).get("/").query({ lat: 40.7128, lng: 74.006 });
      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        status: "success",
        requestedAt: expect.any(String),
        results: 7,
        data: expect.any(Array),
      });

      res.body.data.forEach(assertLocation);
    });

    it("should return 400 error if lat and lng are not provided", async () => {
      const res = await request(app).get("/");
      expect(res.status).toBe(400);
      expect(res.body.status).toEqual("fail");
      expect(res.body.message).toEqual("No lat and lng provided");
    });

    it("should return 400 error if only lat is provided", async () => {
      const res = await request(app).get("/").query({ lat: 1 });

      expect(res.status).toBe(400);
      expect(res.body.status).toEqual("fail");
      expect(res.body.message).toEqual("No lng provided");
    });

    it("should return 400 error if only lng is provided", async () => {
      const res = await request(app).get("/").query({ lng: 1 });

      expect(res.status).toBe(400);
      expect(res.body.status).toEqual("fail");
      expect(res.body.message).toEqual("No lat provided");
    });

    it("should return 500 error if location service throws an error", async () => {
      jest
        .spyOn(locationService, "getUserSurroundingLocations")
        .mockRejectedValue(new Error("Test error"));

      const res = await request(app).get("/").query({ lat: 1, lng: 1 });

      expect(res.status).toBe(500);
      expect(res.body.status).toEqual("error");
      expect(res.body.message).toEqual("Test error");
    });

    it("should return 200 and an empty array if no locations are found", async () => {
      jest.spyOn(locationService, "getUserSurroundingLocations").mockResolvedValue([]);

      const res = await request(app).get("/").query({ lat: 1, lng: 1 });

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        status: "success",
        requestedAt: expect.any(String),
        results: 0,
        data: [],
      });
    });
  });

  describe("GET /search", () => {
    const searchTerm = "New York";

    it("should return locations based on search term", async () => {
      const res = await request(app).get("/search").query({ searchTerm });
      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        status: "success",
        requestedAt: expect.any(String),
        results: expect.any(Number),
        data: expect.any(Array),
      });
      res.body.data.forEach(assertLocation);
    });

    it("should return 400 error if no search term is provided", async () => {
      const res = await request(app).get("/search");
      expect(res.status).toBe(400);
      expect(res.body.status).toEqual("fail");
      expect(res.body.message).toEqual("No search term provided");
    });

    it("should return 500 error if location service throws an error", async () => {
      jest
        .spyOn(locationService, "getLocationBySearchTerm")
        .mockRejectedValue(new Error("Test error"));

      const res = await request(app).get("/search").query({ searchTerm });
      expect(res.status).toBe(500);
      expect(res.body.status).toEqual("error");
      expect(res.body.message).toEqual("Test error");
    });

    it("should return 200 and an empty array if no locations are found", async () => {
      jest.spyOn(locationService, "getLocationBySearchTerm").mockResolvedValue([]);

      const res = await request(app).get("/search").query({ searchTerm });
      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        status: "success",
        requestedAt: expect.any(String),
        results: 0,
        data: [],
      });
    });
  });
});
