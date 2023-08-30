import mongoose, { InferSchemaType, Model } from "mongoose";

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
    isBlockedFromPost: {
      type: Boolean,
      default: false,
    },
    isMutedFromPost: {
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
    isPostLinkCopied: {
      type: Boolean,
      default: false,
    },
    isPostShared: {
      type: Boolean,
      default: false,
    },
    isPostSendInMessage: {
      type: Boolean,
      default: false,
    },
    isPostBookmarked: {
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

type IPostStats = InferSchemaType<typeof postStatsSchema>;
const PostStatsModel: Model<IPostStats> = mongoose.model(
  "PostStats",
  postStatsSchema,
  "post_stats"
);

export { PostStatsModel };
