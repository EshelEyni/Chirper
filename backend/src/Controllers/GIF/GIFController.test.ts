/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from "express";
import { getGifsBySearchTerm } from "./GIFController";
import gifService from "../../services/GIF/GIFService";
import { AppError, asyncErrorCatcher } from "../../services/error/errorService";

jest.mock("../../services/GIF/GIFService");
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

describe("Gif Controller", () => {
  describe("getGifsBySearchTerm", () => {
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

    it("should throw an error if no search term is provided", async () => {
      const sut = getGifsBySearchTerm as any;
      await sut(req as Request, res as Response, next);
      expect(next).toHaveBeenCalledWith(expect.any(AppError));
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 400,
          status: "fail",
          message: "No search term provided",
        })
      );
    });

    it("should call getGifByCategory if the search term is a category", async () => {
      req.query!.searchTerm = "Agree";
      (gifService.getGifFromDB as jest.Mock).mockResolvedValue([]);
      const sut = getGifsBySearchTerm as any;
      await sut(req as Request, res as Response, next);
      expect(gifService.getGifFromDB).toHaveBeenCalledWith("Agree");
    });

    it("should call getGifsBySearchTerm if the search term is not a category", async () => {
      req.query!.searchTerm = "NotACategory";
      (gifService.getGifsBySearchTerm as jest.Mock).mockResolvedValue([]);
      const sut = getGifsBySearchTerm as any;
      await sut(req as Request, res as Response, next);
      expect(gifService.getGifsBySearchTerm).toHaveBeenCalledWith("NotACategory");
    });

    it("should send a response with the gifs", async () => {
      req.query!.searchTerm = "Agree";
      const mockGifs = [
        { id: "1", url: "url1" },
        { id: "2", url: "url2" },
      ];
      (gifService.getGifFromDB as jest.Mock).mockResolvedValue(mockGifs);
      const sut = getGifsBySearchTerm as any;
      await sut(req as Request, res as Response, next);
      expect(res.send).toHaveBeenCalledWith({
        status: "success",
        requestedAt: expect.any(String),
        results: mockGifs.length,
        data: mockGifs,
      });
    });
  });
});

/*
Note: getGifCategories and getGifFromDB are not tested because they were tested in the factory test file.
*/
