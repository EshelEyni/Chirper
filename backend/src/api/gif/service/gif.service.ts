import { Gif } from "../../../../../shared/interfaces/gif.interface";
require("dotenv").config();
import fetch from "cross-fetch";
import { GifModel } from "../gif.model";
import { APIFeatures } from "../../../services/util/util.service";
import { AppError } from "../../../services/error/error.service";
import { GiphyFetch } from "@giphy/js-fetch-api";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(global as any).fetch = fetch;

async function getGifsBySearchTerm(searchTerm: string): Promise<Gif[]> {
  const { GIPHY_API_KEY } = process.env;
  if (!GIPHY_API_KEY) throw new AppError("Giphy API key not found", 500);
  const gf = new GiphyFetch(GIPHY_API_KEY);
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
  const gifs = [];

  for (const gif of Fetchedgifs) {
    if (!validateFetchedGif(gif)) continue;
    const formattedGif = {
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

    gifs.push(formattedGif);
  }

  return gifs;
}

async function getGifFromDB(category: string): Promise<Gif[]> {
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function validateFetchedGif(gif: any) {
  if (!gif) return false;
  if (!gif.id) return false;
  if (!gif.images) return false;
  if (!gif.images?.original) return false;

  const requiredImageProps = [
    "url",
    "still.url",
    "height",
    "width",
    "preview_webp.url",
    "fixed_width_small_still.url",
  ];

  return requiredImageProps.every(prop => {
    const props = prop.split(".");
    let currentProp: any = gif.images;
    for (const p of props) {
      if (!currentProp[p]) return false;
      currentProp = currentProp[p];
    }
    return true;
  });
}

export default { getGifsBySearchTerm, getGifFromDB };
