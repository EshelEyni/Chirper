import { Request, Response } from "express";
const gifService = require("./gif.service");
const { asyncErrorCatcher, AppError } = require("../../services/error.service");

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

const getGifCategories = asyncErrorCatcher(async (req: Request, res: Response): Promise<void> => {
  const gifHeaders = await gifService.getGifCategories();

  res.status(200).send({
    status: "success",
    requestedAt: new Date().toISOString(),
    results: gifHeaders.length,
    data: gifHeaders,
  });
});

const getGifByCategory = asyncErrorCatcher(async (req: Request, res: Response): Promise<void> => {
  const { category } = req.params;
  if (!category) throw new AppError("No category provided", 400);
  if (!categorySet.has(category)) throw new AppError("Invalid category provided", 400);

  const gifs = await gifService.getGifByCategory(category);

  res.status(200).send({
    status: "success",
    requestedAt: new Date().toISOString(),
    results: gifs.length,
    data: gifs,
  });
});

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

module.exports = {
  getGifsBySearchTerm,
  getGifCategories,
  getGifByCategory,
};
