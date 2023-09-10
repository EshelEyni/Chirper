import { ObjectId } from "mongodb";
import mongoose, { Document, Model, Query, Schema } from "mongoose";
import { Post } from "../../../../shared/types/post";
import { queryEntityExists } from "../../services/util/utilService";
import { PostModel } from "../post/postModel";
import { UserModel } from "../../models/user/userModel";

interface IPostLikeBase {
  postId: ObjectId;
  userId: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

interface IPostLikeDoc extends IPostLikeBase, mongoose.Document {
  post: Post;
}

const postLikeSchema: Schema<IPostLikeDoc> = new mongoose.Schema(
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
  },
  {
    toObject: {
      virtuals: true,
    },
    toJSON: {
      virtuals: true,
    },
    timestamps: true,
  }
);

postLikeSchema.virtual("post", {
  ref: "Post",
  localField: "postId",
  foreignField: "_id",
  justOne: true,
});

postLikeSchema.index({ postId: 1, userId: 1 }, { unique: true });
postLikeSchema.index({ userId: 1 });

postLikeSchema.post("save", async function (doc: Document) {
  if (!doc) return;
  await doc.populate("post");
});

postLikeSchema.post(
  /^find/,
  async function (this: Query<IPostLikeDoc[], IPostLikeDoc>, res): Promise<void> {
    const options = this.getOptions();
    if (!res || options.skipHooks) return;
    const isResArray = Array.isArray(res);

    if (isResArray) {
      const docs = res;
      for (const doc of docs) await doc.populate("post");
    } else {
      const doc = res as IPostLikeDoc;
      if (!doc) return;
      await doc.populate("post");
    }
  }
);

const PostLikeModel: Model<IPostLikeDoc> = mongoose.model<IPostLikeDoc>(
  "PostLike",
  postLikeSchema,
  "post_likes"
);

export { PostLikeModel };
