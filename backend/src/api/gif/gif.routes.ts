import express from "express";
import {
  getGifsBySearchTerm,
  getGifCategories,
  getGifByCategory,
  demoSearch,
} from "./gif.controller";
const router = express.Router();

router.get("/search", getGifsBySearchTerm);
router.get("/", getGifByCategory);
router.get("/categories", getGifCategories);

router.get("/demo-search", demoSearch);
export default router;
