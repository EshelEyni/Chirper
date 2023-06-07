import mongoose from "mongoose";

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
    timestamps: true,
  }
);

repostSchema.index({ postId: 1, repostOwnerId: 1 }, { unique: true });
repostSchema.index({ repostOwnerId: 1 });
repostSchema.index({ postId: 1 });

const RepostModel = mongoose.model("Repost", repostSchema);

export { RepostModel };
