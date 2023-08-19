import { UserModel } from "../../user/models/user.model";
import { Configuration, OpenAIApi } from "openai";
import { NewPost, NewPostImg, Post } from "../../../../../shared/interfaces/post.interface";
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
}: {
  botId: string;
  prompt?: string;
  schedule?: Date;
  numOfPosts: number;
  numberOfImages?: number;
  isImg?: boolean;
  isImgOnly?: boolean;
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

    if (!isImgOnly) {
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
  return (botPrompt.prompt as string) + "\n" + "Limit Tweet to 247 characters.";
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

  // const imgs = response.data.data.map((data, i) => ({ url: data.url, sortOrder: i }));
  // return imgs;
}

export default { getBots, getBotPrompts, addBotPrompt, createPost };

// Path: src\services\bot\bot.service.ts
