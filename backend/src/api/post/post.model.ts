import { Post, PostDocument } from "../../../../shared/interfaces/post.interface";
import { Document, Query } from "mongoose";
import { MiniUser } from "../../../../shared/interfaces/user.interface";
import { log } from "console";

const { gifSchema } = require("../gif/gif.model");
const mongoose = require("mongoose");
const { logger } = require("../../services/logger.service");

const imgUrlsSchema = new mongoose.Schema({
  url: String,
  sortOrder: Number,
});

const pollSchema = new mongoose.Schema(
  {
    options: [String],
    length: {
      days: Number,
      hours: Number,
      minutes: Number,
    },
  },
  {
    timestamps: true,
  }
);

const locationSchema = new mongoose.Schema({
  placeId: String,
  name: String,
  lat: Number,
  lng: Number,
});

const postSchema = new mongoose.Schema(
  {
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
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    text: String,
    imgs: [imgUrlsSchema],
    videoUrl: String,
    gifUrl: gifSchema,
    poll: pollSchema,
    schedule: Date,
    location: locationSchema,
  },
  {
    toObject: {
      virtuals: true,
      transform: (doc: Document, ret: Record<string, unknown>) => {
        delete ret.userId;
        delete ret._id;
        return ret;
      },
    },
    toJSON: {
      virtuals: true,
      transform: (doc: Document, ret: Record<string, unknown>) => {
        delete ret.userId;
        delete ret._id;
        return ret;
      },
    },
    timestamps: true,
  }
);

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

postSchema.pre("save", function (this: Document, next: (err?: Error) => void) {
  if (this.get("schedule") !== null) {
    this.set("isPublic", false);
  } else {
    this.set("isPublic", true);
  }
  next();
});

postSchema.post("save", function (this: Document) {
  logger.success("Post saved ", this.get("id"));
});

postSchema.virtual("user", {
  ref: "User",
  localField: "userId",
  foreignField: "_id",
  justOne: true,
});

// postSchema.pre(
//   /^find/,
//   function (this: Query<Document, Post>, next: (err?: Error) => void) {
//     this.find({ isPublic: true });
//     next();
//   }
// );

const PostModel = mongoose.model("Post", postSchema);

module.exports = {
  PostModel,
};
