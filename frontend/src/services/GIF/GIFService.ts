import queryString from "query-string";
import { Gif, GifCategory } from "../../../../shared/types/GIF";
import { JsendResponse } from "../../../../shared/types/system";
import httpService from "../http/httpService";
import { handleServerResponse } from "../util/utilService";

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
