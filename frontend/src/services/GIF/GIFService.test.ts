import GIFService from "./GIFService";
import httpService from "../http/httpService";
import { handleServerResponseData } from "../util/utilService";
import { beforeEach, describe, expect, it, vi, Mock } from "vitest";

vi.mock("axios");
vi.mock("../http/httpService");
vi.mock("../util/utilService");

describe("Gif Service", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("should fetch gifs by search term", async () => {
    const mockResponse = { data: ["gif1", "gif2"] };
    (httpService.get as Mock).mockResolvedValue(mockResponse);
    (handleServerResponseData as Mock).mockReturnValue(mockResponse.data);

    const result = await GIFService.getGifsBySearchTerm("funny");
    expect(result).toEqual(["gif1", "gif2"]);
    expect(httpService.get).toHaveBeenCalledWith("gif/search?searchTerm=funny");
    expect(handleServerResponseData).toHaveBeenCalledWith(mockResponse);
  });

  it("should fetch gif categories", async () => {
    const mockResponse = { data: ["category1", "category2"] };
    (httpService.get as Mock).mockResolvedValue(mockResponse);
    (handleServerResponseData as Mock).mockReturnValue(mockResponse.data);

    const result = await GIFService.getGifCategroies();
    expect(result).toEqual(["category1", "category2"]);
    expect(httpService.get).toHaveBeenCalledWith("gif/categories?sort=sortOrder");
    expect(handleServerResponseData).toHaveBeenCalledWith(mockResponse);
  });
});
