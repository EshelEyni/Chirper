import express from "express";
import { getUserDefaultLocations, getLocationsBySearchTerm } from "./location.controller";
import { requireAuth } from "../../middlewares/requireAuth.middleware";

const router = express.Router();

router.use(requireAuth);
router.get("/", getUserDefaultLocations);
router.get("/search", getLocationsBySearchTerm);

export default router;
