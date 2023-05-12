import express from "express";
import { getUserDefaultLocations, getLocationsBySearchTerm } from "./location.controller";
// import { requireAuth, requireAdmin } from "../../middlewares/requireAuth.middleware.js";

const router = express.Router();

router.get("/", getUserDefaultLocations);
router.get("/search", getLocationsBySearchTerm);

export default router;
