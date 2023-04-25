import ansiColors from "ansi-colors";
import { logger } from "../../services/logger.service";
import config from "../../config";
import { GiphyFetch } from "@giphy/js-fetch-api";

import fetch from "cross-fetch";
import { getCollection } from "../../services/db.service";
import { ObjectId } from "mongodb";
import { Gif, GifCategory } from "../../../shared/interfaces/gif.interface";

(global as any).fetch = fetch;

async function getGifsBySearchTerm(searchTerm: string): Promise<Gif[]> {
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
      return gifsFromDb as unknown as Gif[];
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
    let gifs = Fetchedgifs.map((gif, idx) => {
      return {
        _id: gif.id.toString(),
        category: searchTerm,
        sortOrder: idx,
        gif: gif.images.original.url,
        img: gif.images.original_still.url,
      };
    });
    console.log(ansiColors.bgBlueBright(gifs.length + " gifs fetched"));
    return gifs;
  } catch (err) {
    logger.error(`cannot get gif ${searchTerm}`, err as Error);
    throw err;
  }
}

async function getGifCategories(): Promise<GifCategory> {
  try {
    const gifCollection = await getCollection("gif-category");
    const gifCategories = await gifCollection
      .find({})
      .sort({ sortOrder: 1 })
      .toArray();
    return gifCategories as unknown as GifCategory;
  } catch (err) {
    logger.error(`cannot get gif headers`, err as Error);
    throw err;
  }
}

async function getGifByCategory(category: string): Promise<Gif[]> {
  try {
    const gifCollection = await getCollection("gif");
    let gifs = await gifCollection.find({ category }).toArray();
    return gifs as unknown as Gif[];
  } catch (err) {
    logger.error(`cannot get gif`, err as Error);
    throw err;
  }
}

async function fixGifCollection() {
  const gifCollection = await getCollection("gif");
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
  const gf = new GiphyFetch(config.giphyApiKey);

  for (let i = 0; i < catgerories.length; i++) {
    const { data: Fetchedgifs } = await gf.search(catgerories[i], {
      limit: 50,
      offset: 50,
      sort: "relevant",
    });

    let gifs = Fetchedgifs.map((gif, idx) => {
      return {
        category: catgerories[i],
        sortOrder: idx + 50,
        gif: gif.images.original.url,
        img: gif.images.original_still.url,
      };
    });

    await gifCollection.insertMany(gifs);
    console.log(`inserted ${catgerories[i]}`);
  }
}

export const gifService = {
  getGifsBySearchTerm,
  getGifCategories,
  getGifByCategory,
  fixGifCollection,
};
