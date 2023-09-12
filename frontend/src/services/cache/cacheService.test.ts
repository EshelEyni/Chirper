import { vi, describe, it, expect, beforeEach, Mock } from "vitest";
import storageService from "../storageService";
import cacheService from "./cacheService";

const TWO_MINUTES_IN_MILLIS = 1000 * 60 * 2;

vi.mock("../storageService");

describe("cacheService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should set data into storage", () => {
    cacheService.set("key", "value");
    expect(storageService.set).toHaveBeenCalledWith("key", "value");
  });

  it("should get data from storage if not expired", () => {
    const currentTime = Date.now();
    const cachedData = { cachedAt: currentTime, data: "value" };
    (storageService.get as Mock).mockReturnValue(cachedData);

    const result = cacheService.get("key", 1);
    expect(result).toBe("value");
  });

  it("should return null if data is expired", () => {
    const currentTime = Date.now() - TWO_MINUTES_IN_MILLIS;
    const cachedData = { cachedAt: currentTime, data: "value" };
    (storageService.get as Mock).mockReturnValue(cachedData);

    const result = cacheService.get("key", 1);
    expect(result).toBeNull();
  });

  it("should clear expired data from storage", () => {
    const currentTime = Date.now() - TWO_MINUTES_IN_MILLIS;
    const cachedData = { cachedAt: currentTime, data: "value" };
    (storageService.get as Mock).mockReturnValue(cachedData);

    cacheService.get("key", 1);
    expect(storageService.clear).toHaveBeenCalledWith("key");
  });

  it("should return null if no data is found", () => {
    (storageService.get as Mock).mockReturnValue(null);

    const result = cacheService.get("key", 1);
    expect(result).toBeNull();
  });
});
