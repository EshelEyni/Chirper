import { Request, Response } from "express";
import gifService from "../service/gif.service";
import { asyncErrorCatcher, AppError } from "../../../services/error/error.service";
import { getAll } from "../../../services/factory/factory.service";
import { GifCategoryModel, GifModel } from "../model/gif.model";

const getGifCategories = getAll(GifCategoryModel);
const getGifFromDB = getAll(GifModel);

const getGifsBySearchTerm = asyncErrorCatcher(
  async (req: Request, res: Response): Promise<void> => {
    const { searchTerm } = req.query;
    if (!searchTerm) throw new AppError("No search term provided", 400);
    if (typeof searchTerm !== "string") throw new AppError("Search term must be a string", 400);

    let gifs;
    if (_isCategory(searchTerm)) gifs = await gifService.getGifFromDB(searchTerm);
    else gifs = await gifService.getGifsBySearchTerm(searchTerm);

    res.send({
      status: "success",
      requestedAt: new Date().toISOString(),
      results: gifs.length,
      data: gifs,
    });
  }
);

function _isCategory(searchTerm: string) {
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
  return categorySet.has(searchTerm);
}

export { getGifsBySearchTerm, getGifCategories, getGifFromDB };
