import { Router } from "express";
import { log } from "../../middlewares/logger.middleware";
import {
  getGifsBySearchTerm,
  getGifHeaders,
  getGifByCategory,
} from "./gif.controller";

const router = Router();

router.get("/search", log, getGifsBySearchTerm);
router.get("/headers", log, getGifHeaders);
router.get("/category/:category", log, getGifByCategory);

export default router;
