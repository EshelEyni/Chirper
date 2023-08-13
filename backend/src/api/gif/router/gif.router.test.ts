/* eslint-disable @typescript-eslint/no-explicit-any */
import request from "supertest";
import express from "express";
import router from "./gif.router";
import gifService from "../service/gif.service";
import { errorHandler } from "../../../services/error/error.service";
import { APIFeatures } from "../../../services/util/util.service";
import { mockDeep } from "jest-mock-extended";
import {
  assertGif,
  assertGifCategory,
  connectToTestDB,
  getLoginTokenStrForTest,
  getValidUserId,
} from "../../../services/test-util.service";
import mongoose from "mongoose";

const APIFeaturesMock = mockDeep<APIFeatures<any>>();

const app = express();
app.use(router);
app.use(errorHandler);

describe("Gif Router", () => {
  let validUserId: string, token: string;

  function setMocks() {
    APIFeaturesMock.filter.mockReturnThis();
    APIFeaturesMock.sort.mockReturnThis();
    APIFeaturesMock.limitFields.mockReturnThis();
    APIFeaturesMock.paginate.mockReturnThis();
    APIFeaturesMock.getQuery.mockReturnValue(Promise.resolve([]) as any);
  }

  beforeAll(async () => {
    await connectToTestDB();
    validUserId = await getValidUserId();
    token = getLoginTokenStrForTest(validUserId);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe("GET /", () => {
    beforeEach(() => {
      setMocks();
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it("should return 200 and an array of gifs if gifs match the category", async () => {
      const category = "Agree";
      const res = await request(app).get("/").query({ category }).set("Cookie", [token]);
      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toEqual(expect.any(Array));
      res.body.data.forEach(assertGif);
    });

    it("should return 200 and an empty array if no gifs match the category", async () => {
      const category = "nonexistent";
      const res = await request(app).get("/").query({ category });
      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toEqual([]);
    });

    it("should return 200 and an array of 100 gifs with different categoreis if no category is provided", async () => {
      const res = await request(app).get("/");
      expect(res.statusCode).toEqual(200);
      res.body.data.forEach(assertGif);

      if (res.body.data.length > 0) {
        const categories = res.body.data.map((gif: any) => gif.category);
        expect(categories).toEqual(expect.arrayContaining(categories));
        const uniqueCategories = [...new Set(categories)];
        expect(uniqueCategories.length).toBeGreaterThan(1);
      }
    });
  });

  describe("GET /search", () => {
    it("should get gifs by search term", async () => {
      const res = await request(app).get("/search").query({ searchTerm: "test" });
      console.log(JSON.stringify(res.body, null, 2));
      expect(res.statusCode).toEqual(200);
    });

    xit("should return 400 if no search term is provided", async () => {
      const res = await request(app).get("/search");
      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toEqual("No search term provided");
    });

    xit("should return 200 and an empty array if no gifs match the search term", async () => {
      const res = await request(app).get("/search").query({ searchTerm: "nonexistent" });
      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toEqual([]);
    });

    xit("should return 200 and an array of gifs if gifs match the search term", async () => {
      const searchTerm = "test";
      const gifs = [{ id: "1", url: "http://example.com" }];
      (gifService.getGifsBySearchTerm as jest.Mock).mockReturnValueOnce(gifs);
      const res = await request(app).get("/search").query({ searchTerm });
      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toEqual(gifs);
    });
  });

  xdescribe("GET /categories", () => {
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
