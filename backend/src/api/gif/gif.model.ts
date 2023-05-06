const mongoose = require("mongoose");

const gifSchema = new mongoose.Schema({
  url: String,
  staticUrl: String,
});

const GifModel = mongoose.model("Gif", gifSchema);

module.exports = {
  gifSchema,
  GifModel,
};
