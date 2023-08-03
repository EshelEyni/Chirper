import { GifCategoryModel } from "../gif.model";
import { APIFeatures } from "../../../services/util/util.service";
import gifService from "./gif.service";
import { GiphyFetch } from "@giphy/js-fetch-api";
import config from "../../../config";
import { AppError } from "../../../services/error/error.service";
import { GifModel } from "../gif.model";

jest.mock("@giphy/js-fetch-api");
jest.mock("../gif.model");
jest.mock("../../../services/util/util.service", () => ({
  APIFeatures: jest.fn(),
}));

describe("Gif Service", () => {
  describe("getGifCategories", () => {
    it("should return gif categories sorted by sortOrder", async () => {
      // Arrange
      const mockGifCategories = [
        { name: "category1", sortOrder: 1 },
        { name: "category2", sortOrder: 2 },
      ];
      const exec = jest.fn().mockResolvedValue(mockGifCategories);
      const sort = jest.fn().mockReturnValue({ getQuery: () => ({ exec }) });
      (APIFeatures as jest.Mock).mockImplementation(() => ({ sort }));

      // Act
      const result = await gifService.getGifCategories();

      // Assert
      expect(APIFeatures).toHaveBeenCalledWith(GifCategoryModel.find(), { sort: "sortOrder" });
      expect(sort).toHaveBeenCalled();
      expect(exec).toHaveBeenCalled();
      expect(result).toEqual(mockGifCategories);
    });

    it("should throw an error if fetching gif categories fails", async () => {
      // Arrange
      const exec = jest.fn().mockRejectedValue(new Error("Database error"));
      const sort = jest.fn().mockReturnValue({ getQuery: () => ({ exec }) });
      (APIFeatures as jest.Mock).mockImplementation(() => ({ sort }));

      // Act and Assert
      await expect(gifService.getGifCategories()).rejects.toThrow("Database error");
    });

    it("should return an empty array if no gif categories are found", async () => {
      // Arrange
      const exec = jest.fn().mockResolvedValue([]);
      const sort = jest.fn().mockReturnValue({ getQuery: () => ({ exec }) });
      (APIFeatures as jest.Mock).mockImplementation(() => ({ sort }));

      // Act
      const result = await gifService.getGifCategories();

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe("getGifsBySearchTerm", () => {
    it("should throw an error if Giphy API key is not found", async () => {
      // Arrange
      const originalApiKey = config.giphyApiKey;
      config.giphyApiKey = "";

      // Act and Assert
      await expect(gifService.getGifsBySearchTerm("test")).rejects.toThrow(
        new AppError("Giphy API key not found", 500)
      );

      // Cleanup
      config.giphyApiKey = originalApiKey;
    });

    it("should throw an error if fetching gifs from Giphy API fails", async () => {
      // Arrange
      const searchTerm = "test";
      const search = jest.fn().mockRejectedValue(new Error("Giphy API error"));
      (GiphyFetch as jest.Mock).mockImplementation(() => ({ search }));

      // Act and Assert
      await expect(gifService.getGifsBySearchTerm(searchTerm)).rejects.toThrow("Giphy API error");
    });

    it("should return gifs by search term", async () => {
      // Arrange
      const searchTerm = "test";
      const mockFecthedGifs = [
        {
          id: "1",
          images: {
            original: { url: "url1", height: "100", width: "100" },
            original_still: { url: "staticUrl1" },
            preview_webp: { url: "placeholderUrl1" },
            fixed_width_small_still: { url: "staticPlaceholderUrl1" },
          },
          title: "title1",
        },
      ];

      const expectedGifs = [...mockFecthedGifs, ...mockFecthedGifs].map(gif => ({
        id: gif.id,
        url: gif.images.original.url,
        staticUrl: gif.images.original_still.url,
        description: gif.title,
        size: {
          height: gif.images.original.height,
          width: gif.images.original.width,
        },
        placeholderUrl: gif.images.preview_webp.url,
        staticPlaceholderUrl: gif.images.fixed_width_small_still.url,
      }));

      const search = jest.fn().mockResolvedValue({ data: mockFecthedGifs });
      (GiphyFetch as jest.Mock).mockImplementation(() => ({ search }));

      // Act
      const result = await gifService.getGifsBySearchTerm(searchTerm);

      // Assert
      expect(GiphyFetch).toHaveBeenCalledWith(config.giphyApiKey);
      expect(search).toHaveBeenCalledTimes(2);
      expect(search).toHaveBeenCalledWith(searchTerm, {
        limit: 50,
        offset: 0,
        sort: "relevant",
      });
      expect(search).toHaveBeenCalledWith(searchTerm, {
        limit: 50,
        offset: 50,
        sort: "relevant",
      });

      expect(result).toEqual(expectedGifs);
    });
  });

  describe("getGifByCategory", () => {
    it("should return gifs by category", async () => {
      // Arrange
      const category = "test";
      const mockGifs = [
        {
          url: "url1",
          staticUrl: "staticUrl1",
          description: "description1",
          size: { height: "100", width: "100" },
          placeholderUrl: "placeholderUrl1",
          staticPlaceholderUrl: "staticPlaceholderUrl1",
        },
        // ...add more mock gifs as needed
      ];
      const exec = jest.fn().mockResolvedValue(mockGifs);
      const limitFields = jest.fn().mockReturnValue({ getQuery: () => ({ exec }) });
      const sort = jest.fn().mockReturnValue({ limitFields });
      const filter = jest.fn().mockReturnValue({ sort });
      (APIFeatures as jest.Mock).mockImplementation(() => ({ filter }));

      // Act
      const result = await gifService.getGifByCategory(category);

      // Assert
      expect(GifModel.find).toHaveBeenCalledWith();
      expect(APIFeatures).toHaveBeenCalledWith(GifModel.find(), {
        category,
        sort: "sortOrder",
        fields: "url,staticUrl,description,size,placeholderUrl,staticPlaceholderUrl",
      });
      expect(filter).toHaveBeenCalled();
      expect(sort).toHaveBeenCalled();
      expect(limitFields).toHaveBeenCalled();
      expect(exec).toHaveBeenCalled();
      expect(result).toEqual(mockGifs);
    });

    it("should throw an error if fetching gifs by category fails", async () => {
      // Arrange
      const category = "test";
      const exec = jest.fn().mockRejectedValue(new Error("Database error"));
      const limitFields = jest.fn().mockReturnValue({ getQuery: () => ({ exec }) });
      const sort = jest.fn().mockReturnValue({ limitFields });
      const filter = jest.fn().mockReturnValue({ sort });
      (APIFeatures as jest.Mock).mockImplementation(() => ({ filter }));

      // Act and Assert
      await expect(gifService.getGifByCategory(category)).rejects.toThrow("Database error");
    });
  });
});
