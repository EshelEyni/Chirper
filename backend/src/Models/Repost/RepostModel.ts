import { ObjectId } from "mongodb";
import mongoose, { Document, Model, Query, Schema } from "mongoose";
import { Post } from "../../../../shared/types/post";
import { IRepostDoc } from "../../types/iTypes";
import { queryEntityExistsById } from "../../services/util/utilService";
import { UserModel } from "../../models/user/userModel";
import { PostModel } from "../post/postModel";

const repostSchema: Schema<IRepostDoc> = new mongoose.Schema(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
      validate: {
        validator: async (id: ObjectId) => queryEntityExistsById(PostModel, { _id: id }),
        message: "Referenced post does not exist",
      },
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      validate: {
        validator: async (id: ObjectId) => queryEntityExistsById(UserModel, { _id: id }),
        message: "Referenced user does not exist",
      },
    },
  },
  {
    toObject: {
      virtuals: true,
      transform: (_: Document, ret: Record<string, unknown>) => {
        delete ret.userId;
        delete ret._id;

        const post = ret.post as Post;
        const repost = { ...post, repostedBy: ret.repostedBy };

        return { repost, post };
      },
    },
    toJSON: {
      virtuals: true,
      transform: (_: Document, ret: Record<string, unknown>) => {
        delete ret.userId;
        delete ret._id;

        const post = ret.post as Post;
        const repost = { ...post, repostedBy: ret.repostedBy };

        return { repost, post };
      },
    },
    timestamps: true,
  }
);

repostSchema.virtual("repostedBy", {
  ref: "User",
  localField: "userId",
  foreignField: "_id",
  justOne: true,
});

repostSchema.virtual("post", {
  ref: "Post",
  localField: "postId",
  foreignField: "_id",
  justOne: true,
});

repostSchema.index({ userId: 1, postId: 1 }, { unique: true });
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
        await doc.populate("repostedBy");
        await doc.populate("post");
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
