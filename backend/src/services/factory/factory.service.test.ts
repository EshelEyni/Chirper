/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from "express";
import { APIFeatures } from "../util/util.service";
import { Model } from "mongoose";
import { getAll, getOne } from "./factory.service";
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

  it("should return status 200", async () => {
    const controller = getAll(ModelMock) as any;
    await controller(reqMock, resMock, nextMock);
    expect(resMock.status).toHaveBeenCalledWith(200);
  });

  it("should return success status", async () => {
    const controller = getAll(ModelMock) as any;
    await controller(reqMock, resMock, nextMock);
    expect(resMock.json).toHaveBeenCalledWith(expect.objectContaining({ status: "success" }));
  });

  it("should return requestedAt in response", async () => {
    const controller = getAll(ModelMock) as any;
    await controller(reqMock, resMock, nextMock);
    expect(resMock.json).toHaveBeenCalledWith(
      expect.objectContaining({ requestedAt: expect.any(String) })
    );
  });

  it("should return a valid timestamp in requestedAt", async () => {
    const controller = getAll(ModelMock) as any;
    await controller(reqMock, resMock, nextMock);
    expect(resMock.json).toHaveBeenCalledWith(
      expect.objectContaining({
        requestedAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/),
      })
    );
  });

  it("should integrate getAll and APIFeatures correctly", async () => {
    const mockData = [1, 2, 3];
    APIFeaturesMock.getQuery.mockReturnValue(Promise.resolve(mockData) as any);
    const controller = getAll(ModelMock) as any;
    await controller(reqMock, resMock, nextMock);

    expect(resMock.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "success",
        results: mockData.length,
        data: mockData,
      })
    );
  });

  it("should pass the error to next if getQuery fails", async () => {
    const mockError = new Error("getQuery failed");
    APIFeaturesMock.getQuery.mockImplementation(() => {
      throw mockError;
    });
    const controller = getAll(ModelMock) as any;
    await controller(reqMock, resMock, nextMock);
    expect(nextMock).toHaveBeenCalledWith(mockError);
  });
});

describe.only("getOne", () => {
  afterEach(() => {
    mockReset(ModelMock);
    mockReset(reqMock);
    mockReset(resMock);
  });

  it("should return the correct document when a valid id is given", async () => {
    const id = "1234567890";
    reqMock.params.id = id;
    const mockData = { _id: id, name: "Item" };
    ModelMock.findById.mockReturnValue(Promise.resolve(mockData) as any);
    const controller = getOne(ModelMock) as any;
    await controller(reqMock, resMock, nextMock);

    expect(ModelMock.findById).toHaveBeenCalledWith(id);
    expect(resMock.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "success",
        data: mockData,
      })
    );
  });

  it("should return status 404 when the document is not found", async () => {
    const id = "1234567890";
    reqMock.params.id = id;
    ModelMock.findById.mockReturnValue(Promise.resolve(null) as any);
    const controller = getOne(ModelMock) as any;
    await controller(reqMock, resMock, nextMock);

    expect(ModelMock.findById).toHaveBeenCalledWith(id);
    expect(nextMock).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 404,
        message: expect.any(String),
      })
    );
  });

  it.only("should populate the document if popOptions are given", async () => {
    const id = "1234567890";
    reqMock.params.id = id;
    const popOptions = "user";
    const mockData = { _id: id, name: "Item" };
    ModelMock.findById.mockReturnValue(Promise.resolve(mockData) as any);
    const controller = getOne(ModelMock, popOptions) as any;
    await controller(reqMock, resMock, nextMock);

    expect(ModelMock.findById).toHaveBeenCalledWith(id);
    expect(ModelMock.findById(id).populate).toHaveBeenCalledWith(popOptions);
    expect(resMock.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "success",
        data: mockData,
      })
    );
  });
});
