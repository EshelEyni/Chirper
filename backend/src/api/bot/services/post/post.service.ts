import { AppError } from "../../../../services/error/error.service";
import promptService from "../prompt/prompt.service";
import postService from "../../../post/services/post/post.service";
import openAIService from "../openai/openai.service";
import { NewPost, Poll, Post, PostImg } from "../../../../../../shared/interfaces/post.interface";
import youtubeService from "../youtube/youtube.service";
import { botServiceLogger } from "../logger/logger";
import botService from "../bot/bot.service";

export enum PostType {
  TEXT = "text",
  POLL = "poll",
  IMAGE = "image",
  VIDEO = "video",
  SONG_REVIEW = "song-review",
}

export type CreatePostOptions = {
  prompt?: string;
  schedule?: Date;
  numOfPosts?: number;
  postType?: PostType;
  numberOfImages?: number;
  addTextToContent?: boolean;
};

interface BasicPostOptions {
  prompt: string;
}

interface PostImageOptions extends BasicPostOptions {
  numberOfImages?: number;
}

async function createPost(botId: string, options: CreatePostOptions): Promise<Post[]> {
  if (!botId) throw new AppError("botId is falsey", 500);
  const {
    prompt: promptFromOptions,
    schedule,
    numOfPosts = 1,
    postType = "text",
    numberOfImages = 1,
    addTextToContent = false,
  } = options;

  const posts = [];
  const postBody = {
    createdById: botId,
  } as NewPost;

  botServiceLogger.create({ entity: "posts" });
  for (let i = 0; i < numOfPosts; i++) {
    botServiceLogger.create({ entity: "post", iterationNum: i });
    switch (postType) {
      case "text": {
        const prompt = promptFromOptions ?? (await _getBotPrompt(botId, PostType.TEXT));
        postBody["text"] = await createPostText(prompt);
        break;
      }
      case "poll": {
        const prompt = promptFromOptions ?? (await _getBotPrompt(botId, PostType.POLL));
        const { text, poll } = await createPostPoll(prompt);
        postBody["text"] = text;
        postBody["poll"] = poll;
        break;
      }
      case "image": {
        const prompt = promptFromOptions ?? (await _getBotPrompt(botId, PostType.IMAGE));
        const imgs = await createPostImage({ prompt, numberOfImages });

        postBody["imgs"] = imgs as any;

        if (!addTextToContent) break;
        const text = await createPostText(prompt);
        postBody["text"] = text ?? "";
        break;
      }
      case "video": {
        const prompt = promptFromOptions ?? (await _getBotPrompt(botId, PostType.VIDEO));
        const videoUrl = await createPostVideo(prompt);
        postBody["videoUrl"] = videoUrl;

        if (!addTextToContent) break;
        const text = await createPostText(prompt);
        postBody["text"] = text ?? "";

        break;
      }
      case "song-review": {
        const prompt = promptFromOptions ?? (await _getBotPrompt(botId, PostType.SONG_REVIEW));
        const { videoUrl, text } = await createPostSongReview(prompt);
        postBody["videoUrl"] = videoUrl;
        postBody["text"] = text;
        break;
      }
      default:
        throw new AppError("Unknown post type", 500);
    }

    if (schedule) postBody["schedule"] = schedule;

    const post = await postService.add(postBody as NewPost);
    posts.push(post);
    botServiceLogger.created({ entity: "post", iterationNum: i, post });
  }
  botServiceLogger.created({ entity: "posts" });
  return posts;
}

async function createPostText(prompt: string): Promise<string> {
  botServiceLogger.get("text");
  const text = await openAIService.getTextFromOpenAI(prompt);
  if (!text) throw new AppError("text is undefined", 500);
  botServiceLogger.retrieve("text");
  return text;
}

async function createPostPoll(prompt: string): Promise<{ text: string; poll: Poll }> {
  botServiceLogger.get("poll");
  const { text, poll } = await openAIService.getAndSetPostPollFromOpenAI(prompt);
  botServiceLogger.retrieve("poll");
  return { text, poll };
}

async function createPostImage({
  prompt,
  numberOfImages = 1,
}: PostImageOptions): Promise<PostImg[]> {
  botServiceLogger.get("imgs");
  const imgs = await openAIService.getImgsFromOpenOpenAI(prompt, numberOfImages);
  if (!imgs) throw new AppError("imgs is undefined", 500);
  if (!imgs.length) throw new AppError("imgs is empty", 500);
  botServiceLogger.retrieve("imgs");

  return imgs;
}

async function createPostVideo(prompt: string): Promise<string> {
  botServiceLogger.get("videoUrl");
  const videoUrl = await youtubeService.getYoutubeVideo(prompt);
  if (!videoUrl) throw new AppError("videoUrl is undefined", 500);
  botServiceLogger.retrieve("videoUrl");

  return videoUrl;
}

async function createPostSongReview(prompt: string) {
  botServiceLogger.get("songReview");
  const text = await openAIService.getTextFromOpenAI(prompt, "gpt-4");
  const parsedRes = JSON.parse(text);

  if (!parsedRes.songName) throw new AppError("songName is undefined", 500);
  if (!parsedRes.review) throw new AppError("review is undefined", 500);
  const { songName, review } = parsedRes;
  botServiceLogger.retrieve("songReview");

  botServiceLogger.get("videoUrl");
  const videoUrl = await youtubeService.getYoutubeVideo(songName);
  if (!videoUrl) throw new AppError("videoUrl is undefined", 500);
  botServiceLogger.retrieve("videoUrl");

  return {
    videoUrl,
    text: review,
  };
}

async function _getBotPrompt(botId: string, type: string): Promise<string> {
  if (!type) throw new AppError("postType is falsey", 500);
  if (!botId) throw new AppError("botId is falsey", 500);
  botServiceLogger.get("prompt");
  const botPrompt = await promptService.getBotPrompt(botId);
  if (!botPrompt) throw new AppError("prompt is falsey", 500);
  botServiceLogger.retrieve("prompt");
  return botPrompt;
}

async function autoSaveBotPosts() {
  const bots = await botService.getBots();
  // for (const bot of bots) {
  //   // const prompts = await promptService.getBotPrompt(bot._id, PostType.TEXT);
  //   // for (const prompt of prompts) {
  //   //   await createPost(bot._id.toString(), { prompt, numOfPosts: 1, postType: PostType.TEXT });
  //   // }
  // }
}

export default { createPost, autoSaveBotPosts };
