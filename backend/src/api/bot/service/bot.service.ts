import { UserModel } from "../../user/models/user.model";
import { Configuration, OpenAIApi } from "openai";
import { NewPost, NewPostImg, Poll, Post } from "../../../../../shared/interfaces/post.interface";
import { BotPromptModel } from "../model/bot-options.model";
import ansiColors from "ansi-colors";
import postService from "../../post/services/post/post.service";
import { AppError } from "../../../services/error/error.service";
import { v2 as cloudinary } from "cloudinary";
import axios from "axios";
require("dotenv").config();

const configuration = new Configuration({
  organization: process.env.OPEN_AI_ORGANIZATION,
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

async function getBots() {
  const bots = await UserModel.find({ isBot: true });
  return bots;
}

async function getBotPrompts(botId: string) {
  const prompts = await BotPromptModel.find({ botId });
  return prompts;
}

async function createPost({
  botId,
  prompt,
  schedule,
  numOfPosts,
  numberOfImages = 1,
  isImg = false,
  isImgOnly = false,
  isPoll = false,
  isPollOnly = false,
  isVideo = false,
  isVideoOnly = false,
}: {
  botId: string;
  prompt?: string;
  schedule?: Date;
  numOfPosts: number;
  numberOfImages?: number;
  isImg?: boolean;
  isImgOnly?: boolean;
  isPoll?: boolean;
  isPollOnly?: boolean;
  isVideo?: boolean;
  isVideoOnly?: boolean;
}): Promise<Post[]> {
  const posts = [];

  for (let i = 0; i < numOfPosts; i++) {
    const post = {
      audience: "everyone",
      repliersType: "everyone",
      isPublic: true,
      createdById: botId,
    } as NewPost;

    if (isImg) {
      const p = prompt ? prompt : await _getBotPrompt(botId, "image");
      if (!p) throw new AppError("prompt is undefined", 500);
      const imgs = await _getPostImgsFromOpenOpenAI(p, numberOfImages);
      if (!imgs) throw new AppError("imgs is undefined", 500);

      post["imgs"] = imgs as any as NewPostImg[];
    }

    if (isPoll) {
      const p = prompt ? prompt : await _getBotPrompt(botId, "poll");
      if (!p) throw new AppError("prompt is undefined", 500);
      const { text, poll } = await _getAndSetPostPollFromOpenAI(p);
      if (!poll) throw new AppError("poll is undefined", 500);

      post["text"] = text;
      post["poll"] = poll;
    }

    if (isVideo) {
      const p = prompt ? prompt : await _getBotPrompt(botId, "video");
      if (!p) throw new AppError("prompt is undefined", 500);
      const promptString =
        "Please choose one song from the artist or genre mentioned, and write a review about it, or share a fun fact. Return a JSON object with properties 'songName' and 'review'. Limit Review to 247 characters.";
      const { videoUrl, text } = await getVideoPost(p + " " + promptString);
      if (!videoUrl) throw new AppError("videoUrl is undefined", 500);

      post["videoUrl"] = videoUrl;
      post["text"] = text;
    }

    if (!isImgOnly && !isPollOnly && !isVideoOnly) {
      const p = prompt ? prompt : await _getBotPrompt(botId);
      if (!p) throw new AppError("prompt is undefined", 500);
      const text = await _getPostTextFromOpenAI(p);
      if (!text) throw new AppError("text is undefined", 500);

      post["text"] = text;
    }

    if (schedule) post["schedule"] = schedule;

    const p = await postService.add(post as NewPost);

    // eslint-disable-next-line no-console
    console.log(ansiColors.bgGreen(`Created post ${i + 1} of ${numOfPosts}`));
    // eslint-disable-next-line no-console
    console.log(ansiColors.italic(ansiColors.yellow(JSON.stringify(p, null, 2))));
    posts.push(p);
  }

  return posts;
}

async function addBotPrompt({
  botId,
  prompt,
  type = "text",
}: {
  botId: string;
  prompt: string;
  type: string;
}) {
  return await BotPromptModel.create({ botId, prompt, type });
}

async function _getBotPrompt(botId: string, type = "text"): Promise<string> {
  const count = await BotPromptModel.countDocuments({ botId, type });
  const random = Math.floor(Math.random() * count);
  const botPrompt = await BotPromptModel.findOne({ botId, type }).skip(random).exec();
  if (!botPrompt) throw new Error("prompt is undefined");
  if (type === "text")
    return (botPrompt.prompt as string) + "\n" + "Limit Tweet to 247 characters.";
  if (type === "poll") return _getPollPrompt(botPrompt.prompt as string);
  return botPrompt.prompt as string;
}

function _getPollPrompt(prompt: string) {
  const start = "Generate a Poll about ";
  const end =
    " return a json object with the question in one property and the options in another property in an array.";
  return start + prompt + end;
}

async function _getPostTextFromOpenAI(prompt: string, model = "default"): Promise<string> {
  if (model === "gpt-4") {
    const completion = await openai.createChatCompletion({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
    });
    const { message } = completion.data.choices[0];
    if (!message) throw new Error("message is undefined");
    return message.content as string;
  } else {
    const completion = await openai.createCompletion({
      model: "text-davinci-003",
      prompt,
      max_tokens: 4000,
    });
    const { text } = completion.data.choices[0];
    return text as string;
  }
}

async function _getAndSetPostPollFromOpenAI(prompt: string): Promise<{ text: string; poll: Poll }> {
  const completion = await openai.createChatCompletion({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }],
  });
  const { message } = completion.data.choices[0];
  if (!message) throw new AppError("message is undefined", 500);
  const parsedRes = JSON.parse(message.content as string);
  const { question, options } = parsedRes;
  if (!question || !options) throw new AppError("question or options is undefined", 500);
  for (const option of options) {
    if (!option) throw new AppError("option is undefined", 500);
    if (typeof option !== "string") throw new AppError("option is not a string", 500);
  }
  if (options.length < 2) throw new AppError("options must be at least 2", 500);

  const text = question;
  const poll = {
    options: options.map((option: string) => ({
      text: option,
      voteCount: 0,
      isLoggedInUserVoted: false,
    })),
    length: {
      days: 3,
      hours: 0,
      minutes: 0,
    },
    isVotingOff: false,
    createdAt: Date.now(),
  } as Poll;

  return { text, poll };
}

async function uploadToCloudinary(imageBuffer: any) {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ resource_type: "image" }, (error, result) => {
        if (error) reject(error);
        else resolve(result?.url);
      })
      .end(imageBuffer);
  });
}

async function _getPostImgsFromOpenOpenAI(prompt: string, numberOfImages = 1) {
  const response = await openai.createImage({
    prompt,
    n: numberOfImages,
    size: "512x512",
  });

  const imagePromises = response.data.data.map(async data => {
    if (!data.url) throw new Error("data.url is undefined");
    const response = await axios.get(data.url, {
      responseType: "arraybuffer",
    });
    const cloudinaryUrl = await uploadToCloudinary(response.data);
    return cloudinaryUrl;
  });

  const cloudinaryUrls = await Promise.all(imagePromises);

  const imgs = cloudinaryUrls.map((url, i) => ({ url, sortOrder: i }));
  return imgs;
}

async function getVideoPost(prompt: string) {
  const completion = await openai.createChatCompletion({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }],
  });
  const { message } = completion.data.choices[0];
  if (!message) throw new AppError("message is undefined", 500);
  const parsedRes = JSON.parse(message.content as string);

  if (!parsedRes.songName) throw new AppError("songName is undefined", 500);
  if (!parsedRes.review) throw new AppError("review is undefined", 500);

  const { songName, review } = parsedRes;

  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) throw new Error("GOOGLE_API_KEY is undefined");

  const apiStr = `https://www.googleapis.com/youtube/v3/search?part=snippet&videoCategoryId=10&videoEmbeddable=true&type=video&maxResults=1&key=${apiKey}&q=${songName}`;
  const response = await axios.get(apiStr);
  const songs = response.data.items;
  const videoUrl = `https://www.youtube.com/watch?v=${songs[0].id.videoId}`;

  return {
    videoUrl,
    text: review,
  };
}

export default { getBots, getBotPrompts, addBotPrompt, createPost };

// Path: src\services\bot\bot.service.ts
