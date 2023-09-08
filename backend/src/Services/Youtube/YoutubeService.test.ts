/* eslint-disable @typescript-eslint/no-explicit-any */
const mockList = jest.fn();

function mockGoogleYoutbeAPI() {
  return jest.fn().mockReturnValue({
    search: {
      list: mockList,
    },
  });
}

function setMockList(value?: any) {
  mockList.mockResolvedValue(value);
}

function setMockResponse(data?: any) {
  return { data };
}

function setMockItems(value?: any) {
  return { items: value ? value : [{ id: { videoId: "1234", kind: "youtube#video" } }] };
}

describe("Youtube Service", () => {
  let youtubeService: any;

  beforeEach(() => {
    jest.resetAllMocks();
    jest.doMock("googleapis", () => ({
      google: {
        youtube: mockGoogleYoutbeAPI(),
      },
    }));
    youtubeService = require("./YoutubeService").default;
  });

  describe("getYoutubeVideo", () => {
    it("should return a video url", async () => {
      setMockList(setMockResponse(setMockItems()));
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

    it("should throw an error if the response items array is undefined", async () => {
      setMockList(setMockResponse({}));
      await expect(youtubeService.getYoutubeVideo("Test Prompt")).rejects.toThrow(
        "No videos found"
      );
    });

    it("should throw an error if the response items array is empty", async () => {
      setMockList(setMockResponse(setMockItems([])));
      await expect(youtubeService.getYoutubeVideo("Test Prompt")).rejects.toThrow(
        "No videos found"
      );
    });

    it("should throw an error if the first item doesn't have an id", async () => {
      setMockList(setMockResponse(setMockItems([{}])));
      await expect(youtubeService.getYoutubeVideo("Test Prompt")).rejects.toThrow(
        "Invalid video data"
      );
    });

    it("should throw an error if the first item doesn't have a videoId", async () => {
      setMockList(setMockResponse(setMockItems([{ id: { kind: "youtube#video" } }])));
      await expect(youtubeService.getYoutubeVideo("Test Prompt")).rejects.toThrow(
        "Invalid video data"
      );
    });

    it("should throw an error if the first item doesn't have a kind of youtube#video", async () => {
      setMockList(setMockResponse(setMockItems([{ id: { videoId: "1234" } }])));
      await expect(youtubeService.getYoutubeVideo("Test Prompt")).rejects.toThrow(
        "Invalid video data"
      );
    });
  });
});
