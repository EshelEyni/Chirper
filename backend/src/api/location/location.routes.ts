module.exports = () => {
  const express = require("express");
  const { log } = require("../../middlewares/logger.middleware");
  const { getUserDefaultLocations, getLocationsBySearchTerm } = require("./location.controller");
  // import { requireAuth, requireAdmin } from "../../middlewares/requireAuth.middleware.js";

  const router = express.Router();

  router.get("/", log, getUserDefaultLocations);
  router.get("/search", log, getLocationsBySearchTerm);

  return router;
};
