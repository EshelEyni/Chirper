import { Router } from "express";
import {
  requireAuth,
  requireAdmin,
} from "../../middlewares/requireAuth.middleware.js";
import { log } from "../../middlewares/logger.middleware.js";
import {
  getUserDefaultLocation,
  getLocationBySearchTerm
} from "./location.controller.js";

const router = Router();

router.get("/", log, getUserDefaultLocation);
router.get("/search", log, getLocationBySearchTerm);

export default router;
