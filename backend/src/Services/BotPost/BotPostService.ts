import { CreateBotPostOptions } from "../../types/App";
import { PostType } from "../../types/Enums";
import { NewPost, NewPostImg, Poll, Post } from "../../../../shared/types/post.interface";
import { AppError } from "../../services/error/errorService";
import promptService from "../../services/prompt/promptService";
import openAIService from "../openAI/openAIService";
import youtubeService from "../../services/youtube/youtubeService";
import { botServiceLogger } from "../botLogger/botLogger";
import { shuffleArray } from "../../services/util/utilService";
import { PostModel } from "../../models/post/postModel";

interface createPostParams {
  botId: string;
  options: CreateBotPostOptions;
}

interface BasicPostOptions {
  prompt: string;
}

interface PostImageOptions extends BasicPostOptions {
  numberOfImages?: number;
}

type GeneratePostOption = { botId: string; options: CreateBotPostOptions };

async function createPost(botId: string, options: CreateBotPostOptions): Promise<Post[]> {
  if (!botId) throw new AppError("botId is falsey", 500);
  const {
    prompt: promptFromOptions,
    schedule,
    numOfPosts = 1,
    postType = PostType.TEXT,
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
      case PostType.TEXT: {
        const prompt = promptFromOptions ?? (await _getBotPrompt(botId, PostType.TEXT));
        postBody["text"] = await createPostText(prompt);
        break;
      }
      case PostType.POLL: {
        const prompt = promptFromOptions ?? (await _getBotPrompt(botId, PostType.POLL));
        const { text, poll } = await createPostPoll(prompt);
        postBody["text"] = text;
        postBody["poll"] = poll;
        break;
      }
      case PostType.IMAGE: {
        const prompt = promptFromOptions ?? (await _getBotPrompt(botId, PostType.IMAGE));
        const imgs = await createPostImage({ prompt, numberOfImages });

        postBody["imgs"] = imgs;

        if (!addTextToContent) break;
        const text = await createPostText(prompt);
        postBody["text"] = text ?? "";
        break;
      }
      case PostType.VIDEO: {
        const prompt = promptFromOptions ?? (await _getBotPrompt(botId, PostType.VIDEO));
        const videoUrl = await createPostVideo(prompt);
        postBody["videoUrl"] = videoUrl;

        if (!addTextToContent) break;
        const text = await createPostText(prompt);
        postBody["text"] = text ?? "";

        break;
      }
      case PostType.SONG_REVIEW: {
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

    const post = (await PostModel.create(postBody as NewPost)) as unknown as Post;
    if (post) posts.push(post);
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
}: PostImageOptions): Promise<NewPostImg[]> {
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

async function autoSaveBotPosts() {
  const ONE_MINUTE = 60000;
  const createPostOptions = await _getBotPostOptions();
  const postGenerator = _generatePosts(createPostOptions);

  setInterval(async () => {
    for (let i = 0; i < 3; i++) {
      const {
        value: { botId, options },
      } = postGenerator.next();

      try {
        await createPost(botId, options);
      } catch (error) {
        botServiceLogger.error(error.message);
      }
    }
  }, ONE_MINUTE);
}

async function _getBotPrompt(botId: string, type: PostType): Promise<string> {
  if (!type) throw new AppError("postType is falsey", 500);
  if (!botId) throw new AppError("botId is falsey", 500);
  botServiceLogger.get("prompt");
  const botPrompt = await promptService.getBotPrompt(botId, type);
  if (!botPrompt) throw new AppError("prompt is falsey", 500);
  botServiceLogger.retrieve("prompt");
  return botPrompt;
}

async function _getBotPostOptions(): Promise<createPostParams[]> {
  const prompts = await promptService.getAllPrompts();
  if (!prompts) throw new AppError("prompts is falsey", 500);

  return prompts.map(prompt => ({
    botId: prompt.botId as string,
    options: {
      prompt: promptService.promptHandler(
        prompt.prompt as string,
        prompt.type as unknown as PostType
      ),
      postType: prompt.type as unknown as PostType,
    },
  }));
}

function* _generatePosts(postOptions: GeneratePostOption[]): Generator<GeneratePostOption> {
  // ensures that at the last yield statement, the function will create a new set of yield statements
  while (true) {
    // shuffles the postOptions array each time the yield statements are created
    const shuffledOptions = shuffleArray(postOptions);
    // creates yield statements in the length of the postOptions array
    for (const option of shuffledOptions) yield option;
  }
}

export default { createPost, autoSaveBotPosts };
