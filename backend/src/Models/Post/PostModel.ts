import { ObjectId } from "mongodb";
import mongoose, { Document, Query, Schema } from "mongoose";
import { Post } from "../../../../shared/types/post.interface";
import { IPost, IPostDoc } from "../../Types/ITypes";
import { gifSchema } from "../GIF/GIFModel";
import userRelationService from "../../Services/UserRelation/UserRelationService";
import { UserModel } from "../User/UserModel";
import { imgsSchema, locationSchema, pollSchema } from "./PostSubSchemas";
import { AppError } from "../../Services/Error/ErrorService";
import { queryEntityExists } from "../../Services/Util/UtilService";
import { populatePostData } from "../../Services/Post/PopulatePostData";
import { PostBookmarkModel } from "../PostBookmark/PostBookmarkModel";
import { PostLikeModel } from "../PostLike/PostLikeModel";
import { PostStatsModel } from "../PostStats/PostStatsModel";
import { RepostModel } from "../Repost/RepostModel";

const postSchema: Schema<IPost> = new mongoose.Schema(
  {
    text: {
      type: String,
      trim: true,
    },
    imgs: {
      type: [imgsSchema],
      validate: {
        validator: (imgs: Post["imgs"]) => (!imgs ? true : imgs.length <= 4),
        message: "Post must have no more than 4 images.",
      },
    },
    videoUrl: {
      type: String,
      trim: true,
      validate: {
        validator: (videoUrl: Post["videoUrl"]) => {
          if (!videoUrl) return true;
          const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/watch\?v=.+$/;
          const cloudinaryRegex =
            /^https:\/\/res\.cloudinary\.com\/[a-zA-Z0-9]+\/video\/upload\/v[0-9]+\/[a-zA-Z0-9]+\.mp4$/;

          return youtubeRegex.test(videoUrl) || cloudinaryRegex.test(videoUrl);
        },
        message: "Video URL must be a valid YouTube or Vimeo URL.",
      },
    },
    gif: gifSchema,
    poll: pollSchema,
    schedule: Date,
    location: locationSchema,
    createdById: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "Post must have a createdById"],
      ref: "User",
      validate: {
        validator: async (id: ObjectId) => queryEntityExists(UserModel, { _id: id }),
        message: "Referenced user does not exist",
      },
    },
    quotedPostId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      validate: {
        validator: async (id: ObjectId) => !!(await mongoose.models.Post.findById({ _id: id })),
        message: "Referenced post does not exist",
      },
    },
    audience: {
      type: String,
      default: "everyone",
      enum: {
        values: ["everyone", "chirper-circle"],
        message: "Audience must be either everyone or chirper-circle",
      },
    },
    repliersType: {
      type: String,
      default: "everyone",
      enum: {
        values: ["everyone", "followed", "mentioned"],
        message: "Repliers type must be either everyone, followed, or mentioned",
      },
    },
    parentPostId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      validate: {
        validator: async (id: string) => !!(await mongoose.models.Post.findById({ _id: id })),
        message: "Referenced post does not exist",
      },
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
  },
  {
    toObject: {
      virtuals: true,
      transform: (_: IPost, ret: Record<string, unknown>) => {
        delete ret.createdById;
        delete ret._id;
        return ret;
      },
    },
    toJSON: {
      virtuals: true,
      transform: (_: IPost, ret: Record<string, unknown>) => {
        delete ret.createdById;
        delete ret._id;
        return ret;
      },
    },
    timestamps: true,
  }
);

postSchema.virtual("createdBy", {
  ref: "User",
  localField: "createdById",
  foreignField: "_id",
  justOne: true,
});

postSchema.virtual("quotedPost", {
  ref: "Post",
  localField: "quotedPostId",
  foreignField: "_id",
  justOne: true,
});

postSchema.virtual("loggedInUserActionState", {
  ref: "PostStats",
  localField: "_id",
  foreignField: "postId",
  justOne: true,
});

postSchema
  .virtual("repliesCount")
  .get(function () {
    return this._repliesCount;
  })
  .set(function (value) {
    this._repliesCount = value;
  });

postSchema
  .virtual("repostsCount")
  .get(function () {
    return this._repostsCount;
  })
  .set(function (value) {
    this._repostsCount = value;
  });

postSchema
  .virtual("likesCount")
  .get(function () {
    return this._likesCount;
  })
  .set(function (value) {
    this._likesCount = value;
  });

postSchema
  .virtual("viewsCount")
  .get(function () {
    return this._viewsCount;
  })
  .set(function (value) {
    this._viewsCount = value;
  });

postSchema.index({ createdAt: -1 });
postSchema.index({ userId: 1 });
postSchema.index({ schedule: 1 }, { partialFilterExpression: { schedule: { $exists: true } } });

postSchema.pre("save", function (this: Document, next: (err?: Error) => void) {
  const createValidationError = (message: string) => {
    const err = new AppError(message, 400);
    err.name = "ValidationError";
    return err;
  };

  const hasValidContent = () => {
    return Boolean(
      this.get("text") ||
        this.get("gif") ||
        (this.get("imgs")?.length ?? 0) > 0 ||
        this.get("poll") ||
        this.get("videoUrl")
    );
  };

  const hasValidSchedule = () => {
    if (this.get("schedule") < new Date()) return "Schedule cannot be in the past";
    if (this.get("poll")) return "Post with poll cannot be scheduled";
    return "valid";
  };

  if (!hasValidContent()) {
    next(createValidationError("At least one of text, gif, imgs, or poll is required"));
    return;
  }

  // schedule needs to be validated before poll, because poll validation depends on schedule
  if (this.get("schedule")) {
    const scheduleValidation = hasValidSchedule();
    if (scheduleValidation !== "valid") {
      next(createValidationError(scheduleValidation));
      return;
    }
  }

  if (this.get("poll")) {
    const text = this.get("text");
    if (text) next();
    next(createValidationError("Poll must have a question in the text field"));
    return;
  }

  next();
});

postSchema.pre<IPost>("validate", function (next) {
  if (this.imgs && this.imgs.length > 0) {
    this.imgs.forEach((img, index) => {
      img.sortOrder = index + 1;
    });
  }
  next();
});

postSchema.pre("save", function (this: Document, next: () => void) {
  const isPublic = this.get("schedule") === undefined && this.get("isDraft") === undefined;
  this.set("isPublic", isPublic);
  next();
});

postSchema.pre("save", function (this: Document, next: () => void) {
  // Trimming last occurence of videoUrl from text
  const videoUrl = this.get("videoUrl");
  if (!videoUrl) next();

  const postText = this.get("text");
  if (!postText) next();

  const idx = postText.lastIndexOf(videoUrl);
  if (idx !== -1) {
    const trimmedText = postText.slice(0, idx) + postText.slice(idx + videoUrl.length);
    this.set("text", trimmedText);
  }
  next();
});

postSchema.post("save", async function (doc: IPost) {
  if (!doc) return;
  await populatePostData(doc);
});

postSchema.pre(/^find/, async function (this: Query<Document, Post>, next: (err?: Error) => void) {
  this.find({ isPublic: true });
  const { isBlocked } = this.getOptions();
  if (isBlocked) return next();
  const blockedUserIds = await userRelationService.getBlockedUserIds();
  this.find({ createdById: { $nin: blockedUserIds } });
  next();
});

postSchema.post(/^find/, async function (this: Query<Post[], Post & Document>, res) {
  const options = this.getOptions();
  if (!res || options.skipHooks) return;
  const isResArray = Array.isArray(res);
  if (isResArray) await populatePostData(...res);
  else await populatePostData(res);
});

postSchema.pre("findOneAndDelete", async function (this: Query<Post & Document, Post>, next) {
  const query = await this.getQuery();
  if (!query) return;
  await PostBookmarkModel.deleteMany({ postId: query._id });
  await PostLikeModel.deleteMany({ postId: query._id });
  await PostStatsModel.deleteMany({ postId: query._id });
  await RepostModel.deleteMany({ postId: query._id });
  next();
});

const PostModel = mongoose.model<IPostDoc>("Post", postSchema);

export { PostModel, postSchema };
