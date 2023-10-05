import axios from "axios";
import { v2 as cloudinary } from "cloudinary";
import { Configuration, OpenAIApi } from "openai";
import { AppError } from "../error/errorService";
import { NewPostImg, Poll } from "../../../../shared/types/post";
import { botServiceLogger } from "../botLogger/botLogger";

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

async function getTextFromOpenAI(prompt: string, model = "default"): Promise<string> {
  if (model === "gpt-4") {
    const completion = await openai.createChatCompletion({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
    });
    const { message } = completion.data.choices[0];
    if (!message) throw new AppError("message is falsey", 500);
    return message.content as string;
  }

  const completion = await openai.createCompletion({
    model: "text-davinci-003",
    prompt,
    max_tokens: 4000,
  });
  const { text } = completion.data.choices[0];
  if (!text) throw new AppError("text is falsey", 500);
  return text as string;
}

async function getImgsFromOpenOpenAI(prompt: string, numberOfImages = 1): Promise<NewPostImg[]> {
  const response = await openai.createImage({
    prompt: prompt + "NOTICE: don't add any title or text on image",
    n: numberOfImages,
    size: "512x512",
  });

  const openAIImgUrls = response.data.data.map(data => data.url);

  const imgs: NewPostImg[] = [];
  for (let i = 0; i < openAIImgUrls.length; i++) {
    botServiceLogger.upload({ entity: "image", iterationNum: i });
    const url = openAIImgUrls[i];
    if (!url || typeof url !== "string") continue;
    const response = await axios.get(url, { responseType: "arraybuffer" });
    try {
      const cloudinaryUrl = (await _uploadToCloudinary(response.data)) as unknown as string;
      if (!cloudinaryUrl) continue;
      imgs.push({ url: cloudinaryUrl });
    } catch (error) {
      botServiceLogger.uploadError(error.message);
      continue;
    }
    botServiceLogger.uploaded({ entity: "image", iterationNum: i });
  }

  if (!imgs.length) throw new AppError("imgs is empty", 500);

  return imgs;
}

async function getAndSetPostPollFromOpenAI(prompt: string): Promise<{ text: string; poll: Poll }> {
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
  const poll = _getPollObj(options);
  return { text, poll };
}

async function _uploadToCloudinary(imageBuffer: Buffer) {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ resource_type: "image" }, (error, result) => {
        if (error) reject(error);
        else resolve(result?.url);
      })
      .end(imageBuffer);
  });
}

function _getPollObj(options: string[]) {
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
    createdAt: Date.now().toString(),
  } as Poll;

  return poll;
}

export default {
  getTextFromOpenAI,
  getAndSetPostPollFromOpenAI,
  getImgsFromOpenOpenAI,
};
