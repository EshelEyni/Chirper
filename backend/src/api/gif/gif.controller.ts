const { logger } = require("../../services/logger.service");
const gifService = require("./gif.service");
import { Request, Response } from "express";

async function getGifsBySearchTerm(req: Request, res: Response): Promise<void> {
  try {
    const searchTerm = req.query.searchTerm as string;
    if (!searchTerm) {
      res.status(400).send({
        status: "fail",
        data: {
          searchTerm: "No search term provided",
        },
      });
      return;
    }

    const gif = await gifService.getGifsBySearchTerm(searchTerm);

    res.status(200).send({
      status: "success",
      requestedAt: new Date().toISOString(),
      results: gif.length,
      data: gif,
    });
  } catch (err) {
    logger.error("Failed to get gif", err as Error);

    res.status(500).send({
      status: "error",
      message: "Failed to get gif",
    });
  }
}

async function getGifCategories(req: Request, res: Response): Promise<void> {
  try {
    const gifHeaders = await gifService.getGifCategories();

    res.status(200).send({
      status: "success",
      requestedAt: new Date().toISOString(),
      results: gifHeaders.length,
      data: gifHeaders,
    });
  } catch (err) {
    logger.error("Failed to get gif headers", err as Error);

    res.status(500).send({
      status: "error",
      message: "Failed to get gif headers",
    });
  }
}

async function getGifByCategory(req: Request, res: Response): Promise<void> {
  try {
    const { category } = req.params;

    if (!category) {
      res.status(400).send({
        status: "fail",
        data: {
          category: "No category provided",
        },
      });
      return;
    }
    const gifs = await gifService.getGifByCategory(category);

    res.status(200).send({
      status: "success",
      requestedAt: new Date().toISOString(),
      results: gifs.length,
      data: gifs,
    });
  } catch (err) {
    logger.error("Failed to get gif", err as Error);

    res.status(500).send({
      status: "error",
      message: "Failed to get gif",
    });
  }
}

module.exports = {
  getGifsBySearchTerm,
  getGifCategories,
  getGifByCategory,
};
