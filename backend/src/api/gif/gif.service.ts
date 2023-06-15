import { Gif, GifCategory } from "../../../../shared/interfaces/gif.interface";
import config from "../../config";
import fetch from "cross-fetch";
import { GifModel, GifCategoryModel } from "./gif.model";
import { APIFeatures } from "../../services/util.service";
import { AppError } from "../../services/error.service";
import { GiphyFetch } from "@giphy/js-fetch-api";

import fs from "fs";
const gifData = JSON.parse(fs.readFileSync(`${__dirname}/../../../data/gif-data-raw.json`, "utf8"));

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(global as any).fetch = fetch;

async function getGifCategories(): Promise<GifCategory[]> {
  const features = new APIFeatures(GifCategoryModel.find(), {
    sort: "sortOrder",
  }).sort();

  const gifHeaders = await features.getQuery().exec();
  return gifHeaders as unknown as GifCategory[];
}

async function getGifsBySearchTerm(searchTerm: string): Promise<Gif[]> {
  if (!config.giphyApiKey) throw new AppError("Giphy API key not found", 500);
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
      id: gif.id.toString(),
      url: gif.images.original.url,
      staticUrl: gif.images.original_still.url,
      description: gif.title || "No description",
      size: {
        height: gif.images.original.height,
        width: gif.images.original.width,
      },
      placeholderUrl: gif.images.preview_webp.url,
      staticPlaceholderUrl: gif.images.fixed_width_small_still.url,
    };
  });

  return gifs;
}

async function getGifByCategory(category: string): Promise<Gif[]> {
  const features = new APIFeatures(GifModel.find(), {
    category,
    sort: "sortOrder",
    fields: "url,staticUrl,description,size,placeholderUrl,staticPlaceholderUrl",
  })
    .filter()
    .sort()
    .limitFields();
  const gifs = await features.getQuery().exec();

  return gifs as unknown as Gif[];
}

async function demoSearch(): Promise<any> {
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

  const prms = categories.map(async category => {
    const gifs = gifData[category].map((gif: any, idx: number) => {
      // if (gif.images.preview_webp?.url === undefined)
      // console.log("gif.images.preview_webp?.url", gif.id);
      // if (gif?.title === undefined) console.log("gif?.title", gif.id);

      // if (gif.images.fixed_width_small_still?.url === undefined)
      // console.log("gif.images.fixed_width_small_still.url", gif.id, category);

      return {
        category,
        url: gif.images.original.url,
        staticUrl: gif.images.original_still.url,
        size: {
          height: gif.images.original.height,
          width: gif.images.original.width,
        },
        placeholderUrl: gif.images.fixed_height_small.url,
        staticPlaceholderUrl: gif.images.fixed_height_small_still.url,
        description: gif.title || "No description",
        sortOrder: idx,
      };
    });
    await GifModel.insertMany(gifs);
  });

  // if (!config.giphyApiKey) throw new AppError("Giphy API key not found", 500);
  // const gf = new GiphyFetch(config.giphyApiKey);
  // const { data: gifs } = await gf.search("Oops", {
  //   limit: 1,
  //   offset: 200,
  //   sort: "relevant",
  // });
  // gifData["Oops"].push(gifs[0]);
  // fs.writeFileSync(`${__dirname}/../../../data/gif-data-raw.json`, JSON.stringify(gifData));
  await Promise.all(prms);
  return [];
}

export default {
  getGifsBySearchTerm,
  getGifCategories,
  getGifByCategory,
  demoSearch,
};
