import { PostType } from "../../types/Enums";
import promptService from "../../services/prompt/promptService";
import openAIService from "../openAI/openAIService";
import youtubeService from "../youtube/youtubeService";
import { PostModel } from "../../models/post/postModel";
import { CreateBotPostOptions } from "../../types/App";
import OMDBService from "../OMDBService/OMDBService";
import { getMockOMDBMovieDetails } from "../test/testUtilService";
import { MockOMDBMovieResponse } from "../../types/Test";

type mockPromptObj = {
  botId: string;
  prompt: string;
  type: PostType;
};

jest.mock("../../services/prompt/promptService");
jest.mock("../post/postService");
jest.mock("../openAI/openAIService");
jest.mock("../logger/loggerService");
jest.mock("../youtube/youtubeService");
jest.mock("../OMDBService/OMDBService");
jest.mock("../../models/post/postModel", () => ({
  PostModel: {
    create: jest.fn(),
  },
}));

jest.mock("../botLogger/botLogger", () => {
  const logger = {
    create: jest.fn(),
    created: jest.fn(),
    get: jest.fn(),
    retrieve: jest.fn(),
    upload: jest.fn(),
    uploaded: jest.fn(),
    uploadError: jest.fn(),
    error: jest.fn(),
  };

  return { botServiceLogger: logger };
});

const constants = {
  TEST_BOT_ID: "testBotId",
  SAMPLE_PROMPT: "testPrompt",
  SAMPLE_POST_TEXT: "Sample text post",
  SAMPLE_SONG_NAME: "Sample song name",
  SAMPLE_SONG_REVIEW: "Sample song review",
  SAMPLE_VIDEO_URL: "Sample video URL",
  SAMPLE_MOVIE_NAME: "Sample movie name",
  SAMPLE_MOVIE_REVIEW: "Sample movie review",
};

const {
  TEST_BOT_ID,
  SAMPLE_PROMPT,
  SAMPLE_POST_TEXT,
  SAMPLE_SONG_NAME,
  SAMPLE_SONG_REVIEW,
  SAMPLE_VIDEO_URL,
  SAMPLE_MOVIE_NAME,
  SAMPLE_MOVIE_REVIEW,
} = constants;

const MockSetter = {
  add: () => {
    PostModel.create = jest.fn().mockImplementation(post => {
      post.id = "postId";
      return Promise.resolve(post);
    });
  },
  getBotPrompt: (value: string | null = SAMPLE_PROMPT) => {
    promptService.getBotPrompt = jest.fn().mockResolvedValue(value);
  },
  getAllPrompts: (value: mockPromptObj[] | null = Array(3).fill(_getMockPrompt())) => {
    promptService.getAllPrompts = jest.fn().mockResolvedValue(value);
  },
  getTextFromOpenAI: () => {
    openAIService.getTextFromOpenAI = jest.fn().mockResolvedValue(SAMPLE_POST_TEXT);
  },
  getSongReviewFromOpenAI: (
    songName: string | null = SAMPLE_SONG_NAME,
    review: string | null = SAMPLE_SONG_REVIEW
  ) => {
    openAIService.getTextFromOpenAI = jest.fn().mockResolvedValue(
      JSON.stringify({
        songName,
        review,
      })
    );
  },
  getMovieReviewFromOpenAI: (
    movieName: string | null = SAMPLE_MOVIE_NAME,
    review: string | null = SAMPLE_MOVIE_REVIEW
  ) => {
    openAIService.getTextFromOpenAI = jest.fn().mockResolvedValue(
      JSON.stringify({
        movieName,
        review,
      })
    );
  },
  getImgsFromOpenAI: () => {
    openAIService.getImgsFromOpenOpenAI = jest.fn().mockImplementation((_, numOfImages) => {
      return Promise.resolve(Array(numOfImages).fill({ imgURL: "http://example.com/.png" }));
    });
  },
  getYoutubeVideo: (value: string | null = SAMPLE_VIDEO_URL) => {
    youtubeService.getYoutubeVideo = jest.fn().mockResolvedValue(value);
  },
  getOMDBContent: (value: MockOMDBMovieResponse | null = getMockOMDBMovieDetails()) => {
    OMDBService.getOMDBContent = jest.fn().mockResolvedValue(value);
  },
  getAndSetPostPollFromOpenAI: () => {
    openAIService.getAndSetPostPollFromOpenAI = jest.fn().mockResolvedValue({
      text: "Sample poll text",
      poll: { options: ["Option 1", "Option 2"] },
    });
  },
  setCoreMocks: function () {
    this.add();
    this.getBotPrompt();
    this.getTextFromOpenAI();
    this.getImgsFromOpenAI();
    this.getYoutubeVideo();
    this.getOMDBContent();
    this.getAndSetPostPollFromOpenAI();
    this.getAllPrompts();
  },
};

function getPostCreateOptions(options?: Partial<CreateBotPostOptions>): CreateBotPostOptions {
  return { postType: PostType.TEXT, ...options };
}

function _getMockPrompt() {
  return {
    botId: TEST_BOT_ID,
    prompt: SAMPLE_PROMPT,
    type: PostType.TEXT,
  };
}

export default { MockSetter, getPostCreateOptions, constants };
