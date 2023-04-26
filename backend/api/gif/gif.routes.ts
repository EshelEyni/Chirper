import { Router } from "express";
import { log } from "../../middlewares/logger.middleware";
import {
  getGifsBySearchTerm,
  getGifCategories,
  getGifByCategory,
} from "./gif.controller";

const router = Router();

router.get("/search", log, getGifsBySearchTerm);
router.get("/categories", log, getGifCategories);
router.get("/category/:category", log, getGifByCategory);

export default router;
