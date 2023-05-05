import { Router } from "express";
import { log } from "../../middlewares/logger.middleware.js";
import {
  getGifsBySearchTerm,
  getGifCategories,
  getGifByCategory,
} from "./gif.controller.js";

const router = Router();

router.get("/search", log, getGifsBySearchTerm);
router.get("/categories", log, getGifCategories);
router.get("/category/:category", log, getGifByCategory);

export default router;
