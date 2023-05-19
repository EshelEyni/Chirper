import mongoose, { Document, Query } from "mongoose";
import { gifSchema } from "../gif/gif.model";
import { pollSchema } from "./poll.model";
import { Post } from "../../../../shared/interfaces/post.interface";

export interface IPost {
  commentSum: number;
  rechirpSum: number;
  likeSum: number;
  viewSum: number;
  audience: string;
  repliersType: string;
  isPublic: boolean;
  userId: mongoose.Schema.Types.ObjectId;
  text: string;
  imgs: { url: string; sortOrder: number }[];
  videoUrl: string;
  gif: {
    url: string;
    staticUrl: string;
    description: string;
    sortOrder: number;
  };
  poll: {
    options: {
      text: string;
      voteSum: number;
      isLoggedinUserVoted: boolean;
    }[];
    length: {
      days: number;
      hours: number;
      minutes: number;
    };
  };
  schedule: Date;
  location: {
    placeId: string;
    name: string;
    lat: number;
    lng: number;
  };

  createdAt: Date;
  updatedAt: Date;

  _id: mongoose.Schema.Types.ObjectId;
}

const imgUrlsSchema = new mongoose.Schema({
  url: String,
  sortOrder: Number,
});

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
      required: true,
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
  return post.get("text") || post.get("gif") || post.get("imgs").length > 0 || post.get("poll");
}

function validatePoll(poll: Document) {
  return poll.get("options").length > 1 && poll.get("options").length <= 4;
}

function validateSchedule(post: Document) {
  if (post.get("schedule") < new Date()) {
    return "Schedule cannot be in the past";
  } else if (post.get("poll")) {
    return "Post with poll cannot be scheduled";
  } else {
    return "valid";
  }
}

postSchema.pre("save", function (this: Document, next: (err?: Error) => void) {
  if (!validateContent(this)) {
    const err = new Error("At least one of text, gif, imgs, or poll is required");
    err.name = "ValidationError";
    next(err);
  } else if (this.get("poll") && !validatePoll(this.get("poll"))) {
    const err = new Error("Poll must have at least 2 options and at most 4 options");
    err.name = "ValidationError";
    next(err);
  } else if (this.get("schedule")) {
    const scheduleValidation = validateSchedule(this);
    if (scheduleValidation !== "valid") {
      const err = new Error(scheduleValidation);
      err.name = "ValidationError";
      next(err);
    } else {
      next();
    }
  } else {
    next();
  }
});

postSchema.pre("save", function (this: Document, next: () => void) {
  if (this.get("schedule") === undefined) {
    this.set("isPublic", true);
  } else {
    this.set("isPublic", false);
  }
  next();
});

postSchema.virtual("user", {
  ref: "User",
  localField: "userId",
  foreignField: "_id",
  justOne: true,
});

postSchema.pre(/^find/, function (this: Query<Document, Post>, next: (err?: Error) => void) {
  this.find({ isPublic: true });
  next();
});

const PostModel = mongoose.model("Post", postSchema);

export { PostModel };
