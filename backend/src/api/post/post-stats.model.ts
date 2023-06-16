import mongoose from "mongoose";

const postStatsSchema = new mongoose.Schema(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Post",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    isViewed: {
      type: Boolean,
      default: true,
    },
    isDetailedViewed: {
      type: Boolean,
      default: false,
    },
    isProfileViewed: {
      type: Boolean,
      default: false,
    },
    isFollowedFromPost: {
      type: Boolean,
      default: false,
    },
    isHashTagClicked: {
      type: Boolean,
      default: false,
    },
    isLinkClicked: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

postStatsSchema.index({ postId: 1, userId: 1 }, { unique: true });
postStatsSchema.index({ postId: 1 });

const PostStatsModel = mongoose.model("PostStats", postStatsSchema, "post_stats");

export { PostStatsModel };
