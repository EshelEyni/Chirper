import { Document } from "mongoose";

import { gifSchema } from "../gif/gif.model";
import mongoose from "mongoose";

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
    rechirpSum: {
      type: Number,
      default: 0,
    },
    likeSum: {
      type: Number,
      default: 0,
    },
    viewSum: {
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
    text: {
      type: String,
      trim: true,
    },
    imgs: [imgUrlsSchema],
    videoUrl: String,
    gif: gifSchema,
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
    post.get("gif") ||
    (post.get("imgs") && post.get("imgs").length > 0) ||
    post.get("poll")
  );
}

postSchema.pre("save", function (this: Document, next: (err?: Error) => void) {
  if (!validateContent(this)) {
    const err = new Error("At least one of text, gif, imgs, or poll is required");
    err.name = "ValidationError";
    next(err);
  } else {
    next();
  }
});

postSchema.pre("save", function (this: Document, next: () => void) {
  if (this.get("schedule") !== null) {
    this.set("isPublic", false);
  } else {
    this.set("isPublic", true);
  }
  next();
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

export { PostModel };
