import { ObjectId } from "mongodb";
import mongoose, { Document, Model, Query } from "mongoose";
import { Post } from "../../../../shared/types/post";
import { PostModel } from "../post/postModel";
import { queryEntityExistsById } from "../../services/util/utilService";
import { UserModel } from "../user/userModel";

interface IPostBookmark {
  postId: ObjectId;
  userId: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

interface IIPostBookmarkDoc extends IPostBookmark, mongoose.Document {
  post: Post;
}

const postBookmarkSchema = new mongoose.Schema(
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
    },
    toJSON: {
      virtuals: true,
    },
    timestamps: true,
  }
);

postBookmarkSchema.virtual("post", {
  ref: "Post",
  localField: "postId",
  foreignField: "_id",
  justOne: true,
});

postBookmarkSchema.index({ userId: 1, postId: 1 }, { unique: true });

postBookmarkSchema.post("save", async function (doc: Document) {
  if (!doc) return;
  await doc.populate("post");
});

postBookmarkSchema.post(
  /^find/,
  async function (this: Query<IIPostBookmarkDoc[], IIPostBookmarkDoc>, res): Promise<void> {
    const options = this.getOptions();
    if (!res || options.skipHooks) return;
    const isResArray = Array.isArray(res);

    if (isResArray) {
      const docs = res;
      for (const doc of docs) await doc.populate("post");
    } else {
      const doc = res as IIPostBookmarkDoc;
      if (!doc) return;
      await doc.populate("post");
    }
  }
);

const PostBookmarkModel: Model<IIPostBookmarkDoc> = mongoose.model<IIPostBookmarkDoc>(
  "PostBookmarkModel",
  postBookmarkSchema,
  "post_bookmarks"
);

export { PostBookmarkModel, IIPostBookmarkDoc as IBookmarkedPostDoc };
