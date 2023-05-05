module.exports = () => {
  const express = require("express");
  const { log } = require("../../middlewares/logger.middleware");
  const { getGifsBySearchTerm, getGifCategories, getGifByCategory } = require("./gif.controller");
  const router = express.Router();

  router.get("/search", log, getGifsBySearchTerm);
  router.get("/categories", log, getGifCategories);
  router.get("/category/:category", log, getGifByCategory);

  return router;
};
