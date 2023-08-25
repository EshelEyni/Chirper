import { Configuration, OpenAIApi } from "openai";
import { AppError } from "../../../../services/error/error.service";
import { v2 as cloudinary } from "cloudinary";
import axios from "axios";
import { Poll } from "../../../../../../shared/interfaces/post.interface";

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
    if (!message) throw new AppError("message is undefined", 500);
    return message.content as string;
  }

  const completion = await openai.createCompletion({
    model: "text-davinci-003",
    prompt,
    max_tokens: 4000,
  });
  const { text } = completion.data.choices[0];
  if (!text) throw new AppError("text is undefined", 500);
  return text as string;
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

async function getImgsFromOpenOpenAI(prompt: string, numberOfImages = 1) {
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
    const cloudinaryUrl = await _uploadToCloudinary(response.data);
    return cloudinaryUrl;
  });

  const cloudinaryUrls = await Promise.all(imagePromises);

  const imgs = cloudinaryUrls.map((url, i) => ({ url, sortOrder: i }));
  return imgs;
}

async function getVideoAndTextFromYoutubeAndOpenAI(prompt: string) {
  const completion = await openai.createChatCompletion({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }],
  });
  const { message } = completion.data.choices[0];
  if (!message) throw new AppError("message is undefined", 500);
  const parsedRes = JSON.parse(message.content as string);

  if (!parsedRes.songName) throw new AppError("songName is undefined", 500);
  if (!parsedRes.review) throw new AppError("review is undefined", 500);

  const { songName, review } = parsedRes;

  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) throw new Error("GOOGLE_API_KEY is undefined");

  const apiStr = `https://www.googleapis.com/youtube/v3/search?part=snippet&videoCategoryId=10&videoEmbeddable=true&type=video&maxResults=1&key=${apiKey}&q=${songName}`;
  const response = await axios.get(apiStr);
  const songs = response.data.items;
  const videoUrl = `https://www.youtube.com/watch?v=${songs[0].id.videoId}`;

  return {
    videoUrl,
    text: review,
  };
}

async function _uploadToCloudinary(imageBuffer: any) {
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
    createdAt: Date.now(),
  } as Poll;

  return poll;
}

export default {
  getTextFromOpenAI,
  getAndSetPostPollFromOpenAI,
  getImgsFromOpenOpenAI,
  getVideoAndTextFromYoutubeAndOpenAI,
};
