import { vi, describe, it, expect, beforeEach, Mock } from "vitest";
import localForageService from "../localForage/localForageService";
import cacheService from "./cacheService";

const TWO_MINUTES_IN_MILLIS = 1000 * 60 * 2;

vi.mock("../localForage/localForageService");

describe("cacheService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should set data into storage", () => {
    cacheService.set("key", "value");
    expect(localForageService.set).toHaveBeenCalledWith("key", {
      data: "value",
      cachedAt: expect.any(Number),
    });
  });

  it("should get data from storage if not expired", async () => {
    const currentTime = Date.now();
    const cachedData = { cachedAt: currentTime, data: "value" };
    (localForageService.get as Mock).mockReturnValue(cachedData);

    const result = await cacheService.get("key", 1);
    expect(result).toBe("value");
  });

  it("should return null if data is expired", async () => {
    const currentTime = Date.now() - TWO_MINUTES_IN_MILLIS;
    const cachedData = { cachedAt: currentTime, data: "value" };
    (localForageService.get as Mock).mockReturnValue(cachedData);

    const result = await cacheService.get("key", 1);
    expect(result).toBeNull();
  });

  it("should clear expired data from storage", async () => {
    const currentTime = Date.now() - TWO_MINUTES_IN_MILLIS;
    const cachedData = { cachedAt: currentTime, data: "value" };
    (localForageService.get as Mock).mockReturnValue(cachedData);

    await cacheService.get("key", 1);
    expect(localForageService.clear).toHaveBeenCalledWith("key");
  });

  it("should return null if no data is found", async () => {
    (localForageService.get as Mock).mockReturnValue(null);

    const result = await cacheService.get("key", 1);
    expect(result).toBeNull();
  });
});
