import { logger } from "../../services/logger.service.js";
import config from "../../config/index.js";
import fetch from "cross-fetch";
import { getCollection } from "../../services/db.service.js";
import { Gif, GifCategory } from "../../../../shared/interfaces/gif.interface";

import pkg from "@giphy/js-fetch-api";
const { GiphyFetch } = pkg;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(global as any).fetch = fetch;

async function getGifsBySearchTerm(searchTerm: string): Promise<Gif[]> {
  try {
    // getting gifs from db
    const categories = [
      "Agree",
      "Applause",
      "Aww",
      "Dance",
      "Deal with it",
      "Do not want",
      "Eww",
      "Eye roll",
      "Facepalm",
      "Fist bump",
      "Good luck",
      "Happy dance",
      "Hearts",
      "High five",
      "Hug",
      "Idk",
      "Kiss",
      "Mic drop",
      "No",
      "OMG",
      "Oh snap",
      "Ok",
      "Oops",
      "Please",
      "Popcorn",
      "SMH",
      "Scared",
      "Seriously",
      "Shocked",
      "Shrug",
      "Sigh",
      "Slow clap",
      "Sorry",
      "Thank you",
      "Thumbs down",
      "Thumbs up",
      "Want",
      "Win",
      "Wink",
      "Yolo",
      "Yawn",
      "Yes",
      "You got this",
    ];
    const categorySet = new Set(categories);
    if (categorySet.has(searchTerm)) {
      return _getGifFromDb(searchTerm);
    }

    // gettting gifs from giphy
    const gf = new GiphyFetch(config.giphyApiKey);
    const { data: Fetchedgifs_1 } = await gf.search(searchTerm, {
      limit: 50,
      offset: 0,
      sort: "relevant",
    });

    const { data: Fetchedgifs_2 } = await gf.search(searchTerm, {
      limit: 50,
      offset: 50,
      sort: "relevant",
    });

    const Fetchedgifs = [...Fetchedgifs_1, ...Fetchedgifs_2];

    const gifs = Fetchedgifs.map((gif) => {
      return {
        _id: gif.id.toString(),
        url: gif.images.original.url,
        staticUrl: gif.images.original_still.url,
      };
    });

    return gifs;
  } catch (err) {
    logger.error(`cannot get gif ${searchTerm}`, err as Error);
    throw err;
  }
}

async function getGifCategories(): Promise<GifCategory[]> {
  try {
    const gifCollection = await getCollection("gif_categories");
    const gifCategories = await gifCollection.find({}).sort({ sortOrder: 1 }).toArray();
    return gifCategories as unknown as GifCategory[];
  } catch (err) {
    logger.error(`cannot get gif headers`, err as Error);
    throw err;
  }
}

async function getGifByCategory(category: string): Promise<Gif[]> {
  return _getGifFromDb(category);
}

async function _getGifFromDb(category: string): Promise<Gif[]> {
  try {
    const gifCollection = await getCollection("gifs");
    const gifs = await gifCollection
      .find(
        { category },
        {
          projection: {
            url: 1,
            staticUrl: 1,
          },
        }
      )
      .sort({ sortOrder: 1 })
      .toArray();
    return gifs as unknown as Gif[];
  } catch (err) {
    logger.error(`cannot get gif`, err as Error);
    throw err;
  }
}

export const gifService = {
  getGifsBySearchTerm,
  getGifCategories,
  getGifByCategory,
};
