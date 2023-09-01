import { ObjectId } from "mongodb";
import mongoose, { Document, Model, Query, Schema } from "mongoose";
import { queryEntityExists } from "../../../../services/util/util.service";
import { UserModel } from "../../../user/models/user/user.model";
import { PostModel } from "../post/post.model";

interface IRepostBase {
  postId: ObjectId;
  repostOwnerId: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

interface IRepostDoc extends IRepostBase, Document {}

const repostSchema: Schema<IRepostDoc> = new mongoose.Schema(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
      validate: {
        validator: async (id: ObjectId) => queryEntityExists(PostModel, { _id: id }),
        message: "Referenced post does not exist",
      },
    },

    repostOwnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      validate: {
        validator: async (id: ObjectId) => queryEntityExists(UserModel, { _id: id }),
        message: "Referenced user does not exist",
      },
    },
  },
  {
    toObject: {
      virtuals: true,
      transform: (doc: Document, ret: Record<string, unknown>) => {
        delete ret.repostOwnerId;
        delete ret._id;
        return ret;
      },
    },
    toJSON: {
      virtuals: true,
      transform: (doc: Document, ret: Record<string, unknown>) => {
        delete ret.repostOwnerId;
        delete ret._id;
        return ret;
      },
    },
    timestamps: true,
  }
);

repostSchema.virtual("repostedBy", {
  ref: "User",
  localField: "repostOwnerId",
  foreignField: "_id",
  justOne: true,
});

repostSchema.virtual("post", {
  ref: "Post",
  localField: "postId",
  foreignField: "_id",
  justOne: true,
});

repostSchema.index({ postId: 1, repostOwnerId: 1 }, { unique: true });
repostSchema.index({ repostOwnerId: 1 });
repostSchema.index({ postId: 1 });

repostSchema.post("save", async function (doc: Document) {
  if (!doc) return;
  await doc.populate("post");
  await doc.populate("repostedBy");
});

repostSchema.post(
  /^find/,
  async function (this: Query<IRepostDoc[], IRepostDoc>, res): Promise<void> {
    const options = this.getOptions();
    if (!res || options.skipHooks) return;
    const isResArray = Array.isArray(res);

    if (isResArray) {
      const docs = res;
      for (const doc of docs) {
        await doc.populate("post");
        await doc.populate("repostedBy");
      }
    } else {
      const doc = res as IRepostDoc;
      if (!doc) return;
      await doc.populate("post");
      await doc.populate("repostedBy");
    }
  }
);

const RepostModel: Model<IRepostDoc> = mongoose.model<IRepostDoc>("Repost", repostSchema);

export { RepostModel };
