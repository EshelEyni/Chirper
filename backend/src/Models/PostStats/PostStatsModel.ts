import { ObjectId } from "mongodb";
import mongoose, { Model, Schema } from "mongoose";
import { queryEntityExists } from "../../services/util/utilService";
import { PostModel } from "../post/postModel";
import { UserModel } from "../../models/user/userModel";

type IPostStats = {
  postId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  isViewed: boolean;
  isDetailedViewed: boolean;
  isProfileViewed: boolean;
  isFollowedFromPost: boolean;
  isBlockedFromPost: boolean;
  isMutedFromPost: boolean;
  isHashTagClicked: boolean;
  isLinkClicked: boolean;
  isPostLinkCopied: boolean;
  isPostShared: boolean;
  isPostSendInMessage: boolean;
  isPostBookmarked: boolean;
  createdAt: Date;
  updatedAt: Date;
};

const postStatsSchema: Schema<IPostStats> = new mongoose.Schema(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Post",
      validate: {
        validator: async (id: ObjectId) => queryEntityExists(PostModel, { _id: id }),
        message: "Referenced post does not exist",
      },
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
      validate: {
        validator: async (id: ObjectId) => queryEntityExists(UserModel, { _id: id }),
        message: "Referenced user does not exist",
      },
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

const PostStatsModel: Model<IPostStats> = mongoose.model(
  "PostStats",
  postStatsSchema,
  "post_stats"
);

export { PostStatsModel };
