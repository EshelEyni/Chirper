import { Request, Response } from "express";
import gifService from "./gif.service";
import { asyncErrorCatcher, AppError } from "../../services/error.service";
import factory from "../../services/factory.service";
import { GifCategoryModel, GifModel } from "./gif.model";

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
const categorySet = new Set(categories);

const getGifCategories = factory.getAll(GifCategoryModel);
const getGifByCategory = factory.getAll(GifModel);

const getGifsBySearchTerm = asyncErrorCatcher(
  async (req: Request, res: Response): Promise<void> => {
    const searchTerm = req.query.searchTerm as string;
    if (!searchTerm) throw new AppError("No search term provided", 400);

    let gifs;
    if (categorySet.has(searchTerm)) {
      gifs = await gifService.getGifByCategory(searchTerm);
    } else {
      gifs = await gifService.getGifsBySearchTerm(searchTerm);
    }

    res.status(200).send({
      status: "success",
      requestedAt: new Date().toISOString(),
      results: gifs.length,
      data: gifs,
    });
  }
);

export { getGifsBySearchTerm, getGifCategories, getGifByCategory };
