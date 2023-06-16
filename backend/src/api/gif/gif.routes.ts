import express from "express";
import { getGifsBySearchTerm, getGifCategories, getGifByCategory } from "./gif.controller";
const router = express.Router();

router.get("/search", getGifsBySearchTerm);
router.get("/", getGifByCategory);
router.get("/categories", getGifCategories);

export default router;
