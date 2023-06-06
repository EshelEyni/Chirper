import mongoose, { Document, Query } from "mongoose";
import { gifSchema } from "../gif/gif.model";
import { pollSchema } from "./poll.model";
import { Post } from "../../../../shared/interfaces/post.interface";

const imgsSchema = new mongoose.Schema(
  {
    url: String,
    sortOrder: Number,
  },
  {
    _id: false,
    default: null,
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
    originalPostId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
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
    isDraft: {
      type: Boolean,
    },
    previousThreadPostId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
    },
    repliedPostDetails: [
      {
        postId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Post",
        },
        postOwner: {
          userId: mongoose.Schema.Types.ObjectId,
          username: String,
        },
      },
    ],
    createdById: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    repostedById: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    text: {
      type: String,
      trim: true,
    },
    imgs: {
      type: [imgsSchema],
      default: undefined,
    },
    videoUrl: String,
    gif: gifSchema,
    poll: pollSchema,
    schedule: Date,
    location: locationSchema,
    // commentCount: {
    //   type: Number,
    //   default: 0,
    // },
    // repostCount: {
    //   type: Number,
    //   default: 0,
    // },
    // likeCount: {
    //   type: Number,
    //   default: 0,
    // },
    // viewCount: {
    //   type: Number,
    //   default: 0,
    // },
  },
  {
    toObject: {
      virtuals: true,
      transform: (doc: Document, ret: Record<string, unknown>) => {
        delete ret.createdById;
        delete ret._id;
        return ret;
      },
    },
    toJSON: {
      virtuals: true,
      transform: (doc: Document, ret: Record<string, unknown>) => {
        delete ret.createdById;
        delete ret._id;
        return ret;
      },
    },
    timestamps: true,
  }
);

function validateContent(post: Document) {
  const imgs = post.get("imgs");
  return (
    post.get("text") ||
    post.get("gif") ||
    (imgs && imgs.length > 0) ||
    post.get("poll") ||
    post.get("videoUrl")
  );
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

postSchema.index({ createdAt: -1 });
postSchema.index({ userId: 1 });
postSchema.index({ schedule: 1 }, { partialFilterExpression: { schedule: { $exists: true } } });
postSchema.index(
  { originalPostId: 1, repostedById: 1 },
  {
    unique: true,
    partialFilterExpression: {
      originalPostId: { $type: "objectId" },
      repostedById: { $type: "objectId" },
    },
  }
);

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
  if (this.get("schedule") === undefined && this.get("isDraft") === undefined) {
    this.set("isPublic", true);
  } else {
    this.set("isPublic", false);
  }
  next();
});

postSchema.pre("save", function (this: Document, next: () => void) {
  // Trimming last occurence of videoUrl
  const videoUrl = this.get("videoUrl");

  if (videoUrl) {
    const postText = this.get("text");
    const idx = postText.lastIndexOf(videoUrl);
    const trimmedText = postText.slice(0, idx) + postText.slice(idx + videoUrl.length);
    this.set("text", trimmedText);
  }
  next();
});

function populateCreatedBy(doc: Document) {
  return doc.populate("createdBy", {
    _id: 1,
    username: 1,
    fullname: 1,
    imgUrl: 1,
    isVerified: 1,
    isAdmin: 1,
  });
}

function populateRepostedBy(doc: Document) {
  return doc.populate("repostedBy", {
    _id: 1,
    username: 1,
    fullname: 1,
  });
}

postSchema.post(/^find/, async function (doc) {
  if (doc.length !== undefined) return;
  await populateCreatedBy(doc);
  await doc.populate("repostCount");
  if (doc.repostedById) {
    await populateRepostedBy(doc);
  }
});

postSchema.post(/^find/, async function (docs) {
  if (docs.length === undefined) return;
  for (const doc of docs) {
    await populateCreatedBy(doc);
    await doc.populate("repostCount");
    if (doc.repostedById) {
      await populateRepostedBy(doc);
    }
  }
});

postSchema.virtual("createdBy", {
  ref: "User",
  localField: "createdById",
  foreignField: "_id",
  justOne: true,
});

postSchema.virtual("repostedBy", {
  ref: "User",
  localField: "repostedById",
  foreignField: "_id",
  justOne: true,
});

// postSchema.virtual("commentCount", {
//   ref: "Post",
//   localField: "_id",
//   foreignField: "postId",
//   count: true,
// });

postSchema.virtual("repostCount", {
  ref: "Post",
  localField: "_id",
  foreignField: "originalPostId",
  count: true,
});

// postSchema.virtual("likeCount", {
//   ref: "Like",
//   localField: "_id",
//   foreignField: "postId",
//   count: true,
// });

// postSchema.virtual("viewCount", {
//   ref: "View",
//   localField: "_id",
//   foreignField: "postId",
//   count: true,
// });

postSchema.pre(/^find/, function (this: Query<Document, Post>, next: (err?: Error) => void) {
  this.find({ isPublic: true });
  next();
});

const PostModel = mongoose.model("Post", postSchema);

export { PostModel };
