import localforage from "localforage";
import storage from "./localForageService";
import { vi, describe, it, expect, Mock } from "vitest";

vi.mock("localforage");

describe("Storage functions", () => {
  it("should set item correctly", async () => {
    storage.set("key", "value");
    expect(localforage.setItem).toHaveBeenCalledWith("key", "value");
  });

  it("should get item correctly", async () => {
    (localforage.getItem as Mock).mockResolvedValue("value");
    const val = await storage.get("key");
    expect(val).toEqual("value");
    expect(localforage.getItem).toHaveBeenCalledWith("key");
  });

  it("should return null if key does not exist", async () => {
    (localforage.getItem as Mock).mockResolvedValue(null);
    const val = await storage.get("key");
    expect(val).toBeNull();
  });

  it("should clear item correctly", () => {
    storage.clear("key");
    expect(localforage.removeItem).toHaveBeenCalledWith("key");
  });
});
