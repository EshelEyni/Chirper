/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from "express";
import botPostService from "../../services/botPost/botPostService";
import { addPost } from "./botPostController";
import { AppError } from "../../services/error/errorService";

jest.mock("../../services/botPost/botPostService");

describe("Bot Post Contoller", () => {
  const mockRequest = {
    params: { id: "botId123" },
    body: {
      prompt: "Test Prompt",
      schedule: "Test Schedule",
      numOfPosts: 5,
      postType: "text",
      numberOfImages: 2,
      addTextToContent: "Some Text",
    },
  } as unknown as Request;

  const mockResponse = {
    status: jest.fn().mockReturnThis(),
    send: jest.fn(),
  } as unknown as Response;

  const mockPost = { id: "postId123" };

  const nextMock = jest.fn();

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should create a bot post and send a success response", async () => {
    botPostService.createPost = jest.fn().mockResolvedValue(mockPost);

    const sut = addPost as any;
    await sut(mockRequest as Request, mockResponse as Response, nextMock);

    const botId = mockRequest.params.id;

    expect(botPostService.createPost).toHaveBeenCalledWith(botId, {
      prompt: "Test Prompt",
      schedule: "Test Schedule",
      numOfPosts: 5,
      postType: "text",
      numberOfImages: 2,
      addTextToContent: "Some Text",
    });

    expect(mockResponse.send).toHaveBeenCalledWith({
      status: "success",
      data: mockPost,
    });
  });

  it("should call next with an error if botId is not provided", async () => {
    delete mockRequest.params.id;

    const sut = addPost as any;
    await sut(mockRequest as Request, mockResponse as Response, nextMock);

    expect(nextMock).toHaveBeenCalledWith(new AppError("Bot Id is required", 400));
  });
});
