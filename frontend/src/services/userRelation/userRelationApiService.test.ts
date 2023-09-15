/* eslint-disable @typescript-eslint/no-explicit-any */
import { vi, describe, it, expect, Mock, beforeEach } from "vitest";
import userRelationApiService from "./userRelationApiService";
import httpService from "../http/httpService";
import { JsendResponse } from "../../../../shared/types/system";

vi.mock("../http/httpService");

describe("userRelationApiService", () => {
  const userId = "123";
  const postId = "456";
  let response: JsendResponse;

  beforeEach(() => {
    vi.clearAllMocks();
    response = {
      status: "success",
      data: { userId, isFollowing: true },
    };
  });

  describe("followUser", () => {
    it("returns correct response with no postId", async () => {
      const expectedEndpoint = `user/follow/${userId}`;
      (httpService.post as Mock).mockReturnValueOnce(response);
      const result = await userRelationApiService.followUser(userId);
      expect(result).toEqual(response.data);
      expect(httpService.post).toHaveBeenCalledWith(expectedEndpoint);
    });

    it("returns correct response with postId", async () => {
      response.data.postId = postId;
      const endpoint = `user/${userId}/follow/${postId}/fromPost`;
      (httpService.post as Mock).mockReturnValueOnce(response);
      const result = await userRelationApiService.followUser(userId, postId);
      expect(result).toEqual(response.data);
      expect(httpService.post).toHaveBeenCalledWith(endpoint);
    });

    it("should throw an error when the server responds with an error", async () => {
      const mockError = new Error("Server Error");

      (httpService.post as Mock).mockRejectedValue(mockError);
      await expect(userRelationApiService.followUser(userId)).rejects.toThrow(mockError);
    });
  });

  describe("unFollowUser", () => {
    it("returns correct response with no postId", async () => {
      const expectedEndpoint = `user/follow/${userId}`;
      (httpService.delete as Mock).mockReturnValueOnce(response);
      const result = await userRelationApiService.unFollowUser(userId);
      expect(result).toEqual(response.data);
      expect(httpService.delete).toHaveBeenCalledWith(expectedEndpoint);
    });

    it("returns correct response with postId", async () => {
      response.data.postId = postId;
      const endpoint = `user/${userId}/follow/${postId}/fromPost`;
      (httpService.delete as Mock).mockReturnValueOnce(response);
      const result = await userRelationApiService.unFollowUser(userId, postId);
      expect(result).toEqual(response.data);
      expect(httpService.delete).toHaveBeenCalledWith(endpoint);
    });

    it("should throw an error when the server responds with an error", async () => {
      const mockError = new Error("Server Error");

      (httpService.delete as Mock).mockRejectedValue(mockError);
      await expect(userRelationApiService.unFollowUser(userId)).rejects.toThrow(mockError);
    });
  });

  describe("muteUser", () => {
    it("returns correct response with no postId", async () => {
      const expectedEndpoint = `user/mute/${userId}`;
      (httpService.post as Mock).mockReturnValueOnce(response);
      const result = await userRelationApiService.muteUser(userId);
      expect(result).toEqual(response.data);
      expect(httpService.post).toHaveBeenCalledWith(expectedEndpoint);
    });

    it("returns correct response with postId", async () => {
      response.data.postId = postId;
      const endpoint = `user/${userId}/mute/${postId}/fromPost`;
      (httpService.post as Mock).mockReturnValueOnce(response);
      const result = await userRelationApiService.muteUser(userId, postId);
      expect(result).toEqual(response.data);
      expect(httpService.post).toHaveBeenCalledWith(endpoint);
    });

    it("should throw an error when the server responds with an error", async () => {
      const mockError = new Error("Server Error");

      (httpService.post as Mock).mockRejectedValue(mockError);
      await expect(userRelationApiService.muteUser(userId)).rejects.toThrow(mockError);
    });
  });

  describe("unMuteUser", () => {
    it("returns correct response with no postId", async () => {
      const expectedEndpoint = `user/mute/${userId}`;
      (httpService.delete as Mock).mockReturnValueOnce(response);
      const result = await userRelationApiService.unMuteUser(userId);
      expect(result).toEqual(response.data);
      expect(httpService.delete).toHaveBeenCalledWith(expectedEndpoint);
    });

    it("returns correct response with postId", async () => {
      response.data.postId = postId;
      const endpoint = `user/${userId}/mute/${postId}/fromPost`;
      (httpService.delete as Mock).mockReturnValueOnce(response);
      const result = await userRelationApiService.unMuteUser(userId, postId);
      expect(result).toEqual(response.data);
      expect(httpService.delete).toHaveBeenCalledWith(endpoint);
    });

    it("should throw an error when the server responds with an error", async () => {
      const mockError = new Error("Server Error");

      (httpService.delete as Mock).mockRejectedValue(mockError);
      await expect(userRelationApiService.unMuteUser(userId)).rejects.toThrow(mockError);
    });
  });

  describe("blockUser", () => {
    it("returns correct response with no postId", async () => {
      const expectedEndpoint = `user/block/${userId}`;
      (httpService.post as Mock).mockReturnValueOnce(response);
      const result = await userRelationApiService.blockUser(userId);
      expect(result).toEqual(response.data);
      expect(httpService.post).toHaveBeenCalledWith(expectedEndpoint);
    });

    it("returns correct response with postId", async () => {
      response.data.postId = postId;
      const endpoint = `user/${userId}/block/${postId}/fromPost`;
      (httpService.post as Mock).mockReturnValueOnce(response);
      const result = await userRelationApiService.blockUser(userId, postId);
      expect(result).toEqual(response.data);
      expect(httpService.post).toHaveBeenCalledWith(endpoint);
    });

    it("should throw an error when the server responds with an error", async () => {
      const mockError = new Error("Server Error");

      (httpService.post as Mock).mockRejectedValue(mockError);
      await expect(userRelationApiService.blockUser(userId)).rejects.toThrow(mockError);
    });
  });

  describe("unBlockUser", () => {
    it("returns correct response with no postId", async () => {
      const expectedEndpoint = `user/block/${userId}`;
      (httpService.delete as Mock).mockReturnValueOnce(response);
      const result = await userRelationApiService.unBlockUser(userId);
      expect(result).toEqual(response.data);
      expect(httpService.delete).toHaveBeenCalledWith(expectedEndpoint);
    });

    it("returns correct response with postId", async () => {
      response.data.postId = postId;
      const endpoint = `user/${userId}/block/${postId}/fromPost`;
      (httpService.delete as Mock).mockReturnValueOnce(response);
      const result = await userRelationApiService.unBlockUser(userId, postId);
      expect(result).toEqual(response.data);
      expect(httpService.delete).toHaveBeenCalledWith(endpoint);
    });

    it("should throw an error when the server responds with an error", async () => {
      const mockError = new Error("Server Error");

      (httpService.delete as Mock).mockRejectedValue(mockError);
      await expect(userRelationApiService.unBlockUser(userId)).rejects.toThrow(mockError);
    });
  });
});
