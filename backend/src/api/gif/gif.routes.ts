import express from "express";
import { getGifsBySearchTerm, getGifCategories, getGifByCategory } from "./gif.controller";
import { getRequestLimiter } from "../../services/rate-limiter.service";
const router = express.Router();

router.get("/search", getRequestLimiter, getGifsBySearchTerm);
router.get("/categories", getRequestLimiter, getGifCategories);
router.get("/category/:category", getRequestLimiter, getGifByCategory);

export default router;
