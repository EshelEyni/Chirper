import { Post, PostDocument } from "../../../../shared/interfaces/post.interface";
import { Document, Query, DocumentSetOptions } from "mongoose";

const mongoose = require("mongoose");
const { logger } = require("../../services/logger.service");

const pollSchema = new mongoose.Schema({
  choices: [String],
  length: {
    days: Number,
    hours: Number,
    minutes: Number,
  },
  createdAt: Number,
});

const gifSchema = new mongoose.Schema({
  url: String,
  staticUrl: String,
});

const locationSchema = new mongoose.Schema({
  placeId: String,
  name: String,
  lat: Number,
  lng: Number,
});

const postSchema = new mongoose.Schema({
  createdAt: {
    type: Number,
    required: true,
  },
  commentSum: {
    type: Number,
    default: 0,
  },
  rechirps: {
    type: Number,
    default: 0,
  },
  likes: {
    type: Number,
    default: 0,
  },
  views: {
    type: Number,
    default: 0,
  },
  audience: {
    type: String,
    required: true,
  },
  repliersType: {
    type: String,
    required: true,
  },
  isPublic: {
    type: Boolean,
    required: true,
    default: true,
  },
  userId: {
    type: String,
    required: true,
  },
  text: String,
  imgUrls: [String],
  videoUrl: String,
  gifUrl: gifSchema,
  poll: pollSchema,
  schedule: Date,
  location: locationSchema,
});

function validateContent(post: Document) {
  return (
    post.get("text") ||
    post.get("gifUrl") ||
    (post.get("imgUrls") && post.get("imgUrls").length > 0) ||
    post.get("poll")
  );
}

postSchema.pre("save", function (this: Document, next: (err?: Error) => void) {
  if (!validateContent(this)) {
    next(new Error("At least one of text, gifUrl, imgUrls, or poll is required"));
  } else {
    next();
  }
});

postSchema.pre(/^find/, function (this: Query<Document, Post>, next: (err?: Error) => void) {
  this.find({ isPublic: true });
  next();
});

module.exports = mongoose.model("Post", postSchema);
