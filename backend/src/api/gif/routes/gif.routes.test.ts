/* eslint-disable @typescript-eslint/no-explicit-any */
import request from "supertest";
import express from "express";
import router from "./gif.routes";
import gifService from "../service/gif.service";
import { errorHandler } from "../../../services/error/error.service";
import { APIFeatures } from "../../../services/util/util.service";
import { mockDeep } from "jest-mock-extended";

const APIFeaturesMock = mockDeep<APIFeatures<any>>();

jest.mock("../../../services/util/util.service", () => {
  return {
    APIFeatures: jest.fn().mockImplementation(() => APIFeaturesMock),
  };
});

jest.mock("../service/gif.service", () => ({
  getGifsBySearchTerm: jest.fn().mockReturnValue([]),
  getGifByCategory: jest.fn().mockReturnValue([]),
  getGifCategories: jest.fn().mockReturnValue([]),
}));

const app = express();
app.use(router);
app.use(errorHandler);

describe("Gif Routes", () => {
  function setMocks() {
    APIFeaturesMock.filter.mockReturnThis();
    APIFeaturesMock.sort.mockReturnThis();
    APIFeaturesMock.limitFields.mockReturnThis();
    APIFeaturesMock.paginate.mockReturnThis();
    APIFeaturesMock.getQuery.mockReturnValue(Promise.resolve([]) as any);
  }

  describe("GET /", () => {
    beforeEach(() => {
      setMocks();
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it("should return 200 and an array of gifs if gifs match the category", async () => {
      const category = "Agree";
      const gifs = [{ id: "1", url: "http://example.com" }];
      APIFeaturesMock.getQuery.mockReturnValue(Promise.resolve(gifs) as any);
      const res = await request(app).get("/").query({ category });
      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toEqual(gifs);
    });

    it("should return 200 and an empty array if no gifs match the category", async () => {
      const category = "nonexistent";
      const res = await request(app).get("/").query({ category });
      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toEqual([]);
    });

    it("should return 200 and an array of 100 gifs with different categoreis if no category is provided", async () => {
      const gifs = [
        { id: "1", url: "http://example.com", category: "test" },
        { id: "2", url: "http://example.com", category: "test2" },
      ];
      APIFeaturesMock.getQuery.mockReturnValue(Promise.resolve(gifs) as any);
      const res = await request(app).get("/");
      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toEqual(gifs);
    });
  });

  describe("GET /search", () => {
    it("should get gifs by search term", async () => {
      const res = await request(app).get("/search").query({ searchTerm: "test" });
      expect(res.statusCode).toEqual(200);
    });

    it("should return 400 if no search term is provided", async () => {
      const res = await request(app).get("/search");
      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toEqual("No search term provided");
    });

    it("should return 200 and an empty array if no gifs match the search term", async () => {
      const res = await request(app).get("/search").query({ searchTerm: "nonexistent" });
      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toEqual([]);
    });

    it("should return 200 and an array of gifs if gifs match the search term", async () => {
      const searchTerm = "test";
      const gifs = [{ id: "1", url: "http://example.com" }];
      (gifService.getGifsBySearchTerm as jest.Mock).mockReturnValueOnce(gifs);
      const res = await request(app).get("/search").query({ searchTerm });
      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toEqual(gifs);
    });
  });

  describe("GET /categories", () => {
    beforeEach(() => {
      setMocks();
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it("should return 200 and an array of gif categories", async () => {
      const categories = [{ id: "1", name: "test" }];
      APIFeaturesMock.getQuery.mockReturnValue(Promise.resolve(categories) as any);
      const res = await request(app).get("/categories");
      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toEqual(categories);
    });

    it("should return 200 and an empty array if no categories exist", async () => {
      APIFeaturesMock.getQuery.mockReturnValue(Promise.resolve([]) as any);
      const res = await request(app).get("/categories");
      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toEqual([]);
    });
  });
});
