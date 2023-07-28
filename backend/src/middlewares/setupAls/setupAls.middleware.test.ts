import setupAsyncLocalStorage from "./setupAls.middleware";
import { asyncLocalStorage } from "../../services/als.service";
import tokenService from "../../services/token/token.service";
import { Request, Response, NextFunction } from "express";

jest.mock("../../services/als.service", () => ({
  asyncLocalStorage: {
    run: jest.fn(),
    getStore: jest.fn(),
  },
}));

jest.mock("../../services/token/token.service");

describe("SetupAsyncLocalStorage", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;
  let runCallback: any;

  beforeEach(() => {
    req = {};
    res = {};
    next = jest.fn();

    // Mock the run method of asyncLocalStorage and keep track of the callback for later
    asyncLocalStorage.run = jest.fn((storage, callback) => {
      runCallback = callback;
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should call next immediately if there is no token", async () => {
    tokenService.getTokenFromRequest.mockReturnValue(null);

    await setupAsyncLocalStorage(req as any, res as any, next);
    expect(next).toHaveBeenCalledTimes(1);
    expect(asyncLocalStorage.run).toHaveBeenCalledTimes(1);
  });

  it("should call next immediately if the token is not valid", async () => {
    tokenService.getTokenFromRequest.mockReturnValue("token");
    tokenService.verifyToken.mockResolvedValue(null);

    await setupAsyncLocalStorage(req as any, res as any, next);
    expect(next).toHaveBeenCalledTimes(1);
    expect(asyncLocalStorage.run).toHaveBeenCalledTimes(1);
  });

  it("should set loggedinUserId in the alsStore if the token is valid", async () => {
    const verifiedToken = { id: "userId" };

    tokenService.getTokenFromRequest.mockReturnValue("token");
    tokenService.verifyToken.mockResolvedValue(verifiedToken);

    await setupAsyncLocalStorage(req as any, res as any, next);

    // Run the callback manually with the mocked alsStore
    const alsStore: any = {};
    asyncLocalStorage.getStore = jest.fn().mockReturnValue(alsStore);
    await runCallback();

    expect(alsStore.loggedinUserId).toEqual("userId");
    expect(next).toHaveBeenCalledTimes(1);
  });
});
