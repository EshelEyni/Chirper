import { Router } from "express";
import { log } from "../../middlewares/logger.middleware";
import { getGiffsBySearchTerm } from "./gif.controller";

const router = Router();

router.get("/search", log, getGiffsBySearchTerm);

export default router;
