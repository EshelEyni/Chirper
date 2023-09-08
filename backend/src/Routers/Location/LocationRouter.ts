import express from "express";
import {
  getUserDefaultLocations,
  getLocationsBySearchTerm,
} from "../../Controllers/Location/LocationController";
import { checkUserAuthentication } from "../../Middlewares/AuthGuards/AuthGuardsMiddleware";

const router = express.Router();

router.use(checkUserAuthentication);
router.get("/", getUserDefaultLocations);
router.get("/search", getLocationsBySearchTerm);

export default router;
