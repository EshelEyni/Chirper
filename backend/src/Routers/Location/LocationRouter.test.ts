/* eslint-disable @typescript-eslint/no-explicit-any */
import request from "supertest";
import express from "express";
import router from "./LocationRouter";
import locationService from "../../Services/Location/LocationService";
import { errorHandler } from "../../Services/Error/ErrorService";
import { checkUserAuthentication } from "../../Middlewares/AuthGuards/AuthGuardsMiddleware";

jest.mock("../../Middlewares/AuthGuards/AuthGuardsMiddleware", () => ({
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
    it("should return 401 error if user is not authenticated", async () => {
      const message = "You are not logged in! Please log in to get access.";
      (checkUserAuthentication as jest.Mock).mockImplementationOnce((req, res, next) => {
        res.status(401).json({ status: "fail", message });
      });

      const res = await request(app).get("/").query({ lat: 40.7128, lng: 74.006 });

      expect(res.status).toBe(401);
      expect(res.body.status).toEqual("fail");
      expect(res.body.message).toEqual(message);
    });

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

    it("should return 401 error if user is not authenticated", async () => {
      const message = "You are not logged in! Please log in to get access.";
      (checkUserAuthentication as jest.Mock).mockImplementationOnce((req, res, next) => {
        res.status(401).json({ status: "fail", message });
      });

      const res = await request(app).get("/search").query({ searchTerm });

      expect(res.status).toBe(401);
      expect(res.body.status).toEqual("fail");
      expect(res.body.message).toEqual(message);
    });

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
  });
});
