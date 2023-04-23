import { logger } from "../../services/logger.service";
import config from "../../config";
import { GiphyFetch } from "@giphy/js-fetch-api";

import fetch from "cross-fetch";
import { getCollection } from "../../services/db.service";

(global as any).fetch = fetch;

async function getGiffsBySearchTerm(searchTerm: string) {
  try {
    const gf = new GiphyFetch(config.giphyApiKey);
    const { data: gifs } = await gf.search(searchTerm, { sort: "relevant" });
    const collection = await getCollection("gif");
    const gifData = {
      title: searchTerm,
      gifs,
    };
    // const { insertedId } = await collection.insertOne(gifData);
    // console.log("insertedId", insertedId);
    return gifs;
  } catch (err) {
    logger.error(`cannot get giff ${searchTerm}`, err as Error);
    throw err;
  }
}

export const gifService = {
  getGiffsBySearchTerm,
};
