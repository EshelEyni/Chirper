// import { Router } from "express";
const express = require("express");
const { log } = require("../../middlewares/logger.middleware");
const { getUserDefaultLocation, getLocationBySearchTerm } = require("./location.controller");
// import { requireAuth, requireAdmin } from "../../middlewares/requireAuth.middleware.js";

const router = express.Router();

router.get("/", log, getUserDefaultLocation);
router.get("/search", log, getLocationBySearchTerm);

module.exports = router;
