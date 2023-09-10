import { CreateBotPostOptions, GetPromptResult, MovieDetails } from "../../types/app";
import { PostType } from "../../types/enums";
import { NewPost, NewPostImg, Poll, Post } from "../../../../shared/types/post";
import { AppError } from "../../services/error/errorService";
import promptService from "../../services/prompt/promptService";
import openAIService from "../openAI/openAIService";
import youtubeService from "../../services/youtube/youtubeService";
import { botServiceLogger } from "../botLogger/botLogger";
import { shuffleArray } from "../../services/util/utilService";
import { PostModel } from "../../models/post/postModel";
import OMDBService from "../OMDBService/OMDBService";

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
        const prompt = promptFromOptions ?? (await _getBotPrompt(botId, PostType.TEXT)).prompt;
        postBody["text"] = await _createPostText(prompt);
        break;
      }
      case PostType.POLL: {
        const prompt = promptFromOptions ?? (await _getBotPrompt(botId, PostType.POLL)).prompt;
        const { text, poll } = await _createPostPoll(prompt);
        postBody["text"] = text;
        postBody["poll"] = poll;
        break;
      }
      case PostType.IMAGE: {
        let prompt = promptFromOptions;
        let rawPrompt: string | undefined = undefined;
        if (!prompt) {
          const res = await _getBotPrompt(botId, PostType.IMAGE);
          ({ prompt } = res), ({ rawPrompt } = res);
        }
        const imgs = await _createPostImage({ prompt: rawPrompt ?? prompt, numberOfImages });

        postBody["imgs"] = imgs;

        if (!addTextToContent) break;
        const text = await _createPostText(prompt);
        postBody["text"] = text ?? "";
        break;
      }
      case PostType.VIDEO: {
        let prompt = promptFromOptions;
        let rawPrompt: string | undefined = undefined;

        if (!prompt) {
          const res = await _getBotPrompt(botId, PostType.VIDEO);
          ({ prompt } = res), ({ rawPrompt } = res);
        }

        const videoUrl = await _createPostVideo(rawPrompt ?? prompt);

        postBody["videoUrl"] = videoUrl;

        if (!addTextToContent) break;
        const text = await _createPostText(prompt);
        postBody["text"] = text ?? "";

        break;
      }
      case PostType.SONG_REVIEW: {
        const prompt =
          promptFromOptions ?? (await _getBotPrompt(botId, PostType.SONG_REVIEW)).prompt;
        const { videoUrl, text } = await _createPostSongReview(prompt);
        postBody["videoUrl"] = videoUrl;
        postBody["text"] = text;
        break;
      }
      case PostType.MOVIE_REVIEW: {
        const prompt =
          promptFromOptions ?? (await _getBotPrompt(botId, PostType.MOVIE_REVIEW)).prompt;
        const { text, imgs } = await _createPostMovieReview(prompt);
        postBody["text"] = text;
        postBody["imgs"] = imgs;

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

async function _createPostText(prompt: string): Promise<string> {
  botServiceLogger.get("text");
  const text = await openAIService.getTextFromOpenAI(prompt);
  if (!text) throw new AppError("text is undefined", 500);
  botServiceLogger.retrieve("text");
  return text;
}

async function _createPostPoll(prompt: string): Promise<{ text: string; poll: Poll }> {
  botServiceLogger.get("poll");
  const { text, poll } = await openAIService.getAndSetPostPollFromOpenAI(prompt);
  botServiceLogger.retrieve("poll");
  return { text, poll };
}

async function _createPostImage({
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

async function _createPostVideo(prompt: string): Promise<string> {
  botServiceLogger.get("videoUrl");
  const videoUrl = await youtubeService.getYoutubeVideo(prompt);
  if (!videoUrl) throw new AppError("videoUrl is undefined", 500);
  botServiceLogger.retrieve("videoUrl");

  return videoUrl;
}

async function _createPostSongReview(prompt: string) {
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

async function _createPostMovieReview(prompt: string) {
  botServiceLogger.get("movieReview");
  const text = await openAIService.getTextFromOpenAI(prompt, "gpt-4");
  const parsedRes: { movieName: string; review: string } = JSON.parse(text);

  if (!parsedRes.movieName) throw new AppError("movieName is undefined", 500);
  if (!parsedRes.review) throw new AppError("review is undefined", 500);

  const { movieName, review } = parsedRes;

  botServiceLogger.retrieve("movieReview");

  botServiceLogger.get("movieInfo");
  const movieDetails = await OMDBService.getOMDBContent({ prompt: movieName });
  if (!movieDetails) throw new AppError("movieDetails is undefined", 500);
  botServiceLogger.retrieve("movieInfo");

  const generateMovieReviewText = (movieDetails: MovieDetails, review: string) => {
    const { title, year, director, writer, released } = movieDetails;
    return `${title} (${year})\nDirector: ${director}\nWriter: ${writer}\nReleased: ${released} \n\n${review}`;
  };

  return {
    text: generateMovieReviewText(movieDetails, review),
    imgs: [{ url: movieDetails.imgUrl }],
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

async function _getBotPrompt(botId: string, type: PostType): Promise<GetPromptResult> {
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
