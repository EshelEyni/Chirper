module.exports = () => {
  const express = require("express");
  const { getUserDefaultLocations, getLocationsBySearchTerm } = require("./location.controller");
  // import { requireAuth, requireAdmin } from "../../middlewares/requireAuth.middleware.js";

  const router = express.Router();

  router.get("/", getUserDefaultLocations);
  router.get("/search", getLocationsBySearchTerm);

  return router;
};
