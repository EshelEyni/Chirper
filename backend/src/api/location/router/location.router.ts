import express from "express";
import {
  getUserDefaultLocations,
  getLocationsBySearchTerm,
} from "../controller/location.controller";
import { checkUserAuthentication } from "../../../middlewares/authGuards/authGuards.middleware";

const router = express.Router();

router.use(checkUserAuthentication);
router.get("/", getUserDefaultLocations);
router.get("/search", getLocationsBySearchTerm);

export default router;
