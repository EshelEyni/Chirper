import { ObjectId } from "mongodb";
import mongoose, { Document, Model, Query } from "mongoose";
import { PostModel } from "../post/post.model";
import { queryEntityExists } from "../../../../services/util/util.service";
import { UserModel } from "../../../user/models/user/user.model";
import { Post } from "../../../../../../shared/interfaces/post.interface";

interface IBookmarkedPostBase {
  postId: ObjectId;
  bookmarkOwnerId: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

interface IBookmarkedPostDoc extends IBookmarkedPostBase, mongoose.Document {
  post: Post;
}

const bookmarkedPostSchema = new mongoose.Schema(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
      validate: {
        validator: async (id: ObjectId) => queryEntityExists(PostModel, { _id: id }),
        message: "Referenced post does not exist",
      },
    },

    bookmarkOwnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
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

bookmarkedPostSchema.virtual("post", {
  ref: "Post",
  localField: "postId",
  foreignField: "_id",
  justOne: true,
});

bookmarkedPostSchema.index({ postId: 1, bookmarkOwnerId: 1 }, { unique: true });
bookmarkedPostSchema.index({ bookmarkOwnerId: 1 });

bookmarkedPostSchema.post("save", async function (doc: Document) {
  if (!doc) return;
  await doc.populate("post");
});

bookmarkedPostSchema.post(
  /^find/,
  async function (this: Query<IBookmarkedPostDoc[], IBookmarkedPostDoc>, res): Promise<void> {
    const options = this.getOptions();
    if (!res || options.skipHooks) return;
    const isResArray = Array.isArray(res);

    if (isResArray) {
      const docs = res;
      for (const doc of docs) await doc.populate("post");
    } else {
      const doc = res as IBookmarkedPostDoc;
      if (!doc) return;
      await doc.populate("post");
    }
  }
);

const BookmarkedPostModel: Model<IBookmarkedPostDoc> = mongoose.model<IBookmarkedPostDoc>(
  "BookmarkedPost",
  bookmarkedPostSchema,
  "bookmarked_posts"
);

export { BookmarkedPostModel, IBookmarkedPostDoc };
