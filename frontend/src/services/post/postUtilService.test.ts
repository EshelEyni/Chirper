/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach } from "vitest";
import postUtilService from "./postUtilService";

describe("postUtilService", () => {
  describe("getPostAddedMsg", () => {
    const postId = "123";

    const expectsMsg = {
      type: "info",
      text: "Your Chirp has been sent!",
      link: { url: `/post/${postId}` },
    };

    it("returns correct message for post without date", () => {
      const result = postUtilService.getPostAddedMsg({ postId });
      expect(result).toEqual(expectsMsg);
    });

    it("returns correct message for post with date", () => {
      const date = new Date();
      const result = postUtilService.getPostAddedMsg({ postId, date });
      const dateStr = new Intl.DateTimeFormat("en-US", {
        dateStyle: "full",
        timeStyle: "short",
        timeZone: "UTC",
      }).format(date);

      expectsMsg.text = `Your Chirp will be sent on ${dateStr}`;
      expect(result).toEqual(expectsMsg);
    });
  });

  describe("isPostValid", () => {
    const post: any = {};

    beforeEach(() => {
      post.text = "";
      post.imgs = [];
      post.gif = null;
      post.video = null;
      post.quotedPostId = null;
      post.poll = null;
    });

    it("returns false for invalid post", () => {
      const result = postUtilService.isPostValid(post);
      expect(result).toBe(false);
    });

    it("returns true for valid post with only text", () => {
      post.text = "text";
      const result = postUtilService.isPostValid(post);
      expect(result).toBe(true);
    });

    it("returns true for valid post with only images", () => {
      post.imgs = [{}];
      const result = postUtilService.isPostValid(post);
      expect(result).toBe(true);
      delete post.imgs;
    });

    it("returns true for valid post with only gif", () => {
      post.gif = {};
      const result = postUtilService.isPostValid(post);
      expect(result).toBe(true);
      delete post.gif;
    });

    it("returns true for valid post with only video", () => {
      post.video = "videoUrl";
      const result = postUtilService.isPostValid(post);
      expect(result).toBe(true);
      delete post.video;
    });

    it("returns true for valid post with only quotedPostId", () => {
      post.quotedPostId = "123";
      const result = postUtilService.isPostValid(post);
      expect(result).toBe(true);
      delete post.quotedPostId;
    });

    it("returns true for valid post with only poll", () => {
      post.text = "poll quesiton?";
      post.poll = { options: [{ text: "option1" }, { text: "option2" }] };
      const result = postUtilService.isPostValid(post);
      expect(result).toBe(true);
      delete post.poll;
      delete post.text;
    });

    it("should return false for post with a poll without poll question at text field", () => {
      post.poll = { options: [{ text: "option1" }, { text: "option2" }] };
      const result = postUtilService.isPostValid(post);
      expect(result).toBe(false);
      delete post.poll;
    });

    it("should return false for post with a poll with less than 2 options", () => {
      post.poll = { text: "poll quesiton?", options: [{ text: "option1" }] };
      const result = postUtilService.isPostValid(post);
      expect(result).toBe(false);
      delete post.poll;
    });

    it("should return false for post with a poll with an option with empty text", () => {
      post.poll = { text: "poll quesiton?", options: [{ text: "option1" }, { text: "" }] };
      const result = postUtilService.isPostValid(post);
      expect(result).toBe(false);
      delete post.poll;
    });
  });
});
