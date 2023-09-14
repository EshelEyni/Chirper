/* eslint-disable @typescript-eslint/no-explicit-any */
import { vi, describe, it, expect, beforeEach, Mock } from "vitest";
import {
  debounce,
  formatDateToCleanString,
  formatDateToRelativeTime,
  formatNumToK,
  getBasePathName,
  getTimeZone,
  handleServerResponseData,
} from "./utilService";

vi.useFakeTimers();

describe("Util Service", () => {
  describe("formatDateToRelativeTime", () => {
    const date = new Date();

    it("should return an empty string if the Date is null", () => {
      const formattedDate = formatDateToRelativeTime(null as any);
      expect(formattedDate).toBe("");
    });

    it("should return an empty string if the Date is invalid", () => {
      const formattedDate = formatDateToRelativeTime("invalid date");
      expect(formattedDate).toBe("");
    });

    it("should return the now string if the Date is less than one second", () => {
      const formattedDate = formatDateToRelativeTime(date.toString());
      expect(formattedDate).toBe("now");
    });

    it("should return the seconds if the Date is less than one minute", () => {
      date.setSeconds(date.getSeconds() - 10);
      const formattedDate = formatDateToRelativeTime(date.toString());
      expect(formattedDate).toBe("10s");
    });

    it("should return the minutes if the Date is less than one hour", () => {
      date.setMinutes(date.getMinutes() - 10);
      const formattedDate = formatDateToRelativeTime(date.toString());
      expect(formattedDate).toBe("10m");
    });

    it("should return the hours if the Date is less than one day", () => {
      date.setHours(date.getHours() - 10);
      const formattedDate = formatDateToRelativeTime(date.toString());
      expect(formattedDate).toBe("10h");
    });

    it("should return the month and day if the Date is less than one year", () => {
      date.setDate(date.getDate() - 120);
      const month = date.toLocaleString("en", { month: "short" });
      const day = date.getDate();
      const formattedDate = formatDateToRelativeTime(date.toString());
      expect(formattedDate).toBe(`${month} ${day}`);
    });

    it("should return the month, day, and year if the Date is greater than one year", () => {
      date.setDate(date.getDate() - 400);
      const year = date.getFullYear();
      const month = date.toLocaleString("en", { month: "short" });
      const day = date.getDate();
      const formattedDate = formatDateToRelativeTime(date.toString());
      expect(formattedDate).toBe(`${month} ${day}, ${year}`);
    });
  });

  describe("formatDateToCleanString", () => {
    it("should return an empty string if the Date is null", () => {
      const formattedDate = formatDateToCleanString(null as any);
      expect(formattedDate).toBe("");
    });

    it("should return an empty string if the Date is invalid", () => {
      const formattedDate = formatDateToCleanString("invalid date");
      expect(formattedDate).toBe("");
    });

    it("should correctly format a morning time", () => {
      const date = "2023-09-10 09:05";
      const formattedDate = formatDateToCleanString(date);
      expect(formattedDate).toBe("9:05 AM · Sep 10, 2023");
    });

    it("should correctly format an afternoon time", () => {
      const date = "2023-09-10 15:05";
      const formattedDate = formatDateToCleanString(date);

      expect(formattedDate).toBe("3:05 PM · Sep 10, 2023");
    });

    it("should correctly format a midnight time", () => {
      const date = "2023-09-10 00:05";
      const formattedDate = formatDateToCleanString(date);

      expect(formattedDate).toBe("12:05 AM · Sep 10, 2023");
    });

    it("should correctly format a noon time", () => {
      const date = "2023-09-10 12:05";
      const formattedDate = formatDateToCleanString(date);

      expect(formattedDate).toBe("12:05 PM · Sep 10, 2023");
    });

    it("should correctly format single-digit minutes", () => {
      const date = "2023-09-10 12:05";
      const formattedDate = formatDateToCleanString(date);

      expect(formattedDate).toBe("12:05 PM · Sep 10, 2023");
    });

    it("should correctly format double-digit minutes", () => {
      const date = "2023-09-10 12:15";
      const formattedDate = formatDateToCleanString(date);

      expect(formattedDate).toBe("12:15 PM · Sep 10, 2023");
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
    let func: Mock;
    let debouncedFunc: any;
    let cancel: () => void;

    beforeEach(() => {
      func = vi.fn();
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
      vi.runAllTimers();
      expect(func).toHaveBeenCalled();
    });

    it("should not call the function if cancelled", () => {
      debouncedFunc();
      cancel();
      vi.runAllTimers();
      expect(func).not.toHaveBeenCalled();
    });

    it("should call the function only once for multiple calls within the delay", () => {
      debouncedFunc();
      debouncedFunc();
      debouncedFunc();
      vi.runAllTimers();
      expect(func).toHaveBeenCalledTimes(1);
    });

    it("should pass the latest arguments to the function", () => {
      debouncedFunc("firstCall");
      debouncedFunc("secondCall");
      vi.runAllTimers();
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
      Intl.DateTimeFormat = vi.fn().mockImplementation(() => ({
        resolvedOptions: vi.fn().mockReturnValue({ timeZone: "mockTimeZone" }),
        formatToParts: vi.fn().mockReturnValue([{ type: "unknown", value: "mockValue" }]),
        supportedLocalesOf: vi.fn(),
      })) as any;
      const result = getTimeZone();
      expect(result).toBe("Time Zone Not Found");
      Intl.DateTimeFormat = originalDateTimeFormat;
    });
  });

  describe("handleServerResponseData", () => {
    it('should return data when status is "success"', () => {
      const response = { status: "success", data: "some data" };
      const result = handleServerResponseData(response);
      expect(result).toBe("some data");
    });

    it('should throw an error with field messages when status is "fail"', () => {
      const response = { status: "fail", data: { field1: "error1", field2: "error2" } };
      expect(() => handleServerResponseData(response)).toThrowError(
        "field1: error1, field2: error2"
      );
    });

    it("should throw an error for unexpected status", () => {
      const response = { status: "unknown", data: "some data" };
      expect(() => handleServerResponseData(response)).toThrowError("Unexpected response status");
    });

    it("should handle generic types", () => {
      const response = { status: "success", data: { key: "value" } };
      const result = handleServerResponseData<{ key: string }>(response);
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
