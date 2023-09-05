import mongoose, { Query, Schema } from "mongoose";
import { IPost, postSchema } from "./post.model";
import { populatePostData } from "./populate-post-data";
import { PromotionalPost } from "../../../../../../shared/interfaces/post.interface";

export interface IPromotionalPost extends IPost {
  isPromotional: boolean;
  companyName: string;
  linkToSite: string;
  linkToRepo?: string;
}

const promotionalPostSchema: Schema<IPromotionalPost> = new mongoose.Schema(
  {
    ...postSchema.obj,
    isPromotional: {
      type: Boolean,
      default: true,
    },
    companyName: {
      type: String,
      required: [true, "Please provide a company name"],
    },
    linkToSite: {
      type: String,
      required: [true, "Please provide a link to your site"],
    },
    linkToRepo: {
      type: String,
    },
  },
  {
    timestamps: true,
    toObject: {
      virtuals: true,
      transform: (_: Document, ret: Record<string, unknown>) => {
        delete ret.createdById;
        delete ret._id;
        return ret;
      },
    },
    toJSON: {
      virtuals: true,
      transform: (_: Document, ret: Record<string, unknown>) => {
        delete ret.createdById;
        delete ret._id;
        return ret;
      },
    },
  }
);

promotionalPostSchema.virtual("createdBy", {
  ref: "User",
  localField: "createdById",
  foreignField: "_id",
  justOne: true,
});

promotionalPostSchema.virtual("loggedInUserActionState", {
  ref: "PostStats",
  localField: "_id",
  foreignField: "postId",
  justOne: true,
});

promotionalPostSchema
  .virtual("repliesCount")
  .get(function () {
    return this._repliesCount;
  })
  .set(function (value) {
    this._repliesCount = value;
  });

promotionalPostSchema
  .virtual("repostsCount")
  .get(function () {
    return this._repostsCount;
  })
  .set(function (value) {
    this._repostsCount = value;
  });

promotionalPostSchema
  .virtual("likesCount")
  .get(function () {
    return this._likesCount;
  })
  .set(function (value) {
    this._likesCount = value;
  });

promotionalPostSchema
  .virtual("viewsCount")
  .get(function () {
    return this._viewsCount;
  })
  .set(function (value) {
    this._viewsCount = value;
  });

promotionalPostSchema.post(
  /^find/,
  async function (this: Query<PromotionalPost[], PromotionalPost & Document>, res) {
    const options = this.getOptions();
    if (!res || options.skipHooks) return;
    const isResArray = Array.isArray(res);
    if (isResArray) await populatePostData(...res);
    else await populatePostData(res);
  }
);

const PromotionalPostModel = mongoose.model<IPromotionalPost>(
  "PromotionalPost",
  promotionalPostSchema,
  "promotional_posts"
);

export { PromotionalPostModel };
