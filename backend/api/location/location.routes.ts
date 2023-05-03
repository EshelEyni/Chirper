import { Router } from "express";
import {
  requireAuth,
  requireAdmin,
} from "../../middlewares/requireAuth.middleware";
import { log } from "../../middlewares/logger.middleware";
import {
  getUserDefaultLocation,
  getLocationBySearchTerm
} from "./location.controller";

const router = Router();

router.get("/", log, getUserDefaultLocation);
router.get("/search", log, getLocationBySearchTerm);

export default router;
