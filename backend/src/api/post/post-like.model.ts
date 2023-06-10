import mongoose from "mongoose";

const postLikeSchema = new mongoose.Schema(
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
  },
  {
    timestamps: true,
  }
);

postLikeSchema.index({ postId: 1, userId: 1 }, { unique: true });

const PostLikeModel = mongoose.model("PostLike", postLikeSchema, "post_likes");

export { PostLikeModel };
