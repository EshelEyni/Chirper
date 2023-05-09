import { Gif, GifCategory } from "../../../../shared/interfaces/gif.interface";

const config = require("../../config");
const fetch = require("cross-fetch");
const { GifModel, GifCategoryModel } = require("./gif.model");
const { APIFeatures } = require("../../services/util.service");

const pkg = require("@giphy/js-fetch-api");
const { GiphyFetch } = pkg;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(global as any).fetch = fetch;

async function getGifCategories(): Promise<GifCategory[]> {
  const features = new APIFeatures(GifCategoryModel.find(), {
    sort: "sortOrder",
  }).sort();

  const gifHeaders = await features.query;
  return gifHeaders as unknown as GifCategory[];
}

async function getGifsBySearchTerm(searchTerm: string): Promise<Gif[]> {
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

  const gifs = Fetchedgifs.map(gif => {
    return {
      _id: gif.id.toString(),
      url: gif.images.original.url,
      staticUrl: gif.images.original_still.url,
      description: gif.title,
    };
  });

  return gifs;
}

async function getGifByCategory(category: string): Promise<Gif[]> {
  const features = new APIFeatures(GifModel.find(), {
    category,
    sort: "sortOrder",
    fields: "url,staticUrl,description",
  })
    .filter()
    .sort()
    .limitFields();
  const gifs = await features.query;

  return gifs as unknown as Gif[];
}

module.exports = {
  getGifsBySearchTerm,
  getGifCategories,
  getGifByCategory,
};
