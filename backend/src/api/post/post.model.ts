import mongoose from "mongoose";
import { PostDocument } from "../../../../shared/interfaces/post.interface";
import { CustomQuery } from "../../../../shared/interfaces/system.interface";
import { logger } from "../../services/logger.service.js";
import { UserModel } from "../user/user.model.js";

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

function validateContent(post: mongoose.Document) {
  return (
    post.get("text") ||
    post.get("gifUrl") ||
    (post.get("imgUrls") && post.get("imgUrls").length > 0) ||
    post.get("poll")
  );
}

postSchema.pre("save", function (next) {
  if (!validateContent(this)) {
    next(new Error("At least one of text, gifUrl, imgUrls, or poll is required"));
  } else {
    next();
  }
});

// async function addUserToPost(post: PostDocument): Promise<PostDocument> {
//   const user = await UserModel.findById(post.userId);
//   if (user) {
//     post.set("user", user.toObject());
//     post.set("userId", undefined);
//   }
//   return post;
// }

// postSchema.pre(/^find/, function (this: CustomQuery<PostDocument>, next) {
//   this.find({ isPublic: true });
//   this.start = Date.now();
//   next();
// });

// postSchema.post(/^find/, async function (this: CustomQuery<PostDocument>, docs) {
//   const msg = `Query took ${Date.now() - this.start} milliseconds!`;
//   logger.info(msg);
// });

export const PostModel = mongoose.model("Post", postSchema);
