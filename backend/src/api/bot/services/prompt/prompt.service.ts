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

export default { getBotPrompt };
