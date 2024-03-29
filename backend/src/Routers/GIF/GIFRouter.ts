import express from "express";
import {
  getGifsBySearchTerm,
  getGifCategories,
  getGifFromDB,
} from "../../controllers/GIF/GIFController";

const router = express.Router();

router.get("/search", getGifsBySearchTerm);
router.get("/", getGifFromDB);
router.get("/categories", getGifCategories);

export default router;
