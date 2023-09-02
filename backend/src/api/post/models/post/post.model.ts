import mongoose, { Document, Query, Schema } from "mongoose";
import { gifSchema } from "../../../gif/model/gif.model";
import {
  Poll,
  Post,
  PostImg,
  repliedPostDetails,
} from "../../../../../../shared/interfaces/post.interface";
import { Gif } from "../../../../../../shared/interfaces/gif.interface";
import { Location } from "../../../../../../shared/interfaces/location.interface";
import userRelationService from "../../../user/services/user-relation/user-relation.service";
import postUtilService from "../../services/util/util.service";
import { UserModel } from "../../../user/models/user/user.model";
import { PostStatsModel } from "../post-stats/post-stats.model";
import { RepostModel } from "../repost/repost.model";
import {
  imgsSchema,
  locationSchema,
  pollSchema,
  repliedPostDetailsSchema,
} from "./post-sub-schemas";
import { ObjectId } from "mongodb";
import { AppError } from "../../../../services/error/error.service";

export interface IPost extends Document {
  audience: string;
  repliersType: string;
  isPublic: boolean;
  isDraft?: boolean;
  isPinned: boolean;
  previousThreadPostId?: string;
  repliedPostDetails?: repliedPostDetails[];
  createdById: mongoose.Schema.Types.ObjectId;
  text?: string;
  imgs?: PostImg[];
  videoUrl?: string;
  gif?: Gif;
  poll?: Poll;
  schedule?: Date;
  location?: Location;
  quotedPostId?: string;
  _repliesCount: number;
  _repostsCount: number;
  _likesCount: number;
  _viewsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const postSchema: Schema<IPost> = new mongoose.Schema(
  {
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
    previousThreadPostId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      validate: {
        validator: async (id: Post["previousThreadPostId"]) =>
          !!(await mongoose.models.Post.findById({ _id: id })),
        message: "Referenced post does not exist",
      },
    },
    repliedPostDetails: [repliedPostDetailsSchema],
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
  await _populatePostData(doc);
});

postSchema.pre(/^find/, async function (this: Query<Document, Post>, next: (err?: Error) => void) {
  this.find({ isPublic: true });

  const { isBlocked } = this.getOptions();
  if (isBlocked) next();
  const blockedUserIds = await userRelationService.getBlockedUserIds();
  this.find({ createdById: { $nin: blockedUserIds } });

  next();
});

postSchema.post(/^find/, async function (this: Query<Post[], Post & Document>, res) {
  const options = this.getOptions();
  if (!res || options.skipHooks) return;
  const isResArray = Array.isArray(res);

  if (isResArray) {
    const docs = res;
    await _populatePostData(...docs);
  } else {
    const doc = res;
    await _populatePostData(doc);
  }
});

async function _populatePostData(...docs: IPost[]) {
  //TODO: populate quoted post and poll stats and replier details as well
  if (!docs.length) return;
  const {
    userIds,
    postIds,
    // quotedPostIds
  } = _getUserAndPostIds(docs);

  const users = await UserModel.find({ _id: { $in: userIds } });
  const loggedInUserStatesMap = await postUtilService.getPostLoggedInUserActionState(...postIds);

  const { repostCountsMap, repliesCountMap, likesCountsMap, viewsCountsMap } = await _getPostStats(
    ...postIds
  );

  for (const doc of docs) {
    const currCreatedById = doc.get("createdById").toString();
    const currPostId = doc.get("_id").toString();

    const user = users.find(user => user._id.toString() === currCreatedById);
    doc.set("createdBy", user);
    doc.set("loggedInUserActionState", loggedInUserStatesMap[currPostId]);

    doc._repostsCount = repostCountsMap.get(currPostId) ?? 0;
    doc._repliesCount = repliesCountMap.get(currPostId) ?? 0;
    doc._likesCount = likesCountsMap.get(currPostId) ?? 0;
    doc._viewsCount = viewsCountsMap.get(currPostId) ?? 0;
  }
}

function _getUserAndPostIds(docs: Document[]) {
  const userIds = new Set<string>();
  const postIds = [];
  const quotedPostIds = [];

  for (const doc of docs) {
    const userIdStr = doc.get("createdById").toString();
    const postIdStr = doc.get("_id").toString();
    const quotedPostIdStr = doc.get("quotedPostId")?.toString();

    userIds.add(userIdStr);
    postIds.push(postIdStr);
    if (quotedPostIdStr) quotedPostIds.push(quotedPostIdStr);
  }

  return { userIds: Array.from(userIds), postIds, quotedPostIds };
}

async function _getPostStats(...ids: string[]) {
  const repostCounts = await RepostModel.aggregate([
    { $match: { postId: { $in: ids } } },
    { $group: { _id: "$postId", repostCount: { $sum: 1 } } },
  ]);

  const likesCounts = await PostStatsModel.aggregate([
    { $match: { postId: { $in: ids } } },
    { $group: { _id: "$postId", likesCount: { $sum: 1 } } },
  ]);

  const viewsCounts = await PostStatsModel.aggregate([
    { $match: { postId: { $in: ids } } },
    { $group: { _id: "$postId", viewsCount: { $sum: 1 } } },
  ]);

  const repliesCount = await PostModel.aggregate([
    { $match: { previousThreadPostId: { $in: ids } } },
    { $group: { _id: "$previousThreadPostId", repliesCount: { $sum: 1 } } },
  ]);

  const repostCountsMap = new Map(repostCounts.map(({ _id, repostCount }) => [_id, repostCount]));
  const likesCountsMap = new Map(likesCounts.map(({ _id, likesCount }) => [_id, likesCount]));
  const viewsCountsMap = new Map(viewsCounts.map(({ _id, viewsCount }) => [_id, viewsCount]));
  const repliesCountMap = new Map(repliesCount.map(({ _id, repliesCount }) => [_id, repliesCount]));

  return { repostCountsMap, likesCountsMap, viewsCountsMap, repliesCountMap };
}

// TODO: Fully implement this with tests, also implement tests in schema.test.ts
// async function _populateQuotedPost(...docs: Document[]) {
//   if (!docs.length) return;

//   for (const doc of docs) {
//     const isQuotedPost = doc.get("quotedPostId");
//     if (!isQuotedPost) continue;

//     const populatedDoc = await doc.populate("quotedPost", {
//       _id: 1,
//       text: 1,
//       videoUrl: 1,
//       gif: 1,
//       poll: 1,
//       imgs: 1,
//       isPublic: 1,
//       audience: 1,
//       repliersType: 1,
//       createdAt: 1,
//       createdById: 1,
//     });

//     const currCreatedById = doc.get("quotedPost.createdById").toString();
//     const createdBy = await UserModel.findById(currCreatedById)
//     populatedDoc.set("quotedPost.createdBy", createdBy);
//   }
// }

const PostModel = mongoose.model("Post", postSchema);

export { PostModel, postSchema };