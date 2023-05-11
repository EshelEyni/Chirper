module.exports = () => {
  const express = require("express");
  const { getGifsBySearchTerm, getGifCategories, getGifByCategory } = require("./gif.controller");
  const router = express.Router();

  router.get("/search", getGifsBySearchTerm);
  router.get("/categories", getGifCategories);
  router.get("/category/:category", getGifByCategory);

  return router;
};
