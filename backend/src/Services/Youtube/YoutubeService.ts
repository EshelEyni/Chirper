import { AppError } from "../error/errorService";
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

  const response = await youtube.search.list({
    part: ["id"],
    q: prompt,
    maxResults: 1,
    type: ["video"],
    relevanceLanguage: "en",
    videoDuration: "short",
    videoCategoryId: "10",
  });

  if (!response.data.items || response.data.items.length === 0)
    throw new AppError("No videos found", 404);

  const firstItem = response.data.items[0];

  if (!firstItem.id || firstItem.id.kind !== "youtube#video" || !firstItem.id.videoId)
    throw new AppError("Invalid video data", 500);

  const { videoId } = firstItem.id;
  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
  return videoUrl;
}

export default { getYoutubeVideo };

// Path: src\api\bot\services\youtube\youtube.service.ts
