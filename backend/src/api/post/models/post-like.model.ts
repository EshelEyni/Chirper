import { ObjectId } from "mongodb";
import mongoose, { Model } from "mongoose";

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

interface IPostLikeBase {
  postId: ObjectId;
  userId: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

interface IPostLikeDoc extends IPostLikeBase, mongoose.Document {}

const PostLikeModel: Model<IPostLikeDoc> = mongoose.model<IPostLikeDoc>(
  "PostLike",
  postLikeSchema,
  "post_likes"
);

export { PostLikeModel };
