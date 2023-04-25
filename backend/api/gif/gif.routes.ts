import { Router } from "express";
import { log } from "../../middlewares/logger.middleware";
import {
  getGifsBySearchTerm,
  getGifCategories,
  getGifByCategory,
} from "./gif.controller";
import { gifService } from "./gif.service";

const router = Router();

router.get("/search", log, getGifsBySearchTerm);
router.get("/categories", log, getGifCategories);
router.get("/category/:category", log, getGifByCategory);
router.get("/fix", gifService.fixGifCollection);

export default router;
