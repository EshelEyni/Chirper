import { BotPromptModel } from "../../model/bot-options.model";

async function getBotPrompt(botId: string, type = "text"): Promise<string> {
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

export const postImgTextPrompt =
  "I am Using AI to Generate Images for my tweeter Clone, And I need the text for the tweet with the image." +
  "\n " +
  "I will give the prompt i used to generate the image, and you will generate the text" +
  "\n\nPrompt: ";

export default { getBotPrompt };
