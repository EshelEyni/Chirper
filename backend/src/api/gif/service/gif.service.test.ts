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

  describe("getGifFromDB", () => {
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
      ];
      // const exec = jest.fn().mockResolvedValue(mockGifs);
      // const limitFields = jest.fn().mockReturnValue({ getQuery: () => ({ exec }) });
      // const sort = jest.fn().mockReturnValue({ limitFields });
      // const filter = jest.fn().mockReturnValue({ sort });
      // (APIFeatures as jest.Mock).mockImplementation(() => ({ filter }));

      const mockQueryObj = {
        filter: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        limitFields: jest.fn().mockReturnThis(),
        getQuery: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockGifs),
      };

      const mockAPIFeatures = jest.fn().mockImplementation(() => mockQueryObj);
      (APIFeatures as jest.Mock).mockImplementation(mockAPIFeatures);

      // Act
      const result = await gifService.getGifFromDB(category);

      // Assert
      expect(GifModel.find).toHaveBeenCalledWith();
      expect(APIFeatures).toHaveBeenCalledWith(GifModel.find(), {
        category,
        sort: "sortOrder",
        fields: "url,staticUrl,description,size,placeholderUrl,staticPlaceholderUrl",
      });
      expect(mockQueryObj.filter).toHaveBeenCalled();
      expect(mockQueryObj.sort).toHaveBeenCalled();
      expect(mockQueryObj.limitFields).toHaveBeenCalled();
      expect(mockQueryObj.exec).toHaveBeenCalled();
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
      await expect(gifService.getGifFromDB(category)).rejects.toThrow("Database error");
    });
  });
});