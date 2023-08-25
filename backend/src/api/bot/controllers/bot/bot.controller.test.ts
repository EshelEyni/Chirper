import { NextFunction, Request, Response } from "express";
import botService from "../../services/bot/bot.service";
import { getMockedUser } from "../../../../services/test-util.service";
import { getBots } from "./bot.controller";
import { asyncErrorCatcher } from "../../../../services/error/error.service";

jest.mock("../../services/bot/bot.service");

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

describe("Bot Controller", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;

  describe("getBots", () => {
    beforeEach(() => {
      req = { query: {} };
      res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it("should return 200 and a list of bots", async () => {
      const mockUsers = Array(3)
        .fill(null)
        .map(_ => getMockedUser({ isBot: true }));

      (botService.getBots as jest.Mock).mockResolvedValueOnce(mockUsers);

      const sut = getBots as any;
      await sut(req, res);

      expect(res.send).toHaveBeenCalledWith({
        status: "success",
        requestedAt: expect.any(String),
        results: mockUsers.length,
        data: mockUsers,
      });
    });

    it("should return 500 if botService.getBots throws", async () => {
      const mockError = new Error("Test error");

      (botService.getBots as jest.Mock).mockImplementationOnce(() => {
        throw mockError;
      });

      const sut = getBots as any;
      await sut(req, res, nextMock);

      expect(nextMock).toHaveBeenCalledWith(mockError);
      expect(res.send).not.toHaveBeenCalled();
    });
  });
});
