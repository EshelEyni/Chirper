import mongoose, { Document } from "mongoose";

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

const RepostModel = mongoose.model("Repost", repostSchema);

export { RepostModel };
