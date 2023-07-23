/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from "express";
import { APIFeatures } from "../util/util.service";
import { Model } from "mongoose";
import { getAll } from "./factory.service";
import { DeepMockProxy, mockDeep, mockReset } from "jest-mock-extended";
import { asyncErrorCatcher } from "../error/error.service";

const ModelMock = mockDeep<Model<any>>();
const APIFeaturesMock = mockDeep<APIFeatures<any>>();
APIFeaturesMock.filter.mockReturnThis();
APIFeaturesMock.sort.mockReturnThis();
APIFeaturesMock.limitFields.mockReturnThis();
APIFeaturesMock.paginate.mockReturnThis();
APIFeaturesMock.getQuery.mockReturnValue(Promise.resolve([]) as any);

const reqMock = mockDeep<Request>();
reqMock.query = {};

const resMock: DeepMockProxy<Response> = mockDeep<Response>();
resMock.status.mockReturnValue(resMock);
resMock.json.mockReturnThis();
const nextMock = jest.fn() as jest.MockedFunction<NextFunction>;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
(asyncErrorCatcher as jest.Mock) = jest.fn().mockImplementation(fn => {
  return async (...args: any[]) => {
    try {
      return await fn(...args);
    } catch (error) {
      return nextMock(error);
    }
  };
});

jest.mock("../util/util.service", () => {
  return {
    APIFeatures: jest.fn().mockImplementation(() => APIFeaturesMock),
  };
});

describe("getAll", () => {
  afterEach(() => {
    mockReset(ModelMock);
    mockReset(APIFeaturesMock);
  });

  it("should call getQuery method", async () => {
    const controller = getAll(ModelMock) as any;
    expect(controller).toBeDefined();
    await controller(reqMock, resMock, nextMock);
    expect(APIFeaturesMock.getQuery).toHaveBeenCalled();
  });

  it.only("should call the error handler when Model.find() fails", done => {
    ModelMock.find.mockImplementation((): any => {
      return Promise.reject(new Error("Test Error"));
    });
    const controller = getAll(ModelMock) as any;

    (async () => {
      try {
        await controller(reqMock, resMock, nextMock);
        expect(false).toBe(true);
        done();
      } catch (error) {
        expect(error).toEqual(new Error("Test Error"));
        done();
      }
    })();
  });

  it("should call the error handler when getQuery throws an error", async () => {
    APIFeaturesMock.getQuery.mockImplementation(() => {
      throw new Error("Test Error");
    });
    const controller = getAll(ModelMock);
    await controller(reqMock, resMock, nextMock);
    expect(nextMock).toHaveBeenCalledWith(new Error("Test Error"));
  });

  it("should handle different queries properly", async () => {
    reqMock.query = { sort: "name", limit: "10", page: "2" };
    const controller = getAll(ModelMock);
    await controller(reqMock, resMock, nextMock);
    expect(APIFeaturesMock.sort).toHaveBeenCalledWith("name");
    expect(APIFeaturesMock.limitFields).toHaveBeenCalledWith("10");
    expect(APIFeaturesMock.paginate).toHaveBeenCalled();
  });

  it("should handle the case when no documents are found", async () => {
    APIFeaturesMock.getQuery.mockReturnValue(Promise.resolve([]) as any);
    const controller = getAll(ModelMock);
    await controller(reqMock, resMock, nextMock);
    expect(resMock.status).toHaveBeenCalledWith(200);
    expect(resMock.json).toHaveBeenCalledWith({
      status: "success",
      requestedAt: expect.any(String),
      results: 0,
      data: [],
    });
  });

  it("should ignore unrecognized query parameters", async () => {
    reqMock.query = { unrecognized: "parameter" };
    const controller = getAll(ModelMock);
    await controller(reqMock, resMock, nextMock);
    expect(APIFeaturesMock.filter).toHaveBeenCalled();
  });
});
