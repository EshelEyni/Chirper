import { Gif, GifCategory } from "../../../shared/interfaces/gif.interface";
import { httpService } from "./http.service";

export const gifService = {
  getGifsBySearchTerm,
  getGifCategroies,
  getGifByCategory,
};

async function getGifsBySearchTerm(searchTerm: string): Promise<Gif[]> {
  try {
    const gifs = await httpService.get(`gif/search?searchTerm=${searchTerm}`);
    return gifs as Gif[];
  } catch (err) {
    console.log("gifService: Cannot get gifs");
    throw err;
  }
}

async function getGifCategroies(): Promise<GifCategory[]> {
  try {
    const gifs = await httpService.get(`gif/categories`);
    return gifs as GifCategory[];
  } catch (err) {
    console.log("gifService: Cannot get gifs");
    throw err;
  }
}

async function getGifByCategory(category: string): Promise<Gif[]> {
  try {
    const gifs = await httpService.get(`gif/category/${category}`);
    return gifs as Gif[];
  } catch (err) {
    console.log("gifService: Cannot get gifs");
    throw err;
  }
}
