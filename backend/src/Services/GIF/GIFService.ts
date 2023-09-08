require("dotenv").config();
import fetch from "cross-fetch";
import { Gif } from "../../../../shared/types/gif.interface";
import { GiphyFetch } from "@giphy/js-fetch-api";
import { AppError } from "../Error/ErrorService";
import { APIFeatures } from "../Util/UtilService";
import { GifModel } from "../../Models/GIF/GIFModel";

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
    if (!_validateFetchedGif(gif)) continue;
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
function _validateFetchedGif(gif: Record<string, any>) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const hasNestedProperty = (obj: Record<string, any>, propertyPath: string): boolean => {
    const properties = propertyPath.split(".");
    for (const property of properties) {
      if (!obj || !Object.prototype.hasOwnProperty.call(obj, property)) {
        return false;
      }
      obj = obj[property];
    }
    return true;
  };

  const requiredPaths = [
    "id",
    "images.original.url",
    "images.original_still.url",
    "images.original.height",
    "images.original.width",
    "images.preview_webp.url",
    "images.fixed_width_small_still.url",
  ];

  return requiredPaths.every(path => hasNestedProperty(gif, path));
}

export default { getGifsBySearchTerm, getGifFromDB };
