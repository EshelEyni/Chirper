import { NextFunction, Request, Response } from "express";
import { APIFeatures, QueryObj } from "../util/util.service";
// import { AppError, asyncErrorCatcher, validatePatchRequestBody } from "../error/error.service";
import { Model as ModelType } from "mongoose";
// import { logger } from "../logger/logger.service";
import { getAll } from "./factory.service";

jest.mock("express");
jest.mock("../util/util.service");
jest.mock("../error/error.service");
jest.mock("mongoose");
jest.mock("../logger/logger.service");

describe("Factory Service", () => {
  let req: Request;
  let res: Response;
  let next: NextFunction;
  let Model: ModelType<any>;

  function beforeEachFunc() {
    req = {} as Request;
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;
    next = jest.fn();
    Model = { find: jest.fn().mockReturnThis() } as any;

    (APIFeatures as jest.Mock).mockImplementation(() => ({
      filter: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      limitFields: jest.fn().mockReturnThis(),
      paginate: jest.fn().mockReturnThis(),
      getQuery: jest.fn().mockResolvedValue([]),
    }));
  }

  describe("getAll", () => {
    beforeEach(beforeEachFunc);

    it("should send a successful response with the result of the query", async () => {
      (req.query as QueryObj) = { sort: "name" };
      await getAll(Model)(req, res, next);

      expect(Model.find).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        requestedAt: expect.any(String),
        results: 0,
        data: [],
      });
    });
  });
});
