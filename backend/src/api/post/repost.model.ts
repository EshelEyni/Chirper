import { ObjectId } from "mongodb";
import mongoose, { Document, Model } from "mongoose";

const repostSchema = new mongoose.Schema(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },

    repostOwnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
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

repostSchema.index({ postId: 1, repostOwnerId: 1 }, { unique: true });
repostSchema.index({ repostOwnerId: 1 });
repostSchema.index({ postId: 1 });

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

interface IRepostBase {
  postId: ObjectId;
  repostOwnerId: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

interface IRepostDoc extends IRepostBase, Document {}

const RepostModel: Model<IRepostDoc> = mongoose.model<IRepostDoc>("Repost", repostSchema);

export { RepostModel };
