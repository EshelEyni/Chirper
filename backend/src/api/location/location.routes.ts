import express from "express";
import { getUserDefaultLocations, getLocationsBySearchTerm } from "./location.controller";
import { requireAuth } from "../../middlewares/requireAuth.middleware";
import { getRequestLimiter } from "../../services/rate-limiter.service";

const router = express.Router();

router.get("/", getRequestLimiter, requireAuth, getUserDefaultLocations);
router.get("/search", getRequestLimiter, requireAuth, getLocationsBySearchTerm);

export default router;
