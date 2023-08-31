import mongoose, { Document, Query } from "mongoose";
import { gifSchema } from "../../gif/model/gif.model";
import { pollSchema } from "./poll.model";
import {
  Poll,
  Post,
  PostImg,
  repliedPostDetails,
} from "../../../../../shared/interfaces/post.interface";
// import { UserRelationModel } from "../../user/models/user-relation/user-relation.model";
import { Gif } from "../../../../../shared/interfaces/gif.interface";
import { Location } from "../../../../../shared/interfaces/location.interface";
import { UserRelationModel } from "../../user/models/user-relation/user-relation.model";

export interface IPost extends Document {
  audience: string;
  repliersType: string;
  isPublic: boolean;
  isDraft?: boolean;
  previousThreadPostId?: string;
  repliedPostDetails?: repliedPostDetails[];
  createdById: string;
  text?: string;
  imgs?: PostImg[];
  videoUrl?: string;
  gif?: Gif;
  poll?: Poll;
  schedule?: Date;
  location?: Location;
  quotedPostId?: string;
  repliesCount?: number;
  repostsCount?: number;
  likesCount?: number;
  viewsCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

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
    // TODO: add validation for audience and repliersType
    audience: {
      type: String,
      default: "everyone",
    },

    repliersType: {
      type: String,
      default: "everyone",
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
    isDraft: {
      type: Boolean,
    },
    isPinned: {
      type: Boolean,
      default: false,
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
    text: {
      type: String,
      trim: true,
    },
    imgs: {
      type: [imgsSchema],
      default: undefined,
      validate: {
        validator: (imgs: Post["imgs"]) => (!imgs ? true : imgs.length <= 4),
        message: "Post must have no more than 4 images.",
      },
    },
    videoUrl: String,
    gif: gifSchema,
    poll: pollSchema,
    schedule: Date,
    location: locationSchema,
    quotedPostId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
    },
    // TODO: Delete these fields
    repliesCount: {
      type: Number,
      default: 0,
    },
    repostsCount: {
      type: Number,
      default: 0,
    },
    likesCount: {
      type: Number,
      default: 0,
    },
    viewsCount: {
      type: Number,
      default: 0,
    },
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
  const options = poll.get("options");
  return options.length > 1 && options.length <= 5;
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

postSchema.pre("save", function (this: Document, next: (err?: Error) => void) {
  const poll = this.get("poll");
  if (!validateContent(this)) {
    const err = new Error("At least one of text, gif, imgs, or poll is required");
    err.name = "ValidationError";
    next(err);
  } else if (poll && !validatePoll(poll)) {
    const err = new Error("Poll must have at least 2 options and at most 5 options");
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
  if (!videoUrl) next();
  const postText = this.get("text");
  const idx = postText.lastIndexOf(videoUrl);
  const trimmedText = postText.slice(0, idx) + postText.slice(idx + videoUrl.length);
  this.set("text", trimmedText);
  next();
});

async function populateCreatedBy(doc: Document) {
  const populatedDoc = await doc.populate("createdBy", {
    _id: 1,
    username: 1,
    fullname: 1,
    imgUrl: 1,
    isVerified: 1,
    isAdmin: 1,
    bio: 1,
    followersCount: 1,
    followingCount: 1,
  });
  const userId = populatedDoc.get("createdById");
  const followersCount = await UserRelationModel.countDocuments({
    toUserId: userId,
  });
  const followingCount = await UserRelationModel.countDocuments({
    fromUserId: userId,
  });
  // populatedDoc.followersCount = followersCount;
  // populatedDoc.followingCount = followingCount;
  populatedDoc.set("createdBy.followersCount", followersCount);
  populatedDoc.set("createdBy.followingCount", followingCount);
}

async function populateQuotedPost(doc: Document) {
  const populatedDoc = await doc.populate("quotedPost", {
    _id: 1,
    text: 1,
    videoUrl: 1,
    gif: 1,
    poll: 1,
    imgs: 1,
    isPublic: 1,
    audience: 1,
    repliersType: 1,
    createdAt: 1,
    createdById: 1,
  });
  await populateCreatedBy(populatedDoc.get("quotedPost"));
}

postSchema.post("save", async function (doc: Document) {
  console.log("postSchema.post('save')", doc);
  if (!doc) return;
  await populateCreatedBy(doc);
  if (!doc.get("quotedPostId")) return;
  await populateQuotedPost(doc);
});

postSchema.post(/^find/, async function (this: Query<Document[], Post>, doc) {
  const options = this.getOptions();
  if (options.skipHooks || !doc || doc.length !== undefined) return;
  await populateCreatedBy(doc);
  if (!doc.get("quotedPostId")) return;
  await populateQuotedPost(doc);
  if (doc.get("quotedPost")) await populateCreatedBy(doc.get("quotedPost"));
});

// postSchema.post(/^find/, async function (this: Query<Document[], Post>, docs) {
//   const options = this.getOptions();
//   if (options.skipHooks || !docs || docs.length === undefined) return;
//   for (const doc of docs) {
//     await populateCreatedBy(doc);
//     if (doc.get("quotedPostId")) {
//       await populateQuotedPost(doc);
//       if (doc.get("quotedPost")) {
//         await populateCreatedBy(doc.get("quotedPost"));
//       }
//     }
//   }
// });

postSchema.virtual("createdBy", {
  ref: "User",
  localField: "createdById",
  foreignField: "_id",
  justOne: true,
  hooks: true,
});

postSchema.virtual("quotedPost", {
  ref: "Post",
  localField: "quotedPostId",
  foreignField: "_id",
  justOne: true,
});

postSchema.pre(/^find/, function (this: Query<Document, Post>, next: (err?: Error) => void) {
  this.find({ isPublic: true });
  next();
});

const PostModel = mongoose.model("Post", postSchema);

export { PostModel, postSchema };
