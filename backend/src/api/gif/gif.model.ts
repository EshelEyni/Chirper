const mongoose = require("mongoose");

const gifSchema = new mongoose.Schema({
  url: String,
  staticUrl: String,
});

const gifCategorySchema = new mongoose.Schema({
  name: String,
  sortOrder: Number,
  imgUrl: String,
});

const GifModel = mongoose.model("Gif", gifSchema);
const GifCategoryModel = mongoose.model("GifCategory", gifCategorySchema, "gif_categories");

module.exports = {
  gifSchema,
  GifModel,
  gifCategorySchema,
  GifCategoryModel,
};
