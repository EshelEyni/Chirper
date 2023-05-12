import express from "express";
import { getGifsBySearchTerm, getGifCategories, getGifByCategory } from "./gif.controller";
const router = express.Router();

router.get("/search", getGifsBySearchTerm);
router.get("/categories", getGifCategories);
router.get("/category/:category", getGifByCategory);

export default router;
