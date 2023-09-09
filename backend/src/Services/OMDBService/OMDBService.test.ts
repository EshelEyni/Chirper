/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import OMDBService from "./OMDBService";
import { getMockOMDBMovieDetails } from "../test/testUtilService";

jest.mock("axios", () => ({ get: jest.fn() }));

describe("OMDBService", () => {
  beforeEach(() => {
    mockAxiosGet();
  });

  describe("getMovieDetails", () => {
    const prompt = "The Matrix";
    it("should throw an error if api key is undefined", async () => {
      const originalApiKey = process.env.OMDB_API_KEY;
      process.env.OMDB_API_KEY = "";

      await expect(OMDBService.getOMDBContent({ prompt })).rejects.toThrow(
        "OMDB_API_KEY is undefined"
      );

      process.env.OMDB_API_KEY = originalApiKey;
    });

    it("should return movie details", async () => {
      const movieDetails = await OMDBService.getOMDBContent({ prompt });
      expect(movieDetails).toBeDefined();
    });

    it("should throw an error if no movie is found", async () => {
      mockAxiosGet(null);

      await expect(OMDBService.getOMDBContent({ prompt })).rejects.toThrow("No movie found");
    });

    it("should throw an error if movie data is invalid", async () => {
      mockAxiosGet({ data: {} });

      await expect(OMDBService.getOMDBContent({ prompt })).rejects.toThrow("Invalid movie data");
    });

    it.each(Object.keys(getMockOMDBMovieDetails().data))(
      "should throw an error if %s is undefined",
      async (key: string) => {
        const mockMovieDetails = getMockOMDBMovieDetails();
        delete mockMovieDetails.data[key as keyof typeof mockMovieDetails.data];
        mockAxiosGet(mockMovieDetails);

        await expect(OMDBService.getOMDBContent({ prompt })).rejects.toThrow("Invalid movie data");
      }
    );
  });
});

function mockAxiosGet(value?: any) {
  (axios.get as jest.Mock).mockResolvedValue(
    value !== undefined ? value : getMockOMDBMovieDetails()
  );
}
