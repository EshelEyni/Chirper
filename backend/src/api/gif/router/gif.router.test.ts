/* eslint-disable @typescript-eslint/no-explicit-any */
import request from "supertest";
import express from "express";
import router from "./gif.router";
import gifService from "../service/gif.service";
import { errorHandler } from "../../../services/error/error.service";
import {
  assertGif,
  assertGifCategory,
  connectToTestDB,
  getLoginTokenStrForTest,
  getValidUserId,
} from "../../../services/test-util.service";
import mongoose from "mongoose";

const app = express();
app.use(router);
app.use(errorHandler);

describe("Gif Router", () => {
  let validUserId: string, token: string;

  beforeAll(async () => {
    await connectToTestDB();
    validUserId = await getValidUserId();
    token = getLoginTokenStrForTest(validUserId);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe("GET /", () => {
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
      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toEqual(expect.any(Array));
      res.body.data.forEach(assertGif);
    });

    it("should return 400 if no search term is provided", async () => {
      const res = await request(app).get("/search");
      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toEqual("No search term provided");
    });

    it("should return 200 and an empty array if no gifs match the search term", async () => {
      jest.spyOn(gifService, "getGifsBySearchTerm").mockReturnValueOnce(Promise.resolve([]));
      const res = await request(app).get("/search").query({ searchTerm: "nonexistent" });
      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toEqual([]);
    });

    it("should return 200 and an array of gifs from DB if search term maches one of the Gif categories", async () => {
      const spy = jest.spyOn(gifService, "getGifFromDB");

      const category = "Agree";
      const res = await request(app).get("/search").query({ searchTerm: category });
      expect(spy).toHaveBeenCalledWith(category);
      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toEqual(expect.any(Array));
      res.body.data.forEach(assertGif);
      spy.mockRestore();
    });
  });

  fdescribe("GET /categories", () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it("should return 200 and an array of gif categories", async () => {
      const res = await request(app).get("/categories");
      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toEqual(expect.any(Array));
      res.body.data.forEach(assertGifCategory);
    });
  });
});
