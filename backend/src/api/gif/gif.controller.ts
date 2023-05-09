import { Request, Response } from "express";
const { logger } = require("../../services/logger.service");
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
  const statusCode = gifHeaders.length > 0 ? 200 : 404;
  const data = gifHeaders.length > 0 ? gifHeaders : "No gif categories found";

  res.status(statusCode).send({
    status: "success",
    requestedAt: new Date().toISOString(),
    results: gifHeaders.length,
    data,
  });
});

const getGifByCategory = asyncErrorCatcher(async (req: Request, res: Response): Promise<void> => {
  const { category } = req.params;
  if (!category) throw new AppError("No category provided", 400);
  if (!categorySet.has(category)) throw new AppError("Invalid category provided", 400);

  const gifs = await gifService.getGifByCategory(category);
  const statusCode = gifs.length > 0 ? 200 : 404;
  const data = gifs.length > 0 ? gifs : { category: `No gifs found for ${category}` };

  res.status(statusCode).send({
    status: "success",
    requestedAt: new Date().toISOString(),
    results: gifs.length,
    data,
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

    const statusCode = gifs.length > 0 ? 200 : 404;
    const data = gifs.length > 0 ? gifs : { searchTerm: `No gifs found for ${searchTerm}` };

    res.status(statusCode).send({
      status: "success",
      requestedAt: new Date().toISOString(),
      results: gifs.length,
      data,
    });
  }
);

module.exports = {
  getGifsBySearchTerm,
  getGifCategories,
  getGifByCategory,
};
