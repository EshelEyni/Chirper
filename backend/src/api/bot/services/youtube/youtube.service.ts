import axios from "axios";
import { AppError } from "../../../../services/error/error.service";
require("dotenv").config();

async function getYoutubeVideo(prompt: string): Promise<string> {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) throw new AppError("GOOGLE_API_KEY is undefined", 500);

  const apiStr = `https://www.googleapis.com/youtube/v3/search?part=snippet&videoCategoryId=10&videoEmbeddable=true&type=video&maxResults=1&key=${apiKey}&q=${prompt}`;
  const response = await axios.get(apiStr);
  const songs = response.data.items;
  const videoUrl = `https://www.youtube.com/watch?v=${songs[0].id.videoId}`;

  return videoUrl;
}

export default { getYoutubeVideo };
