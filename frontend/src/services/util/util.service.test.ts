/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  debounce,
  formatDateToCleanString,
  formatDateToRelativeTime,
  formatNumToK,
  getBasePathName,
  getTimeZone,
  handleServerResponse,
} from "./utils.service";

jest.useFakeTimers();

describe("Util Service", () => {
  describe("formatDateToRelativeTime", () => {
    const date = new Date();

    it("should return the now string if the Date is less than one second", () => {
      const formattedDate = formatDateToRelativeTime(date);
      expect(formattedDate).toBe("now");
    });

    it("should return the seconds if the Date is less than one minute", () => {
      date.setSeconds(date.getSeconds() - 10);
      const formattedDate = formatDateToRelativeTime(date);
      expect(formattedDate).toBe("10s");
    });

    it("should return the minutes if the Date is less than one hour", () => {
      date.setMinutes(date.getMinutes() - 10);
      const formattedDate = formatDateToRelativeTime(date);
      expect(formattedDate).toBe("10m");
    });

    it("should return the hours if the Date is less than one day", () => {
      date.setHours(date.getHours() - 10);
      const formattedDate = formatDateToRelativeTime(date);
      expect(formattedDate).toBe("10h");
    });

    it("should return the month and day if the Date is less than one year", () => {
      date.setDate(date.getDate() - 120);
      const month = date.toLocaleString("en", { month: "short" });
      const day = date.getDate();
      const formattedDate = formatDateToRelativeTime(date);
      expect(formattedDate).toBe(`${month} ${day}`);
    });

    it("should return the month, day, and year if the Date is greater than one year", () => {
      date.setDate(date.getDate() - 400);
      const year = date.getFullYear();
      const month = date.toLocaleString("en", { month: "short" });
      const day = date.getDate();
      const formattedDate = formatDateToRelativeTime(date);
      expect(formattedDate).toBe(`${month} ${day}, ${year}`);
    });
  });

  describe("formatDateToCleanString", () => {
    it("should correctly format a morning time", () => {
      const date = new Date("2023-09-10 09:05");
      expect(formatDateToCleanString(date)).toBe("9:05 AM · Sep 10, 2023");
    });

    it("should correctly format an afternoon time", () => {
      const date = new Date("2023-09-10 15:05");
      expect(formatDateToCleanString(date)).toBe("3:05 PM · Sep 10, 2023");
    });

    it("should correctly format a midnight time", () => {
      const date = new Date("2023-09-10 00:05");
      expect(formatDateToCleanString(date)).toBe("12:05 AM · Sep 10, 2023");
    });

    it("should correctly format a noon time", () => {
      const date = new Date("2023-09-10 12:05");
      expect(formatDateToCleanString(date)).toBe("12:05 PM · Sep 10, 2023");
    });

    it("should correctly format single-digit minutes", () => {
      const date = new Date("2023-09-10 12:05");
      expect(formatDateToCleanString(date)).toBe("12:05 PM · Sep 10, 2023");
    });

    it("should correctly format double-digit minutes", () => {
      const date = new Date("2023-09-10 12:15");
      expect(formatDateToCleanString(date)).toBe("12:15 PM · Sep 10, 2023");
    });
  });

  describe("formatNumToK", () => {
    it("should return the count if it is less than 1000", () => {
      const count = 178;
      const formattedCount = formatNumToK(count);
      expect(formattedCount).toBe("178");
    });

    it("should return the count if it is less than 10000", () => {
      const count = 1234;
      const formattedCount = formatNumToK(count);
      expect(formattedCount).toBe("1,234");
    });

    it("should return the count divided by 1000 and appended with k if it is greater than 10000", () => {
      const count = 20123;
      const formattedCount = formatNumToK(count);
      expect(formattedCount).toBe("20.1k");
    });
  });

  describe("debounce", () => {
    let func: jest.Mock;
    let debouncedFunc: any;
    let cancel: () => void;

    beforeEach(() => {
      func = jest.fn();
      const result = debounce(func, 500);
      debouncedFunc = result.debouncedFunc;
      cancel = result.cancel;
    });

    it("should not call the function immediately", () => {
      debouncedFunc();
      expect(func).not.toHaveBeenCalled();
    });

    it("should call the function after the delay", () => {
      debouncedFunc();
      jest.runAllTimers();
      expect(func).toHaveBeenCalled();
    });

    it("should not call the function if cancelled", () => {
      debouncedFunc();
      cancel();
      jest.runAllTimers();
      expect(func).not.toHaveBeenCalled();
    });

    it("should call the function only once for multiple calls within the delay", () => {
      debouncedFunc();
      debouncedFunc();
      debouncedFunc();
      jest.runAllTimers();
      expect(func).toHaveBeenCalledTimes(1);
    });

    it("should pass the latest arguments to the function", () => {
      debouncedFunc("firstCall");
      debouncedFunc("secondCall");
      jest.runAllTimers();
      expect(func).toHaveBeenCalledWith("secondCall");
    });
  });

  describe("getTimeZone", () => {
    it("should return a string", () => {
      const result = getTimeZone();
      expect(typeof result).toBe("string");
    });

    it("should not return an empty string", () => {
      const result = getTimeZone();
      expect(result).not.toBe("");
    });

    it('should return "Time Zone Not Found" if timeZoneName is undefined', () => {
      const originalDateTimeFormat = Intl.DateTimeFormat;
      Intl.DateTimeFormat = jest.fn().mockImplementation(() => ({
        resolvedOptions: jest.fn().mockReturnValue({ timeZone: "mockTimeZone" }),
        formatToParts: jest.fn().mockReturnValue([{ type: "unknown", value: "mockValue" }]),
        supportedLocalesOf: jest.fn(),
      })) as any;
      const result = getTimeZone();
      expect(result).toBe("Time Zone Not Found");
      Intl.DateTimeFormat = originalDateTimeFormat;
    });
  });

  describe("handleServerResponse", () => {
    it('should return data when status is "success"', () => {
      const response = { status: "success", data: "some data" };
      const result = handleServerResponse(response);
      expect(result).toBe("some data");
    });

    it('should throw an error with field messages when status is "fail"', () => {
      const response = { status: "fail", data: { field1: "error1", field2: "error2" } };
      expect(() => handleServerResponse(response)).toThrowError("field1: error1, field2: error2");
    });

    it("should throw an error for unexpected status", () => {
      const response = { status: "unknown", data: "some data" };
      expect(() => handleServerResponse(response)).toThrowError("Unexpected response status");
    });

    it("should handle generic types", () => {
      const response = { status: "success", data: { key: "value" } };
      const result = handleServerResponse<{ key: string }>(response);
      expect(result).toEqual({ key: "value" });
    });
  });

  describe("getParentPathName", () => {
    it("should return the parent path name when there are no params", () => {
      const path = "/home/chirper-circle";
      const basePath = getBasePathName(path, "chirper-circle");
      expect(basePath).toBe("/home");
    });

    it("should return the parent path name when there are params", () => {
      const path = "/home/post-stats/:postId";
      const basePath = getBasePathName(path, "post-stats");
      expect(basePath).toBe("/home");
    });

    it("should return the parent path name when there are params", () => {
      const path = "/profile/eshel23/post-stats/:postId";
      const basePath = getBasePathName(path, "post-stats");
      expect(basePath).toBe("/profile/eshel23");
    });

    it("should return the home path when there is an error in currNestedPath", () => {
      const path = "/profile/eshel23/post-stats/:postId";
      const basePath = getBasePathName(path, "fake-path");
      expect(basePath).toBe("/home");
    });
  });
});
