import axios from "axios";
import { AppError } from "../error/errorService";
import { MovieDetails } from "../../types/app";

require("dotenv").config();
type GetOMDBContentParams = {
  prompt: string;
  type?: "movie" | "series" | "episode";
};

async function getOMDBContent({
  prompt,
  type = "movie",
}: GetOMDBContentParams): Promise<MovieDetails> {
  const apiKey = process.env.OMDB_API_KEY;
  if (!apiKey) throw new AppError("OMDB_API_KEY is undefined", 500);

  const res = await axios.get(
    `http://www.omdbapi.com/?apikey=${apiKey}&type=${type}&r=json&plot=full&t=${prompt}`
  );
  if (!res?.data) throw new AppError("No movie found", 404);

  const { data } = res;

  if (!data.Title || !data.Year || !data.Poster || !data.Released || !data.Director || !data.Writer)
    throw new AppError("Invalid movie data", 500);

  const { Title, Year, Poster, Released, Director, Writer } = data;

  return {
    title: Title,
    year: Year,
    imgUrl: Poster,
    released: Released,
    director: Director,
    writer: Writer,
  };
}

export default { getOMDBContent };
