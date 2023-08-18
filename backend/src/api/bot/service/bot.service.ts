import { User } from "../../../../../shared/interfaces/user.interface";
import { UserModel } from "../../user/models/user.model";
import fs from "fs";
import path from "path";
import { Configuration, OpenAIApi } from "openai";
import { Post } from "../../../../../shared/interfaces/post.interface";
import { BotPromptModel } from "../model/bot-options.model";
import { PostModel } from "../../post/models/post.model";
require("dotenv").config();

const configuration = new Configuration({
  organization: process.env.OPEN_AI_ORGANIZATION,
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

async function getBots() {
  const bots = await UserModel.find({ isBot: true });
  return bots;
}

async function addBots(): Promise<User[]> {
  const bots = _getBotsFromJson();
  return (await UserModel.create(bots)) as unknown as User[];
}

async function removeBots(): Promise<void> {
  const bots = _getBotsFromJson();
  const botIds = bots.map(bot => bot.id);
  for (const botId of botIds) await UserModel.findByIdAndDelete(botId);
}

function _getBotsFromJson(): User[] {
  const botsJSON = fs.readFileSync(path.resolve(__dirname, "bots.creds.json"), "utf-8");
  const bots = JSON.parse(botsJSON) as unknown as User[];
  return bots;
}

async function createPost({ botId, schedule }: { botId: string; schedule?: Date }): Promise<Post> {
  const prompt = await _getBotPrompt(botId);
  const text = await _getPostTextFromOpenAI(prompt);
  const post = {
    audience: "everyone",
    repliersType: "everyone",
    isPublic: true,
    text,
    createdById: botId,
  } as Post;

  if (schedule) post["schedule"] = schedule;

  return (await PostModel.create(post)) as unknown as Post;
}

async function _getBotPrompt(botId: string): Promise<string> {
  const count = await BotPromptModel.countDocuments({ botId });
  const random = Math.floor(Math.random() * count);
  const botPrompt = await BotPromptModel.findOne({ botId }).skip(random).exec();
  if (!botPrompt) throw new Error("prompt is undefined");
  return botPrompt.prompt as string;
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

export default { getBots, addBots, removeBots, createPost };

// Path: src\services\bot\bot.service.ts
