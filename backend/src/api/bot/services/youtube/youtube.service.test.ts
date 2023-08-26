import axios from "axios";
import youtubeService from "./youtube.service";

jest.mock("axios");

describe("Youtube Service", () => {
  describe("getYoutubeVideo", () => {
    it("should return a video url", async () => {
      const id = "1234";

      axios.get = jest.fn().mockResolvedValue({
        data: { items: [{ id: { videoId: id } }] },
      });

      const videoUrl = await youtubeService.getYoutubeVideo("Test Prompt");
      expect(videoUrl).toEqual("https://www.youtube.com/watch?v=1234");
    });

    it("should throw an error if GOOGLE_API_KEY is undefined", async () => {
      const originalApiKey = process.env.GOOGLE_API_KEY;
      process.env.GOOGLE_API_KEY = "";

      await expect(youtubeService.getYoutubeVideo("Test Prompt")).rejects.toThrow(
        "GOOGLE_API_KEY is undefined"
      );

      process.env.GOOGLE_API_KEY = originalApiKey;
    });
  });
});
