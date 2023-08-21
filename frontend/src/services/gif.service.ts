import { Gif, GifCategory } from "../../../shared/interfaces/gif.interface";
import { JsendResponse } from "../../../shared/interfaces/system.interface";
import httpService from "./http.service";
import queryString from "query-string";
import { handleServerResponse } from "./util/utils.service";

async function getGifsBySearchTerm(searchTerm: string): Promise<Gif[]> {
  const query = queryString.stringify({ searchTerm });
  const response = (await httpService.get(`gif/search?${query}`)) as unknown as JsendResponse;
  return handleServerResponse<Gif[]>(response);
}

async function getGifCategroies(): Promise<GifCategory[]> {
  const response = (await httpService.get(
    `gif/categories?sort=sortOrder`
  )) as unknown as JsendResponse;
  return handleServerResponse<GifCategory[]>(response);
}

export default { getGifsBySearchTerm, getGifCategroies };

export const gifPlaceholderBcg = ["#00BFFF", "#0BDA51", "#FFD700", "#FF00FF"];
