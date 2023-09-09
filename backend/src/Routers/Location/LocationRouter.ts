import express from "express";
import {
  getUserDefaultLocations,
  getLocationsBySearchTerm,
} from "../../controllers/location/locationController";
import { checkUserAuthentication } from "../../middlewares/authGuards/authGuardsMiddleware";

const router = express.Router();

router.use(checkUserAuthentication);
router.get("/", getUserDefaultLocations);
router.get("/search", getLocationsBySearchTerm);

export default router;
