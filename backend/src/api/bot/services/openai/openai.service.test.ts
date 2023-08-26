import { assertPoll, assertPostImgs } from "../../../../services/test-util.service";
import openAIService from "./openai.service";
import { Configuration, OpenAIApi } from "openai";
import axios from "axios";
import { v2 as cloudinary } from "cloudinary";

jest.mock("openai", () => {
  const mockOpenAIConfiguration = {
    organization: process.env.OPEN_AI_ORGANIZATION,
    apiKey: process.env.OPENAI_API_KEY,
  };
  const mockOpenAIApi = {
    createChatCompletion: jest.fn(),
    createCompletion: jest.fn(),
    createImage: jest.fn(),
  };

  return {
    Configuration: jest.fn().mockImplementation(() => mockOpenAIConfiguration),
    OpenAIApi: jest.fn().mockImplementation(() => mockOpenAIApi),
  };
});

jest.mock("cloudinary", () => ({
  v2: {
    config: jest.fn(),
    uploader: {
      upload_stream: jest.fn(),
    },
  },
}));

jest.mock("axios");

describe("Open AI Service", () => {
  const configuration = new Configuration({
    organization: process.env.OPEN_AI_ORGANIZATION,
    apiKey: process.env.OPENAI_API_KEY,
  });

  const openai = new OpenAIApi(configuration);

  describe("getTextFromOpenAI", () => {
    beforeEach(() => {
      jest.resetAllMocks();
    });

    it("should return text from OpenAI using gpt-4 model", async () => {
      const prompt = "Sample prompt";
      const response = {
        data: {
          choices: [{ message: { content: "Sample response from gpt-4" } }],
        },
      };

      openai.createChatCompletion = jest.fn().mockResolvedValue(response);

      const result = await openAIService.getTextFromOpenAI(prompt, "gpt-4");
      expect(openai.createChatCompletion).toHaveBeenCalledWith({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
      });
      expect(result).toEqual("Sample response from gpt-4");
    });

    it("should return text from OpenAI using default model", async () => {
      const prompt = "Sample prompt";
      const response = {
        data: {
          choices: [{ text: "Sample response from default model" }],
        },
      };

      openai.createCompletion = jest.fn().mockResolvedValue(response);

      const result = await openAIService.getTextFromOpenAI(prompt);
      expect(openai.createCompletion).toHaveBeenCalledWith({
        model: "text-davinci-003",
        prompt,
        max_tokens: 4000,
      });
      expect(result).toEqual("Sample response from default model");
    });

    it("should throw an error if message is falsey for gpt-4 model", async () => {
      const prompt = "Sample prompt";
      const response = {
        data: {
          choices: [{ message: undefined }],
        },
      };

      openai.createChatCompletion = jest.fn().mockResolvedValue(response);

      await expect(openAIService.getTextFromOpenAI(prompt, "gpt-4")).rejects.toThrow(
        "message is falsey"
      );
    });

    it("should throw an error if message is falsey for default model", async () => {
      const prompt = "Sample prompt";
      const response = {
        data: {
          choices: [{ text: undefined }],
        },
      };

      openai.createCompletion = jest.fn().mockResolvedValue(response);

      await expect(openAIService.getTextFromOpenAI(prompt)).rejects.toThrow("text is falsey");
    });
  });

  describe("getAndSetPostPollFromOpenAI", () => {
    const getResponse = (choices: any) => ({ data: { choices } });

    beforeEach(() => {
      jest.resetAllMocks();
    });

    it("should return text and poll for valid input", async () => {
      const prompt = "Sample prompt";
      const choices = [
        {
          message: {
            content: JSON.stringify({
              question: "Sample question",
              options: ["option1", "option2"],
            }),
          },
        },
      ];
      const response = getResponse(choices);
      openai.createChatCompletion = jest.fn().mockResolvedValue(response);

      const result = await openAIService.getAndSetPostPollFromOpenAI(prompt);
      expect(result.text).toEqual("Sample question");
      assertPoll(result.poll);
    });

    it("should throw an error if message is undefined", async () => {
      const prompt = "Sample prompt";
      const choices = [{}];
      const response = getResponse(choices);

      openai.createChatCompletion = jest.fn().mockResolvedValue(response);
      await expect(openAIService.getAndSetPostPollFromOpenAI(prompt)).rejects.toThrow(
        "message is undefined"
      );
    });

    it("should throw an error if options are missing", async () => {
      const prompt = "Sample prompt";
      const choices = [{ message: { content: JSON.stringify({ question: "Sample question" }) } }];
      const response = getResponse(choices);
      openai.createChatCompletion = jest.fn().mockResolvedValue(response);

      await expect(openAIService.getAndSetPostPollFromOpenAI(prompt)).rejects.toThrow(
        "question or options is undefined"
      );
    });

    it("should throw an error if options are not an array", async () => {
      const prompt = "Sample prompt";
      const choices = [
        {
          message: {
            content: JSON.stringify({ question: "Sample question", options: "not an array" }),
          },
        },
      ];

      const response = getResponse(choices);
      openai.createChatCompletion = jest.fn().mockResolvedValue(response);

      await expect(openAIService.getAndSetPostPollFromOpenAI(prompt)).rejects.toThrow();
    });

    it("should throw an error if question is missing", async () => {
      const prompt = "Sample prompt";
      const choices = [
        { message: { content: JSON.stringify({ options: ["option1", "option2"] }) } },
      ];
      const response = getResponse(choices);
      openai.createChatCompletion = jest.fn().mockResolvedValue(response);

      await expect(openAIService.getAndSetPostPollFromOpenAI(prompt)).rejects.toThrow(
        "question or options is undefined"
      );
    });

    it("should throw an error if option is not a string", async () => {
      const prompt = "Sample prompt";
      const choices = [
        {
          message: {
            content: JSON.stringify({ question: "Sample question", options: ["option1", 2] }),
          },
        },
      ];
      const response = getResponse(choices);

      openai.createChatCompletion = jest.fn().mockResolvedValue(response);

      await expect(openAIService.getAndSetPostPollFromOpenAI(prompt)).rejects.toThrow(
        "option is not a string"
      );
    });

    it("should throw an error if options are less than 2", async () => {
      const prompt = "Sample prompt";
      const choices = [
        {
          message: {
            content: JSON.stringify({ question: "Sample question", options: ["option1"] }),
          },
        },
      ];
      const response = getResponse(choices);

      openai.createChatCompletion = jest.fn().mockResolvedValue(response);

      await expect(openAIService.getAndSetPostPollFromOpenAI(prompt)).rejects.toThrow(
        "options must be at least 2"
      );
    });

    it("should throw an error for invalid JSON in message content", async () => {
      const prompt = "Sample prompt";
      const choices = [{ message: { content: "Invalid JSON" } }];
      const response = getResponse(choices);

      openai.createChatCompletion = jest.fn().mockResolvedValue(response);

      await expect(openAIService.getAndSetPostPollFromOpenAI(prompt)).rejects.toThrow(
        "Unexpected token I in JSON at position 0"
      );
    });

    it("should throw an error if an option is an empty string", async () => {
      const prompt = "Sample prompt";
      const choices = [
        {
          message: {
            content: JSON.stringify({ question: "Sample question", options: ["option1", ""] }),
          },
        },
      ];
      const response = getResponse(choices);
      openai.createChatCompletion = jest.fn().mockResolvedValue(response);

      await expect(openAIService.getAndSetPostPollFromOpenAI(prompt)).rejects.toThrow(
        "option is undefined"
      );
    });
  });

  describe("getImgsFromOpenOpenAI", () => {
    const prompt = "Sample prompt";

    function mockOpenAICreateImg(...dataUrls: string[]) {
      openai.createImage = jest.fn().mockResolvedValueOnce({
        data: {
          data: dataUrls.map(url => ({ url })),
        },
      });
    }

    function mockCloudinaryUpload(...cloudinaryUrls: string[]) {
      for (let i = 0; i < cloudinaryUrls.length; i++) {
        (cloudinary.uploader.upload_stream as jest.Mock).mockImplementationOnce(
          (options, callback) => {
            const fakeStream = {
              end: () => {
                callback(null, { url: cloudinaryUrls[i] });
              },
            };
            return fakeStream;
          }
        );
      }
    }

    function getUrls(num: number) {
      const dataUrls = [];
      const cloudinaryUrls = [];
      for (let i = 0; i < num; i++) {
        dataUrls.push(`http://img${i}.url`);
        cloudinaryUrls.push(`http://cloudinary/img${i}.url`);
      }
      return { dataUrls, cloudinaryUrls };
    }

    beforeEach(() => {
      jest.resetAllMocks();

      axios.get = jest.fn().mockResolvedValue({
        data: "Sample image data",
      });
    });

    it("should return a single image URL", async () => {
      const numberOfImages = 1;
      const { dataUrls, cloudinaryUrls } = getUrls(numberOfImages);
      mockOpenAICreateImg(...dataUrls);
      mockCloudinaryUpload(...cloudinaryUrls);

      const result = await openAIService.getImgsFromOpenOpenAI(prompt, numberOfImages);

      expect(result.length).toEqual(1);
      assertPostImgs(...result);
    });

    it("should return multiple image URLs", async () => {
      const numberOfImages = 3;
      const { dataUrls, cloudinaryUrls } = getUrls(numberOfImages);
      mockOpenAICreateImg(...dataUrls);
      mockCloudinaryUpload(...cloudinaryUrls);

      const result = await openAIService.getImgsFromOpenOpenAI(prompt, numberOfImages);

      expect(result.length).toEqual(3);
      assertPostImgs(...result);
    });

    it("should handle failed image download", async () => {
      const numberOfImages = 1;
      const { dataUrls } = getUrls(numberOfImages);
      mockOpenAICreateImg(...dataUrls);

      axios.get = jest.fn().mockRejectedValue(new Error("Failed to download"));

      await expect(openAIService.getImgsFromOpenOpenAI(prompt)).rejects.toThrow(
        "Failed to download"
      );
    });

    it("should handle failed upload to Cloudinary", async () => {
      const numberOfImages = 1;
      const { dataUrls } = getUrls(numberOfImages);
      mockOpenAICreateImg(...dataUrls);
      (cloudinary.uploader.upload_stream as jest.Mock).mockImplementation(() => {
        throw new Error("Failed to upload");
      });
      await expect(openAIService.getImgsFromOpenOpenAI(prompt)).rejects.toThrow("Failed to upload");
    });

    it("should handle bad url from returning from Cloudinary", async () => {
      const numberOfImages = 5;
      const { dataUrls, cloudinaryUrls } = getUrls(numberOfImages);
      mockOpenAICreateImg(...dataUrls);
      mockCloudinaryUpload(null as any, undefined as any, ...cloudinaryUrls);

      const result = await openAIService.getImgsFromOpenOpenAI(prompt, numberOfImages);

      expect(result.length).toEqual(3);
      assertPostImgs(...result);
    });

    it("should thorw an error if imgs is empty", async () => {
      mockOpenAICreateImg();
      await expect(openAIService.getImgsFromOpenOpenAI(prompt)).rejects.toThrow("imgs is empty");
    });
  });
});
