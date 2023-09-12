/* eslint-disable @typescript-eslint/no-explicit-any */
import { vi, describe, it, expect, Mock } from "vitest";
import postApiService from "./postApiService";
import httpService from "../http/httpService";
import { JsendResponse } from "../../../../shared/types/system";

vi.mock("../http/httpService");

describe("Post API Service", () => {
  describe("query", () => {
    it("should return posts when the server responds correctly", async () => {
      const mockResponse: JsendResponse = {
        status: "success",
        data: [
          { id: 1, title: "Post1" },
          { id: 2, title: "Post2" },
        ],
      };

      (httpService.get as Mock).mockResolvedValue(mockResponse);

      const result = await postApiService.query();

      expect(result).toEqual(mockResponse.data);
    });

    it("should include query parameters when provided", async () => {
      const mockResponse: JsendResponse = {
        status: "success",
        data: [{ id: 1, title: "Post1" }],
      };

      (httpService.get as Mock).mockResolvedValue(mockResponse);

      const queryObj = { author: "John" };
      await postApiService.query(queryObj);

      expect(httpService.get).toHaveBeenCalledWith(expect.stringContaining("author=John"));
    });

    it("should throw an error when the server responds with an error", async () => {
      const mockError = new Error("Server Error");

      (httpService.get as Mock).mockRejectedValue(mockError);

      await expect(postApiService.query()).rejects.toThrow(mockError);
    });
  });

  describe("getById", () => {
    it("should return a post when the server responds correctly", async () => {
      const mockResponse: JsendResponse = {
        status: "success",
        data: { id: 1, title: "Post1" },
      };

      (httpService.get as Mock).mockResolvedValue(mockResponse);

      const result = await postApiService.getById("1");

      expect(result).toEqual(mockResponse.data);
    });

    it("should throw an error when the server responds with an error", async () => {
      const mockError = new Error("Server Error");

      (httpService.get as Mock).mockRejectedValue(mockError);

      await expect(postApiService.getById("1")).rejects.toThrow(mockError);
    });
  });

  describe("remove", () => {
    it("should call httpService.delete with the correct url", async () => {
      const mockResponse: JsendResponse = {
        status: "success",
        data: null,
      };

      (httpService.delete as Mock).mockResolvedValue(mockResponse);

      await postApiService.remove("1");

      expect(httpService.delete).toHaveBeenCalledWith(expect.stringContaining("post/1"));
    });

    it("should throw an error when the server responds with an error", async () => {
      const mockError = new Error("Server Error");

      (httpService.delete as Mock).mockRejectedValue(mockError);

      await expect(postApiService.remove("1")).rejects.toThrow(mockError);
    });
  });

  describe("add", () => {
    it("should throw error when posts array is empty", async () => {
      await expect(postApiService.add([])).rejects.toThrow("postService: Cannot add empty post");
    });

    it("should call httpService.post with the correct url", async () => {
      const mockResponse: JsendResponse = {
        status: "success",
        data: { id: 1, text: "Post1" },
      };

      (httpService.post as Mock).mockResolvedValue(mockResponse);

      await postApiService.add([{ text: "Post1" }] as any);

      expect(httpService.post).toHaveBeenCalledWith(expect.stringContaining("post"), {
        text: "Post1",
      });
    });

    it("should throw an error when the server responds with an error", async () => {
      const mockError = new Error("Server Error");

      (httpService.post as Mock).mockRejectedValue(mockError);

      await expect(postApiService.add([{ text: "Post1" }] as any)).rejects.toThrow(mockError);
    });

    it("should call httpService.post with the correct url when adding multiple posts", async () => {
      const mockResponse: JsendResponse = {
        status: "success",
        data: [{ id: 1, text: "Post1" }],
      };

      (httpService.post as Mock).mockResolvedValue(mockResponse);

      await postApiService.add([{ text: "Post1" } as any, { text: "Post2" } as any]);

      expect(httpService.post).toHaveBeenCalledWith(expect.stringContaining("post/thread"), [
        { text: "Post1" },
        { text: "Post2" },
      ]);
    });

    it("should throw an error when the server responds with an error when adding multiple posts", async () => {
      const mockError = new Error("Server Error");

      (httpService.post as Mock).mockRejectedValue(mockError);

      await expect(postApiService.add([{ text: "Post1" } as any])).rejects.toThrow(mockError);
    });
  });

  describe("addReply", () => {
    it("should call httpService.post with the correct url", async () => {
      const mockResponse: JsendResponse = {
        status: "success",
        data: { id: 1, text: "Post1" },
      };

      (httpService.post as Mock).mockResolvedValue(mockResponse);

      await postApiService.addReply({ text: "Post1" } as any);

      expect(httpService.post).toHaveBeenCalledWith(expect.stringContaining("post/reply"), {
        text: "Post1",
      });
    });

    it("should throw an error when the server responds with an error", async () => {
      const mockError = new Error("Server Error");

      (httpService.post as Mock).mockRejectedValue(mockError);

      await expect(postApiService.addReply({ text: "Post1" } as any)).rejects.toThrow(mockError);
    });
  });

  describe("addRepost", () => {
    it("should call httpService.post with the correct url", async () => {
      const mockResponse: JsendResponse = {
        status: "success",
        data: { id: 1, text: "Post1" },
      };

      (httpService.post as Mock).mockResolvedValue(mockResponse);

      await postApiService.addRepost("1");

      expect(httpService.post).toHaveBeenCalledWith(expect.stringContaining("post/1/repost"));
    });

    it("should throw an error when the server responds with an error", async () => {
      const mockError = new Error("Server Error");

      (httpService.post as Mock).mockRejectedValue(mockError);

      await expect(postApiService.addRepost({ text: "Post1" } as any)).rejects.toThrow(mockError);
    });
  });

  describe("addQuote", () => {
    it("should call httpService.post with the correct url", async () => {
      const mockResponse: JsendResponse = {
        status: "success",
        data: { id: 1, text: "Post1" },
      };

      (httpService.post as Mock).mockResolvedValue(mockResponse);

      await postApiService.addQuote({ text: "Post1" } as any);

      expect(httpService.post).toHaveBeenCalledWith(expect.stringContaining("post/quote"), {
        text: "Post1",
      });
    });

    it("should throw an error when the server responds with an error", async () => {
      const mockError = new Error("Server Error");

      (httpService.post as Mock).mockRejectedValue(mockError);

      await expect(postApiService.addQuote({ text: "Post1" } as any)).rejects.toThrow(mockError);
    });
  });

  describe("removeRepost", () => {
    it("should call httpService.delete with the correct url", async () => {
      const mockResponse: JsendResponse = {
        status: "success",
        data: { id: 1, text: "Post1" },
      };

      (httpService.delete as Mock).mockResolvedValue(mockResponse);

      await postApiService.removeRepost("1");

      expect(httpService.delete).toHaveBeenCalledWith(expect.stringContaining("post/1/repost"));
    });

    it("should throw an error when the server responds with an error", async () => {
      const mockError = new Error("Server Error");

      (httpService.delete as Mock).mockRejectedValue(mockError);

      await expect(postApiService.removeRepost("1")).rejects.toThrow(mockError);
    });
  });

  describe("update", () => {
    it("should call httpService.patch with the correct url", async () => {
      const mockResponse: JsendResponse = {
        status: "success",
        data: { id: 1, text: "Post1" },
      };

      (httpService.patch as Mock).mockResolvedValue(mockResponse);

      await postApiService.update({ id: 1, text: "Post1" } as any);

      expect(httpService.patch).toHaveBeenCalledWith(expect.stringContaining("post/1"), {
        id: 1,
        text: "Post1",
      });
    });

    it("should throw an error when the server responds with an error", async () => {
      const mockError = new Error("Server Error");

      (httpService.patch as Mock).mockRejectedValue(mockError);

      await expect(postApiService.update({ text: "Post1" } as any)).rejects.toThrow(mockError);
    });
  });

  describe("addPollVote", () => {
    it("should call httpService.post with the correct url", async () => {
      const mockResponse: JsendResponse = {
        status: "success",
        data: { id: 1, text: "Post1" },
      };

      (httpService.post as Mock).mockResolvedValue(mockResponse);

      await postApiService.addPollVote({ postId: "1", optionIdx: 1 });

      expect(httpService.post).toHaveBeenCalledWith(expect.stringContaining("post/poll/1/vote"), {
        optionIdx: 1,
      });
    });

    it("should throw an error when the server responds with an error", async () => {
      const mockError = new Error("Server Error");

      (httpService.post as Mock).mockRejectedValue(mockError);

      await expect(postApiService.addPollVote({ postId: "1", optionIdx: 1 })).rejects.toThrow(
        mockError
      );
    });
  });

  describe("addLike", () => {
    it("should call httpService.post with the correct url", async () => {
      const mockResponse: JsendResponse = {
        status: "success",
        data: { id: 1, text: "Post1" },
      };

      (httpService.post as Mock).mockResolvedValue(mockResponse);

      await postApiService.addLike("1");

      expect(httpService.post).toHaveBeenCalledWith(expect.stringContaining("post/1/like"));
    });

    it("should throw an error when the server responds with an error", async () => {
      const mockError = new Error("Server Error");
      (httpService.post as Mock).mockRejectedValue(mockError);
      await expect(postApiService.addLike("1")).rejects.toThrow(mockError);
    });
  });

  describe("removeLike", () => {
    it("should call httpService.delete with the correct url", async () => {
      const mockResponse: JsendResponse = {
        status: "success",
        data: { id: 1, text: "Post1" },
      };

      (httpService.delete as Mock).mockResolvedValue(mockResponse);

      const res = await postApiService.removeLike("1");

      expect(httpService.delete).toHaveBeenCalledWith(expect.stringContaining("post/1/like"));
      expect(res).toEqual(mockResponse.data);
    });

    it("should throw an error when the server responds with an error", async () => {
      const mockError = new Error("Server Error");
      (httpService.delete as Mock).mockRejectedValue(mockError);
      await expect(postApiService.removeLike("1")).rejects.toThrow(mockError);
    });
  });

  describe("getPostStats", () => {
    it("should call httpService.get with the correct url", async () => {
      const mockResponse: JsendResponse = {
        status: "success",
        data: { id: 1, text: "Post1" },
      };

      (httpService.get as Mock).mockResolvedValue(mockResponse);

      const res = await postApiService.getPostStats("1");

      expect(httpService.get).toHaveBeenCalledWith(expect.stringContaining("post/1/stats"));
      expect(res).toEqual(mockResponse.data);
    });

    it("should throw an error when the server responds with an error", async () => {
      const mockError = new Error("Server Error");
      (httpService.get as Mock).mockRejectedValue(mockError);
      await expect(postApiService.getPostStats("1")).rejects.toThrow(mockError);
    });
  });

  describe("addImpression", () => {
    it("should call httpService.post with the correct url", async () => {
      const mockResponse: JsendResponse = {
        status: "success",
        data: { id: 1, text: "Post1" },
      };

      (httpService.post as Mock).mockResolvedValue(mockResponse);

      await postApiService.addImpression("1");

      expect(httpService.post).toHaveBeenCalledWith(expect.stringContaining("post/1/stats"));
    });

    it("should throw an error when the server responds with an error", async () => {
      const mockError = new Error("Server Error");
      (httpService.post as Mock).mockRejectedValue(mockError);
      await expect(postApiService.addImpression("1")).rejects.toThrow(mockError);
    });
  });

  describe("updatePostStats", () => {
    const body = { isDetailedViewed: true };

    it("should call httpService.patch with the correct url", async () => {
      const mockResponse: JsendResponse = {
        status: "success",
        data: { id: 1, text: "Post1" },
      };

      (httpService.patch as Mock).mockResolvedValue(mockResponse);

      await postApiService.updatePostStats("1", body);

      expect(httpService.patch).toHaveBeenCalledWith(expect.stringContaining("post/1/stats"), body);
    });

    it("should throw an error when the server responds with an error", async () => {
      const mockError = new Error("Server Error");
      (httpService.patch as Mock).mockRejectedValue(mockError);
      await expect(postApiService.updatePostStats("1", body)).rejects.toThrow(mockError);
    });
  });

  describe("getBookmarkedPosts", () => {
    it("should return posts when the server responds correctly", async () => {
      const mockResponse: JsendResponse = {
        status: "success",
        data: [
          { id: 1, title: "Post1" },
          { id: 2, title: "Post2" },
        ],
      };

      (httpService.get as Mock).mockResolvedValue(mockResponse);

      const result = await postApiService.getBookmarkedPosts();

      expect(result).toEqual(mockResponse.data);
    });

    it("should throw an error when the server responds with an error", async () => {
      const mockError = new Error("Server Error");

      (httpService.get as Mock).mockRejectedValue(mockError);

      await expect(postApiService.getBookmarkedPosts()).rejects.toThrow(mockError);
    });
  });

  describe("addBookmark", () => {
    it("should call httpService.post with the correct url", async () => {
      const mockResponse: JsendResponse = {
        status: "success",
        data: { id: 1, text: "Post1" },
      };

      (httpService.post as Mock).mockResolvedValue(mockResponse);

      await postApiService.addBookmark("1");

      expect(httpService.post).toHaveBeenCalledWith(expect.stringContaining("post/1/bookmark"));
    });

    it("should throw an error when the server responds with an error", async () => {
      const mockError = new Error("Server Error");
      (httpService.post as Mock).mockRejectedValue(mockError);
      await expect(postApiService.addBookmark("1")).rejects.toThrow(mockError);
    });
  });

  describe("removeBookmark", () => {
    it("should call httpService.delete with the correct url", async () => {
      const mockResponse: JsendResponse = {
        status: "success",
        data: { id: 1, text: "Post1" },
      };

      (httpService.delete as Mock).mockResolvedValue(mockResponse);

      await postApiService.removeBookmark("1");

      expect(httpService.delete).toHaveBeenCalledWith(expect.stringContaining("post/1/bookmark"));
    });

    it("should throw an error when the server responds with an error", async () => {
      const mockError = new Error("Server Error");
      (httpService.delete as Mock).mockRejectedValue(mockError);
      await expect(postApiService.removeBookmark("1")).rejects.toThrow(mockError);
    });
  });
});
