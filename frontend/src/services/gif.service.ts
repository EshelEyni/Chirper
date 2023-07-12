import { Gif, GifCategory } from "../../../shared/interfaces/gif.interface";
import { JsendResponse } from "../../../shared/interfaces/system.interface";
import { httpService } from "./http.service";
import queryString from "query-string";
import { handleServerResponse } from "./util.service/utils.service";

export const gifService = {
  getGifsBySearchTerm,
  getGifCategroies,
  getGifByCategory,
};

async function getGifsBySearchTerm(searchTerm: string): Promise<Gif[]> {
  try {
    const query = queryString.stringify({ searchTerm });
    const response = (await httpService.get(`gif/search?${query}`)) as unknown as JsendResponse;
    return handleServerResponse<Gif[]>(response);
  } catch (err) {
    console.log("gifService: Cannot get gifs");
    throw err;
  }
}

async function getGifCategroies(): Promise<GifCategory[]> {
  try {
    const response = (await httpService.get(
      `gif/categories?sort=sortOrder`
    )) as unknown as JsendResponse;
    return handleServerResponse<GifCategory[]>(response);
  } catch (err) {
    console.log("gifService: Cannot get gifs");
    throw err;
  }
}

async function getGifByCategory(category: string): Promise<Gif[]> {
  try {
    const response = await httpService.get(
      `gif?category=${category}&sort=sortOrder&fields=url,staticUrl,description,placeholderUrl,staticPlaceholderUrl,size`
    );
    return handleServerResponse<Gif[]>(response);
  } catch (err) {
    console.log("gifService: Cannot get gifs");
    throw err;
  }
}

export const gifPlaceholderBcg = ["#00BFFF", "#0BDA51", "#FFD700", "#FF00FF"];
