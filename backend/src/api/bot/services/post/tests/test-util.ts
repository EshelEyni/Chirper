import { CreatePostOptions, PostType } from "../post.service";
import promptService from "../../prompt/prompt.service";
import postService from "../../../../post/services/post/post.service";
import openAIService from "../../openai/openai.service";
import youtubeService from "../../youtube/youtube.service";

type mockPromptObj = {
  botId: string;
  prompt: string;
  type: PostType;
};

jest.mock("../../prompt/prompt.service");
jest.mock("../../../../post/services/post/post.service");
jest.mock("../../openai/openai.service");
jest.mock("../../../../../services/logger/logger.service");
jest.mock("../../youtube/youtube.service");
jest.mock("../../logger/logger", () => {
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
};

const {
  TEST_BOT_ID,
  SAMPLE_PROMPT,
  SAMPLE_POST_TEXT,
  SAMPLE_SONG_NAME,
  SAMPLE_SONG_REVIEW,
  SAMPLE_VIDEO_URL,
} = constants;

const MockSetter = {
  add: () => {
    postService.add = jest.fn().mockImplementation(post => {
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
  getImgsFromOpenAI: () => {
    openAIService.getImgsFromOpenOpenAI = jest.fn().mockImplementation((_, numOfImages) => {
      return Promise.resolve(Array(numOfImages).fill({ imgURL: "http://example.com/.png" }));
    });
  },
  getYoutubeVideo: (value: string | null = SAMPLE_VIDEO_URL) => {
    youtubeService.getYoutubeVideo = jest.fn().mockResolvedValue(value);
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
    this.getAndSetPostPollFromOpenAI();
    this.getAllPrompts();
  },
};

function getPostCreateOptions(options?: Partial<CreatePostOptions>): CreatePostOptions {
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
