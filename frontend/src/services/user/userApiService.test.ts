/* eslint-disable @typescript-eslint/no-explicit-any */
import { vi, describe, it, expect, Mock } from "vitest";
import userApiService from "./userApiService";
import httpService from "../http/httpService";
import { JsendResponse } from "../../../../shared/types/system";

vi.mock("../http/httpService");

describe("userApiService", () => {
  describe("query", () => {
    it("returns correct response", async () => {
      const response: JsendResponse = {
        status: "success",
        data: [{ id: "123", username: "test", email: "test@email.com" }],
      };

      (httpService.get as Mock).mockReturnValueOnce(response);
      const result = await userApiService.query();
      expect(result).toEqual(response.data);
      expect(httpService.get).toHaveBeenCalledWith("user");
    });

    it("should throw an error when the server responds with an error", async () => {
      const mockError = new Error("Server Error");

      (httpService.get as Mock).mockRejectedValue(mockError);
      await expect(userApiService.query()).rejects.toThrow(mockError);
    });
  });

  describe("getById", () => {
    it("returns correct response", async () => {
      const userId = "123";
      const response: JsendResponse = {
        status: "success",
        data: { id: userId, username: "test", email: "test@email.com" },
      };

      (httpService.get as Mock).mockReturnValueOnce(response);
      const result = await userApiService.getById(userId);
      expect(result).toEqual(response.data);
      expect(httpService.get).toHaveBeenCalledWith(`user/${userId}`);
    });

    it("should throw an error when the server responds with an error", async () => {
      const mockError = new Error("Server Error");
      const userId = "123";
      (httpService.get as Mock).mockRejectedValue(mockError);
      await expect(userApiService.getById(userId)).rejects.toThrow(mockError);
    });
  });

  describe("getByUsername", () => {
    it("returns correct response", async () => {
      const username = "test";
      const response: JsendResponse = {
        status: "success",
        data: { id: "123", username, email: "test@email.com" },
      };

      (httpService.get as Mock).mockReturnValueOnce(response);
      const result = await userApiService.getByUsername(username);
      expect(result).toEqual(response.data);
      expect(httpService.get).toHaveBeenCalledWith(`user/username/${username}`);
    });

    it("should throw an error when the server responds with an error", async () => {
      const mockError = new Error("Server Error");
      const userId = "123";
      (httpService.get as Mock).mockRejectedValue(mockError);
      await expect(userApiService.getById(userId)).rejects.toThrow(mockError);
    });
  });
});
