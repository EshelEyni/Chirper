import { BotPromptModel } from "../../model/bot-options.model";
import { BotPrompt } from "../../../../../../shared/interfaces/bot.interface";
import { PostType } from "../post/post.service";

type TypeToTemplate = {
  [key: string]: (prompt: string) => string;
};

async function getAllBotPrompts(botId: string): Promise<BotPrompt[]> {
  const prompts = await BotPromptModel.find({ botId }).lean().exec();
  if (!prompts) throw new Error("prompts is undefined");
  return prompts as unknown as BotPrompt[];
}

async function getBotPrompt(botId: string, type: PostType): Promise<string> {
  const count = await BotPromptModel.countDocuments({ botId });
  const random = Math.floor(Math.random() * count);

  const botPrompt = await BotPromptModel.findOne({ botId }).skip(random).exec();
  if (!botPrompt) throw new Error("prompt is undefined");

  return promptHandler(botPrompt.prompt as string, type);
}

export function promptHandler(prompt: string, type: string) {
  const typeToTemplate: TypeToTemplate = {
    text: prompt => `${prompt}${promptFragments.TEXT_PROMPT_SUFFIX}`,
    poll: prompt =>
      `${promptFragments.POLL_PROMPT_PREFIX}${prompt}${promptFragments.POLL_PROMPT_SUFFIX}`,
    image: prompt => `${promptFragments.IMAGE_PROMPT_PREFIX}${prompt}`,
    video: prompt => `${promptFragments.VIDEO_PROMPT_PREFIX}${prompt}`,
    "song-review": prompt => `${prompt}${promptFragments.SONG_REVIEW_PROMPT_SUFFIX}`,
  };

  const templateFunc = typeToTemplate[type];
  return templateFunc ? templateFunc(prompt) : prompt;
}

export const promptFragments = {
  TEXT_PROMPT_SUFFIX: "\nLimit Tweet to 247 characters.",
  POLL_PROMPT_PREFIX: "Generate a Poll about ",
  POLL_PROMPT_SUFFIX:
    " NOTICE: return a json object with the question in one property and the options in another property in an array.",
  IMAGE_PROMPT_PREFIX:
    "I am Using AI to Generate Images for my Tweeter Clone, And I need the text for the tweet with the image.\n I will give the prompt i used to generate the image, and you will generate the text\n\nPrompt: ",
  VIDEO_PROMPT_PREFIX:
    "I am Using AI to Generate Videos for my tweeter Clone, And I need the text for the tweet with the video.\n I will give the prompt i used to generate the video, and you will generate the text\n\nPrompt: ",
  SONG_REVIEW_PROMPT_SUFFIX:
    "Please choose one song from the artist or genre mentioned, and write a review about it, or share a fun fact. Return a JSON object with properties 'songName' and 'review'. Limit Review to 247 characters.",
};

export default { getBotPrompt, getAllBotPrompts, promptHandler, promptFragments };
