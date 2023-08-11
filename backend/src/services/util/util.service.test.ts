import { Model, Query } from "mongoose";
import {
  APIFeatures,
  AnyObject,
  QueryObj,
  filterObj,
  queryEntityExists,
  sendEmail,
  isValidMongoId,
} from "./util.service";
import config from "../../config/index";
import nodemailer from "nodemailer";

jest.mock("nodemailer", () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue(true),
  }),
}));

describe("Util Service", () => {
  describe("filterObj", () => {
    let testObj: AnyObject;

    beforeEach(() => {
      testObj = {
        a: 1,
        b: 2,
        c: 3,
        d: 4,
      };
    });

    it("should return the object as is if no fields are specified", () => {
      const result = filterObj(testObj);
      expect(result).toEqual(testObj);
    });

    it("should return an object with only the specified fields", () => {
      const result = filterObj(testObj, "a", "c");
      const expectedResult = { a: 1, c: 3 };
      expect(result).toEqual(expectedResult);
    });

    it("should return an empty object if none of the fields are allowed", () => {
      const result = filterObj(testObj, "e", "f");
      const expectedResult = {};
      expect(result).toEqual(expectedResult);
    });
  });

  describe("APIFeatures", () => {
    let apiFeatures: APIFeatures<any>;
    let mockQuery: Query<any[], any>;
    let mockQueryObj: QueryObj;

    function setMocks() {
      mockQuery = {
        find: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
      } as unknown as Query<any[], any>;

      mockQueryObj = {
        page: "1",
        sort: "field",
        limit: "10",
        fields: "field1,field2",
        gte: "10",
      };

      apiFeatures = new APIFeatures(mockQuery, mockQueryObj);
    }

    describe("constructor", () => {
      beforeEach(setMocks);

      it("should create an instance of APIFeatures", () => {
        expect(apiFeatures).toBeInstanceOf(APIFeatures);
      });
    });

    describe("filter", () => {
      beforeEach(setMocks);

      it("should filter query based on queryString and return updated APIFeatures instance", () => {
        const apiFeaturesFiltered = apiFeatures.filter();

        expect(mockQuery.find).toBeCalled();
        expect(apiFeaturesFiltered).toBeInstanceOf(APIFeatures);
      });

      it("should correctly parse the query string and call find with the parsed query", () => {
        const expectedQueryObj: QueryObj = { ...mockQueryObj };
        const excludedFields = ["page", "sort", "limit", "fields"];
        excludedFields.forEach(el => delete expectedQueryObj[el]);
        const expectedQueryStr = JSON.stringify(expectedQueryObj).replace(
          /\b(gte|gt|lte|lt|exists)\b/g,
          match => `$${match}`
        );

        apiFeatures.filter();
        expect(mockQuery.find).toHaveBeenCalledWith(JSON.parse(expectedQueryStr));
      });
    });

    describe("sort", () => {
      beforeEach(setMocks);

      it("should sort query based on queryString and return updated APIFeatures instance", () => {
        const apiFeaturesSorted = apiFeatures.sort();

        expect(mockQuery.sort).toBeCalled();
        expect(apiFeaturesSorted).toBeInstanceOf(APIFeatures);
      });

      it("should sort query by createdAt and _id if no sort is specified", () => {
        delete mockQueryObj.sort;
        apiFeatures.sort();
        expect(mockQuery.sort).toHaveBeenCalledWith("-createdAt _id");
      });

      it("should sort query by the specified field", () => {
        const expectedSortBy = mockQueryObj.sort;
        apiFeatures.sort();
        expect(mockQuery.sort).toHaveBeenCalledWith(expectedSortBy);
      });
    });

    describe("limitFields", () => {
      beforeEach(setMocks);

      it("should limit fields based on queryString and return updated APIFeatures instance", () => {
        const apiFeaturesLimited = apiFeatures.limitFields();

        expect(mockQuery.select).toBeCalled();
        expect(apiFeaturesLimited).toBeInstanceOf(APIFeatures);
      });

      it("should limit fields by the specified fields", () => {
        const expectedFields = mockQueryObj.fields!.split(",").join(" ");
        apiFeatures.limitFields();
        expect(mockQuery.select).toHaveBeenCalledWith(expectedFields);
      });

      it("should limit fields by default if no fields are specified", () => {
        delete mockQueryObj.fields;
        apiFeatures.limitFields();
        expect(mockQuery.select).toHaveBeenCalledWith("-__v");
      });
    });

    describe("paginate", () => {
      beforeEach(setMocks);

      it("should paginate based on queryString and return updated APIFeatures instance", () => {
        const apiFeaturesPaginated = apiFeatures.paginate();

        expect(mockQuery.skip).toBeCalled();
        expect(mockQuery.limit).toBeCalled();
        expect(apiFeaturesPaginated).toBeInstanceOf(APIFeatures);
      });

      it("should paginate by the specified page and limit", () => {
        const expectedPage = parseInt(mockQueryObj.page!);
        const expectedLimit = parseInt(mockQueryObj.limit!);
        const expectedSkip = (expectedPage - 1) * expectedLimit;

        apiFeatures.paginate();
        expect(mockQuery.skip).toHaveBeenCalledWith(expectedSkip);
        expect(mockQuery.limit).toHaveBeenCalledWith(expectedLimit);
      });

      it("should paginate by default if no page and limit are specified", () => {
        delete mockQueryObj.page;
        delete mockQueryObj.limit;
        const defaultPage = 1;
        const defaultLimit = 100;
        const expectedSkip = (defaultPage - 1) * defaultLimit;

        apiFeatures.paginate();
        expect(mockQuery.skip).toHaveBeenCalledWith(expectedSkip);
        expect(mockQuery.limit).toHaveBeenCalledWith(defaultLimit);
      });
    });

    describe("getQuery", () => {
      beforeEach(setMocks);

      it("should return the query", () => {
        const result = apiFeatures.getQuery();
        expect(result).toEqual(mockQuery);
      });
    });
  });

  describe("sendMail", () => {
    it("should send email with provided options", async () => {
      const options = {
        email: "test@test.com",
        subject: "Test Subject",
        message: "Test Message",
      };

      const transportMock = nodemailer.createTransport as jest.Mock;
      const sendMailMock = transportMock().sendMail as jest.Mock;

      await sendEmail(options);

      expect(transportMock).toBeCalledWith({
        host: config.emailHost,
        port: config.emailPort,
        auth: {
          user: config.emailUsername,
          pass: config.emailPassword,
        },
      });

      expect(sendMailMock).toBeCalledWith({
        from: "Chirper <Chirper.com>",
        to: options.email,
        subject: options.subject,
        text: options.message,
      });
    });
  });

  describe("queryEntityExists", () => {
    let mockModel: Model<any> & { exists: jest.Mock };

    beforeEach(() => {
      mockModel = { exists: jest.fn() } as unknown as Model<any> & { exists: jest.Mock };
    });

    it("should return true if entity exists", async () => {
      mockModel.exists.mockResolvedValue(true);
      const result = await queryEntityExists(mockModel, { _id: "someId" });

      expect(result).toBe(true);
      expect(mockModel.exists).toHaveBeenCalledWith({ _id: "someId" });
    });

    it("should return false if entity does not exist", async () => {
      mockModel.exists.mockResolvedValue(false);
      const result = await queryEntityExists(mockModel, { _id: "someId" });

      expect(result).toBe(false);
      expect(mockModel.exists).toHaveBeenCalledWith({ _id: "someId" });
    });
  });

  describe("isValidMongoId", () => {
    const invalidIds = [
      { id: "Questions/0000000000000003599-A", type: "RavenDB Id" },
      { id: "550e8400-e29b-41d4-a716-446655440000", type: "UUID" },
      { id: "1234567890", type: "Numeric Id" },
      { id: "abcd1234", type: "Alphanumeric Id" },
      { id: "Zm9vYmFy", type: "Base64 Id" },
      { id: "foo-bar", type: "Slug Id" },
      { id: "123e4567-e89b-12d3-a456-426614174000", type: "GUID" },
      { id: "1DVZDJJY", type: "Short Id" },
      { id: "123-456-789", type: "Hyphenated Id" },
    ];

    it("should return true if id is valid", () => {
      const result = isValidMongoId("5e9d2d7f3c9d440000a1d3b0");
      expect(result).toBe(true);
    });

    it("should return false if id is invalid", () => {
      const result = isValidMongoId("invalidId");
      expect(result).toBe(false);
    });

    it("should return false if id is empty", () => {
      const result = isValidMongoId("");
      expect(result).toBe(false);
    });

    it.each(invalidIds)("should return false if id is of type: $type", invalidId => {
      const result = isValidMongoId(invalidId.id);
      expect(result).toBe(false);
    });
  });
});
