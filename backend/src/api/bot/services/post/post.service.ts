import { AppError } from "../../../../services/error/error.service";
import promptService from "../prompt/prompt.service";
import postService from "../../../post/services/post/post.service";
import openAIService from "../openai/openai.service";
import {
  NewPost,
  NewPostImg,
  Poll,
  Post,
} from "../../../../../../shared/interfaces/post.interface";
import { logger } from "../../../../services/logger/logger.service";

type CreatePostOptions = {
  botId: string;
  prompt?: string;
  schedule?: Date;
  numOfPosts?: number;
  postType?: "image" | "poll" | "video" | "text";
  numberOfImages?: number;
  addTextToContent?: boolean;
};

interface BasicPostOptions {
  botId: string;
  prompt?: string;
}

interface ContentPostOptions extends BasicPostOptions {
  addTextToContent?: boolean;
}

interface PostImageOptions extends ContentPostOptions {
  numberOfImages?: number;
}

async function createPost(options: CreatePostOptions): Promise<Post[]> {
  const {
    botId,
    prompt,
    schedule,
    numOfPosts = 1,
    postType = "text",
    numberOfImages = 1,
    addTextToContent = false,
  } = options;

  const posts = [];
  const defaultPostState = {
    audience: "everyone",
    repliersType: "everyone",
    createdById: botId,
  } as NewPost;

  for (let i = 0; i < numOfPosts; i++) {
    switch (postType) {
      case "text":
        defaultPostState["text"] = await createPostText({ botId, prompt });
        break;
      case "poll":
        {
          const { text, poll } = await createPostPoll({ botId, prompt });
          defaultPostState["text"] = text;
          defaultPostState["poll"] = poll;
        }
        break;
      case "image":
        {
          const { text, imgs } = await createPostImage({
            botId,
            prompt,
            numberOfImages,
            addTextToContent,
          });

          defaultPostState["text"] = text ?? "";
          defaultPostState["imgs"] = imgs;
        }
        break;
      case "video":
        {
          const { text, videoUrl } = await createPostVideo({ botId, prompt, addTextToContent });

          defaultPostState["text"] = text ?? "";
          defaultPostState["videoUrl"] = videoUrl;
        }
        break;
      default:
        throw new AppError("Unknown post type", 500);
    }

    if (schedule) defaultPostState["schedule"] = schedule;

    const post = await postService.add(defaultPostState as NewPost);
    posts.push(post);

    logger.success(`Post created: ${post.id} - ${i + 1}/${numOfPosts}`);
  }

  return posts;
}

async function createPostText({ botId, prompt }: BasicPostOptions): Promise<string> {
  const p = prompt ? prompt : await promptService.getBotPrompt(botId);
  if (!p) throw new AppError("prompt is undefined", 500);
  const text = await openAIService.getTextFromOpenAI(p);
  if (!text) throw new AppError("text is undefined", 500);
  return text;
}

async function createPostPoll({
  botId,
  prompt,
}: BasicPostOptions): Promise<{ text: string; poll: Poll }> {
  const p = prompt ? prompt : await promptService.getBotPrompt(botId, "poll");
  if (!p) throw new AppError("prompt is undefined", 500);
  const { text, poll } = await openAIService.getAndSetPostPollFromOpenAI(p);
  if (!poll) throw new AppError("poll is undefined", 500);

  return { text, poll };
}

async function createPostImage({
  botId,
  prompt,
  numberOfImages = 1,
  addTextToContent = false,
}: PostImageOptions): Promise<{ text?: string; imgs: NewPostImg[] }> {
  const p = prompt ? prompt : await promptService.getBotPrompt(botId, "image");
  if (!p) throw new AppError("prompt is undefined", 500);
  const imgs = (await openAIService.getImgsFromOpenOpenAI(
    p,
    numberOfImages
  )) as unknown as NewPostImg[];
  if (!imgs) throw new AppError("imgs is undefined", 500);

  return { text: addTextToContent ? await createPostText({ botId, prompt }) : undefined, imgs };
}

async function createPostVideo({
  botId,
  prompt,
  addTextToContent,
}: ContentPostOptions): Promise<{ text?: string; videoUrl: string }> {
  const p = prompt ? prompt : await promptService.getBotPrompt(botId, "video");
  if (!p) throw new AppError("prompt is undefined", 500);
  const promptString =
    "Please choose one song from the artist or genre mentioned, and write a review about it, or share a fun fact. Return a JSON object with properties 'songName' and 'review'. Limit Review to 247 characters.";
  const { videoUrl, text } = await openAIService.getVideoAndTextFromYoutubeAndOpenAI(
    p + " " + promptString
  );
  if (!videoUrl) throw new AppError("videoUrl is undefined", 500);

  return { text: addTextToContent ? text : undefined, videoUrl };
}

export default { createPost };
