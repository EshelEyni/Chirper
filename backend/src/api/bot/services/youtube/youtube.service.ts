import { AppError } from "../../../../services/error/error.service";
import { google } from "googleapis";
require("dotenv").config();

const apiKey = process.env.GOOGLE_API_KEY;
if (!apiKey) throw new AppError("GOOGLE_API_KEY is undefined", 500);

const youtube = google.youtube({
  version: "v3",
  auth: apiKey,
});

async function getYoutubeVideo(prompt: string): Promise<string> {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) throw new AppError("GOOGLE_API_KEY is undefined", 500);

  // TODO: play around with the parameters
  // const apiStr = `https://www.googleapis.com/youtube/v3/search?part=snippet&videoCategoryId=10&videoEmbeddable=true&type=video&maxResults=1&key=${apiKey}&q=${prompt}`;

  const response = await youtube.search.list({
    part: ["snippet"],
    q: prompt,
    maxResults: 1,
    type: ["video"],
  });

  const songs = response.data.items;
  const videoUrl = `https://www.youtube.com/watch?v=${songs[0].id.videoId}`;

  return videoUrl;
}

export default { getYoutubeVideo };
