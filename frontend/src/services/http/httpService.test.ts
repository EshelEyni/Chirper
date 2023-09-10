import axios from "axios";
import httpService from "./httpService";
import { vi, describe, it, expect, beforeAll, afterEach, Mocked, Mock } from "vitest";

const isProd = process.env.NODE_ENV === "production";
const BASE_URL = isProd ? "/api/" : "http://localhost:3030/api/";

describe("httpService", () => {
  let axiosMock: Mocked<typeof axios>;

  beforeAll(() => {
    axiosMock = vi.fn(axios);
  });

  afterEach(() => {
    // axiosMock.reset();
  });

  describe("get", () => {
    it.only("should call axios.get with the correct params", async () => {
      const endpoint = "endpoint";
      const data = { a: "a" };
      const res = { data: "data" };
      (axiosMock as any as Mock).mockResolvedValue(res);
      const actual = await httpService.get(endpoint, data);
      expect(axiosMock.get).toHaveBeenCalledWith(`${BASE_URL}${endpoint}`, { params: data });
      expect(actual).toEqual(res.data);
    });
  });

  describe("post", () => {
    it("should call axios.post with the correct params", async () => {
      const endpoint = "endpoint";
      const data = { a: "a" };
      const res = { data: "data" };
      axiosMock.post.mockResolvedValue(res);
      const actual = await httpService.post(endpoint, data);
      expect(axiosMock.post).toHaveBeenCalledWith(`${BASE_URL}${endpoint}`, data);
      expect(actual).toEqual(res.data);
    });
  });
  describe("put", () => {
    it("should call axios.put with the correct params", async () => {
      const endpoint = "endpoint";
      const data = { a: "a" };
      const res = { data: "data" };
      axiosMock.put.mockResolvedValue(res);
      const actual = await httpService.put(endpoint, data);
      expect(axiosMock.put).toHaveBeenCalledWith(`${BASE_URL}${endpoint}`, data);
      expect(actual).toEqual(res.data);
    });
  });
  describe("patch", () => {
    it("should call axios.patch with the correct params", async () => {
      const endpoint = "endpoint";
      const data = { a: "a" };
      const res = { data: "data" };
      axiosMock.patch.mockResolvedValue(res);
      const actual = await httpService.patch(endpoint, data);
      expect(axiosMock.patch).toHaveBeenCalledWith(`${BASE_URL}${endpoint}`, data);
      expect(actual).toEqual(res.data);
    });
  });
  describe("delete", () => {
    it("should call axios.delete with the correct params", async () => {
      const endpoint = "endpoint";
      const data = { a: "a" };
      const res = { data: "data" };
      axiosMock.delete.mockResolvedValue(res);
      const actual = await httpService.delete(endpoint, data);
      expect(axiosMock.delete).toHaveBeenCalledWith(`${BASE_URL}${endpoint}`, { data });
      expect(actual).toEqual(res.data);
    });
  });
});
