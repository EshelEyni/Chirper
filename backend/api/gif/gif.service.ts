import { logger } from "../../services/logger.service";
import config from "../../config";
import { GiphyFetch } from "@giphy/js-fetch-api";

import fetch from "cross-fetch";
import { getCollection } from "../../services/db.service";
import { ObjectId } from "mongodb";
import { IGif } from "@giphy/js-types";
import { GifHeader } from "../../../shared/interfaces/gif.interface";

(global as any).fetch = fetch;

async function getGifsBySearchTerm(searchTerm: string): Promise<IGif[]> {
  try {
    // getting gifs from db
    const catgerories = [
      "agree",
      "applause",
      "aww",
      "dance",
      "deal with it",
      "dont not want",
      "eww",
      "eye roll",
      "facepalm",
      "fist bump",
      "good luck",
      "happy dance",
      "hearts",
      "high five",
      "hug",
      "idk",
      "kiss",
      "mic drop",
      "no",
      "OMG",
      "oh snap",
      "ok",
      "oops",
      "please",
      "popcorn",
      "SMH",
      "scared",
      "seriously",
      "shocked",
      "shrug",
      "sigh",
      "slow clap",
      "sorry",
      "thank you",
      "thumbs down",
      "thumbs up",
      "want",
      "win",
      "wink",
      "yolo",
      "yawn",
      "yes",
      "you got this",
    ];
    const categorySet = new Set(catgerories);
    if (categorySet.has(searchTerm)) {
      const gifCollection = await getCollection("gif");
      const gifsFromDb = await gifCollection
        .find({ category: searchTerm })
        .toArray();
      return gifsFromDb as unknown as IGif[];
    }

    // gettting gifs from giphy
    const gf = new GiphyFetch(config.giphyApiKey);
    const { data: gifs } = await gf.search(searchTerm, { sort: "relevant" });
    return gifs;
  } catch (err) {
    logger.error(`cannot get gif ${searchTerm}`, err as Error);
    throw err;
  }
}

async function getGifHeaders(): Promise<GifHeader> {
  try {
    const gifCollection = await getCollection("gif-header");
    const gifHeaders = await gifCollection.find({}).toArray();
    return gifHeaders as unknown as GifHeader;
  } catch (err) {
    logger.error(`cannot get gif headers`, err as Error);
    throw err;
  }
}

async function getGifByCategory(category: string): Promise<IGif[]> {
  try {
    const gifCollection = await getCollection("gif");
    let gifs = await gifCollection
      .find({ category }, { projection: { _id: 0, gif: 1 } })
      .toArray();
    gifs = gifs.map((gif) => gif.gif);
    return gifs as unknown as IGif[];
  } catch (err) {
    logger.error(`cannot get gif`, err as Error);
    throw err;
  }
}

export const gifService = {
  getGifsBySearchTerm,
  getGifHeaders,
  getGifByCategory,
};
